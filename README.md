# 🔗 URL Kısaltıcı - Kendini Finanse Eden SaaS Uygulaması

Modern, güvenli ve premium özelliklerle donatılmış bir URL kısaltma servisi.

## ✨ Özellikler

### Ücretsiz Özellikler
- ✅ Hızlı URL kısaltma
- ✅ Kullanıcı kaydı ve girişi
- ✅ Kendi URL'lerinizi görüntüleme
- ✅ Temel tıklama sayısı

### Premium Özellikler ($9.99/ay)
- ⭐ Sınırsız URL kısaltma
- ⭐ Özel kod seçimi
- ⭐ Detaylı analitikler (IP, user agent, referer)
- ⭐ API erişimi
- ⭐ Reklamsız deneyim

## 🚀 Kurulum

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Sunucuyu başlatın:**
```bash
npm start
```

veya geliştirme modu için:
```bash
npm run dev
```

3. **Tarayıcıda açın:**
```
http://localhost:3000
```

## 💰 Monetizasyon Stratejisi

Bu uygulama aşağıdaki yöntemlerle gelir elde edebilir:

1. **Premium Abonelikler**: Aylık $9.99 ücretle premium özellikler
2. **Stripe Entegrasyonu**: Gerçek ödeme işlemleri için Stripe API entegrasyonu hazır
3. **API Kullanım Ücretleri**: Premium olmayan kullanıcılar için API rate limiting
4. **Reklam Gelirleri**: Ücretsiz kullanıcılar için reklam gösterimi (eklenebilir)

## 🔧 Teknolojiler

- **Backend**: Node.js, Express.js
- **Veritabanı**: SQLite
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Güvenlik**: JWT authentication, bcrypt password hashing
- **Rate Limiting**: Express rate limit

## 📝 API Endpoints

- `POST /api/register` - Kullanıcı kaydı
- `POST /api/login` - Kullanıcı girişi
- `POST /api/shorten` - URL kısaltma
- `GET /api/urls` - Kullanıcının URL'lerini listele
- `GET /api/analytics/:code` - URL analitikleri (Premium)
- `POST /api/premium/subscribe` - Premium üyelik satın alma
- `GET /:code` - URL yönlendirme

## 🔐 Güvenlik

- JWT token tabanlı kimlik doğrulama
- Bcrypt ile şifre hashleme
- Rate limiting ile API koruması
- SQL injection koruması (parametreli sorgular)

## 🎯 Gelecek Geliştirmeler

- [ ] Stripe gerçek ödeme entegrasyonu
- [ ] Email doğrulama
- [ ] Şifre sıfırlama
- [ ] QR kod oluşturma
- [ ] Toplu URL kısaltma
- [ ] API dokümantasyonu (Swagger)
- [ ] Mobil uygulama
- [ ] Reklam entegrasyonu

## 📄 Lisans

MIT License

## 💡 Notlar

- Demo amaçlı premium üyelik gerçek ödeme almaz
- Production ortamında JWT_SECRET değiştirilmelidir
- Stripe entegrasyonu için `.env` dosyasına `STRIPE_SECRET_KEY` eklenmelidir

