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
//CRUD İşlemleri için API Rotaları

// Sunucuyu Dinle
app.listen(PORT, () => {
    console.log(`Backend sunucusu http://localhost:${PORT} adresinde çalışıyor`);
});