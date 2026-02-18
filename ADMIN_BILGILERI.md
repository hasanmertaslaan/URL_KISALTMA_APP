# 👤 Admin Giriş Bilgileri

## Admin Kullanıcı Bilgileri

**Email:** `admin@urlshortener.com`  
**Şifre:** `admin123`

## 🔧 Admin Kullanıcısını Oluşturma

Eğer admin kullanıcısı yoksa, şu endpoint'i kullanarak oluşturabilirsiniz:

**POST** `https://your-app.onrender.com/api/admin/create`

Veya tarayıcıda şu URL'yi açın:
```
https://your-app.onrender.com/api/admin/info
```

## 📝 Giriş Yapma

1. Ana sayfaya gidin
2. "Giriş Yap" sekmesine tıklayın
3. Email: `admin@urlshortener.com`
4. Şifre: `admin123`
5. "Giriş Yap" butonuna tıklayın

## ⚠️ Sorun Giderme

### Admin girişi çalışmıyorsa:

1. **Admin kullanıcısını oluşturun:**
   - Tarayıcıda: `https://your-app.onrender.com/api/admin/create` adresine gidin
   - Veya Postman/curl ile POST isteği gönderin

2. **Veritabanını kontrol edin:**
   - Render'da veritabanı dosyası (`urlshortener.db`) her deploy'da sıfırlanabilir
   - Admin kullanıcısını tekrar oluşturmanız gerekebilir

3. **Logs kontrol edin:**
   - Render dashboard → Logs sekmesi
   - Hata mesajlarını kontrol edin

## 🔐 Güvenlik Notu

**ÖNEMLİ:** Production ortamında admin şifresini değiştirmeniz önerilir!

Şifreyi değiştirmek için:
1. Veritabanına bağlanın
2. Admin kullanıcısının şifresini bcrypt ile hash'leyin
3. Veritabanında güncelleyin

Veya yeni bir admin kullanıcısı oluşturun ve eski admin'i silin.

