# To-Do List Uygulaması

Bu proje, kullanıcıların hesap oluşturup giriş yapabildiği ve kişisel "yapılacaklar listesini" (To-Do List) yönetebildiği Fullstack bir web uygulamasıdır. Proje, modern web geliştirme süreçleri hakkında pratik deneyim kazanmayı hedefler ve temel frontend, backend, veritabanı teknolojilerinin bir arada kullanımını sergiler.

## Proje Amacı

* Kullanıcı kimlik doğrulama (kayıt ve giriş) sistemi sunmak.
* Giriş yapmış kullanıcılara özel, kişiselleştirilmiş To-Do listeleri sağlamak.
* To-Do öğeleri üzerinde temel CRUD (Oluşturma, Okuma, Güncelleme, Silme) operasyonlarını gerçekleştirmek.
* Güvenli şifre depolama (hashing) ve JWT (JSON Web Token) tabanlı yetkilendirme kullanmak.

## Teknolojiler

Bu proje aşağıdaki modern web teknolojilerini kullanmaktadır:

* **Frontend:** `React.js` (Kullanıcı arayüzü ve etkileşimi için)
    * `axios` (HTTP istekleri için)
    * `react-router-dom` (Sayfa yönlendirmesi için)
* **Backend:** `Node.js` (Runtime) ve `Express.js` (Web uygulaması çerçevesi)
    * `mongoose` (MongoDB ORM/ODM)
    * `bcryptjs` (Şifre hash'leme için)
    * `jsonwebtoken` (JWT oluşturma ve doğrulama için)
    * `dotenv` (Ortam değişkenlerini yönetmek için)
    * `cors` (Cross-Origin Resource Sharing için)
* **Veritabanı:** `MongoDB` (NoSQL veritabanı - MongoDB Atlas bulut servisi veya yerel kurulum kullanılabilir)
* **Versiyon Kontrolü:** `Git` ve `GitHub`

## Kurulum Talimatları

Projenin yerel geliştirme ortamınızda çalışır hale getirilmesi için aşağıdaki adımları sırasıyla izleyin.

### Ön Koşullar

Bu projeyi çalıştırmak için sisteminizde aşağıdaki yazılımların yüklü olması gerekmektedir:

* **Node.js** (v14.x veya üzeri önerilir) ve **npm** (Node.js ile birlikte gelir)
    * Sürüm kontrolü için: `node -v` ve `npm -v`
* **MongoDB Veritabanı:**
    * **Önerilen:** MongoDB Atlas (Bulut tabanlı ücretsiz katman).
    * **Alternatif:** Yerel MongoDB Community Server kurulumu.

### 1\. Projeyi Klonlama

Öncelikle projenin GitHub deposunu bilgisayarınıza klonlayın:

```bash
git clone <github-depo-adresiniz> # Kendi GitHub depo adresinizi buraya yapıştırın
cd todo-app
```

### 2\. Backend Kurulumu

`backend` klasörüne geçin ve gerekli bağımlılıkları yükleyin:

```bash
cd backend
npm install
```

#### `.env` Dosyası Oluşturma (Backend)

`backend` klasörünün içinde `.env` adında yeni bir dosya oluşturun ve aşağıdaki içeriği ekleyin:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string # MongoDB bağlantı dizginizi buraya yapıştırın
JWT_SECRET=your_super_secret_jwt_key      # Güçlü, rastgele bir sır anahtar girin
```

* **`MONGODB_URI`**:
    * **MongoDB Atlas kullanıyorsanız:** MongoDB Atlas web arayüzünden aldığınız bağlantı dizesini (`mongodb+srv://user:password@cluster.mongodb.net/...`) buraya yapıştırın. `<username>` ve `<password>` kısımlarını kendi oluşturduğunuz veritabanı kullanıcı adınız ve şifrenizle değiştirdiğinizden emin olun.
    * **Yerel MongoDB kullanıyorsanız:** Genellikle `mongodb://localhost:27017/todoapp` olacaktır.
* **`JWT_SECRET`**: Uygulamanızın JWT'leri imzalamak için kullanacağı gizli bir anahtardır. Güvenlik için uzun ve karmaşık bir dize seçin.

### 3\. Frontend Kurulumu

`frontend` klasörüne geçin ve gerekli bağımlılıkları yükleyin:

```bash
cd ../frontend # todo-app ana dizininden
npm install
```

## Projeyi Çalıştırma

Hem backend hem de frontend'i ayrı ayrı başlatmanız gerekmektedir.

### 1\. Backend Sunucusunu Başlatma

Ayrı bir terminal penceresi açın ve `backend` klasörüne gidin:

```bash
cd backend
node server.js
```

Sunucu başarıyla başladığında terminalde aşağıdaki mesajı görmelisiniz:
`MongoDB başarıyla bağlandı!`
`Backend sunucusu http://localhost:5000 adresinde çalışıyor`

### 2\. Frontend Uygulamasını Başlatma

Başka bir terminal penceresi açın ve `frontend` klasörüne gidin:

```bash
cd frontend
npm start
```

Bu komut React geliştirme sunucusunu başlatacak ve uygulamanın `http://localhost:3000` adresinde açılmasını sağlayacaktır. Tarayıcınız otomatik olarak açılmazsa, bu adresi manuel olarak ziyaret edin.

## Kullanım

Uygulama tarayıcınızda açıldığında:

1.  **Kayıt Olma:** "Kayıt Ol" sayfasına gidin, bir e-posta ve şifre ile yeni bir hesap oluşturun.
2.  **Giriş Yapma:** Oluşturduğunuz hesap bilgileriyle "Giriş Yap" sayfasına giderek sisteme giriş yapın. Başarılı girişten sonra "Yapılacaklar Listem" sayfasına yönlendirileceksiniz.
3.  **To-Do Ekleme:** Giriş alanına yeni bir görev yazıp "Ekle" butonuna tıklayarak listenize yeni görevler ekleyebilirsiniz.
4.  **To-Do Tamamlama:** Bir görevi tamamlandı olarak işaretlemek veya geri almak için yanındaki "Tamamlandı" / "Geri Al" butonunu kullanın.
5.  **To-Do Silme:** Bir görevi listeden kaldırmak için yanındaki "Sil" butonuna tıklayın.
6.  **Çıkış Yapma:** Oturumunuzu kapatmak için sağ üstteki "Çıkış Yap" butonunu kullanın.

## API Endpointleri

Bu uygulamanın backend'i aşağıdaki API endpoint'lerini sunmaktadır:

| Metot | Endpoint         | Açıklama                                                                                                       | Gereksinimler                                            |
| :---- | :--------------- | :------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------- |
| `POST`| `/signup`        | Yeni bir kullanıcı hesabı oluşturur.                                                                           | `email`, `password` (request body'de)                   |
| `POST`| `/login`         | Mevcut bir kullanıcıyı doğrular ve bir JWT (`token`) döndürür.                                                  | `email`, `password` (request body'de)                   |
| `POST`| `/todos`         | Giriş yapmış kullanıcının To-Do listesine yeni bir görev ekler.                                                | `content` (request body'de), `Authorization: Bearer <token>` |
| `GET` | `/todos`         | Giriş yapmış kullanıcının tüm To-Do'larını listeler.                                                          | `Authorization: Bearer <token>`                          |
| `PUT` | `/todos/:id`     | Belirtilen To-Do öğesini günceller (içerik veya tamamlanma durumu).                                             | `content`, `completed` (request body'de), `Authorization: Bearer <token>` |
| `DELETE`| `/todos/:id`     | Belirtilen To-Do öğesini siler.                                                                                | `Authorization: Bearer <token>`                          |

## Geliştirme Notları

* **Şifre Güvenliği:** Şifreler veritabanına `bcryptjs` ile hash'lenerek kaydedilir, bu da düz metin şifre depolamasından daha güvenlidir.
* **Yetkilendirme:** Kullanıcı kimlik doğrulama ve To-Do işlemlerinde `JWT` kullanılır. Yetkilendirme gerektiren her istekte `Authorization: Bearer <token>` başlığının gönderilmesi zorunludur.
* **CORS:** Geliştirme ortamında frontend ve backend'in farklı portlarda çalışması nedeniyle CORS sorunlarını önlemek için backend'de `cors` middleware'i kullanılmıştır.

