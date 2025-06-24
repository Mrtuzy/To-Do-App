require('dotenv').config(); // .env dosyasındaki değişkenleri yükle
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // Tüm kökenlerden gelen isteklere izin ver (geliştirme için)

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todoapp';
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

// Middleware'ler
app.use(cors());
app.use(express.json()); // JSON body'leri parse etmek için

// MongoDB Bağlantısı
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB başarıyla bağlandı!'))
    .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Veritabanı Modelleri
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // password_hash olarak depolanacak
});

// Şifreyi kaydetmeden önce hash'le
UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const User = mongoose.model('User', UserSchema);

const TodoSchema = new mongoose.Schema({
    content: { type: String, required: true },
    completed: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Todo = mongoose.model('Todo', TodoSchema);

// Middleware: Token doğrulama
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Yetkilendirme tokeni eksik!' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Geçersiz veya süresi dolmuş token!' });
        }
        req.user = user; // user objesi içinde { id: user._id } olacak
        next();
    });
};


// API Endpointleri

// Kullanıcı Yönetimi
// /signup: E-posta ve şifre ile yeni kullanıcı oluşturur.
app.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Bu e-posta zaten kayıtlı!' });
        }
        const newUser = new User({ email, password });
        await newUser.save();
        res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu!' });
    } catch (error) {
        res.status(500).json({ message: 'Kullanıcı oluşturulurken bir hata oluştu.', error: error.message });
    }
});

// /login: Kayıtlı kullanıcıyı doğrular ve başarılı girişte istemciye JWT (JSON Web Token) gibi bir yetkilendirme anahtarı döndürür.
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Geçersiz e-posta veya şifre!' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Geçersiz e-posta veya şifre!' });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' }); // 24 saat geçerli token
        res.status(200).json({ message: 'Giriş başarılı!', token });
    } catch (error) {
        res.status(500).json({ message: 'Giriş yapılırken bir hata oluştu.', error: error.message });
    }
});

// To-Do İşlemleri (CRUD) - Bu işlemler, sadece giriş yapmış (yetki anahtarına sahip) kullanıcılar tarafından yapılabilmelidir.

// Create: Giriş yapmış kullanıcının yeni bir "to-do" elemanı eklemesini sağlar.
app.post('/todos', authenticateToken, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ message: 'To-do içeriği boş olamaz!' });
        }
        const newTodo = new Todo({ content, user: req.user.id });
        await newTodo.save();
        res.status(201).json({ message: 'To-do başarıyla eklendi!', todo: newTodo });
    } catch (error) {
        res.status(500).json({ message: 'To-do eklenirken bir hata oluştu.', error: error.message });
    }
});

// Read: Giriş yapmış kullanıcının tüm "to-do" elemanlarını listeler.
app.get('/todos', authenticateToken, async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user.id });
        res.status(200).json({ todos });
    } catch (error) {
        res.status(500).json({ message: 'To-do\'lar getirilirken bir hata oluştu.', error: error.message });
    }
});

// Update: Mevcut bir "to-do" elemanının içeriğini veya tamamlanma durumunu günceller.
app.put('/todos/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { content, completed } = req.body;

        const todo = await Todo.findOneAndUpdate(
            { _id: id, user: req.user.id }, // Hem ID hem de kullanıcı ID'si ile eşleşmeli
            { content, completed },
            { new: true } // Güncellenmiş belgeyi geri döndür
        );

        if (!todo) {
            return res.status(404).json({ message: 'To-do bulunamadı veya yetkiniz yok!' });
        }
        res.status(200).json({ message: 'To-do başarıyla güncellendi!', todo });
    } catch (error) {
        res.status(500).json({ message: 'To-do güncellenirken bir hata oluştu.', error: error.message });
    }
});

// Delete: Bir "to-do" elemanını siler.
app.delete('/todos/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const todo = await Todo.findOneAndDelete({ _id: id, user: req.user.id }); // Hem ID hem de kullanıcı ID'si ile eşleşmeli
        console.log(id);
        console.log(req.user.id);
        if (!todo) {
            return res.status(404).json({ message: 'To-do bulunamadı veya yetkiniz yok!' });
        }
        res.status(200).json({ message: 'To-do başarıyla silindi!' });
    } catch (error) {
        res.status(500).json({ message: 'To-do silinirken bir hata oluştu.', error: error.message });
    }
});
// Sunucuyu Dinle
app.listen(PORT, () => {
    console.log(`Backend sunucusu http://localhost:${PORT} adresinde çalışıyor`);
});