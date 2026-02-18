# 🚀 Render.com'da Deploy - Adım Adım

## 1️⃣ GitHub Repo'yu Bağla

1. Render dashboard'da **"New +"** butonuna tıkla
2. **"Web Service"** seç
3. GitHub repo'nuzu seç (eğer görünmüyorsa "Configure account" ile bağla)
4. Repo'yu seçtikten sonra **"Connect"** tıkla

## 2️⃣ Ayarları Doldur

**Temel Ayarlar:**
- **Name**: `url-shortener` (veya istediğin isim)
- **Region**: `Frankfurt` (veya en yakın bölge)
- **Branch**: `main` (veya `master`)

**Build & Deploy:**
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

**Plan:**
- **Free** seç (başlangıç için yeterli)

## 3️⃣ Environment Variables Ekle

**"Advanced"** bölümüne git veya aşağıda **"Environment Variables"** bölümüne:

**Eklemek gereken değişkenler:**

1. **JWT_SECRET**
   - Key: `JWT_SECRET`
   - Value: Güçlü bir rastgele string (örn: `MySuperSecretKey123!@#$%^&*()`)
   - **ÖNEMLİ:** Bu anahtarı kimseyle paylaşma!

2. **NODE_ENV** (opsiyonel)
   - Key: `NODE_ENV`
   - Value: `production`

**Nasıl eklenir:**
- **"Add Environment Variable"** butonuna tıkla
- Key ve Value'yu gir
- **"Save Changes"** tıkla

## 4️⃣ Deploy Et!

1. Tüm ayarları kontrol et
2. **"Create Web Service"** butonuna tıkla
3. ⏳ 2-3 dakika bekle (build işlemi)
4. ✅ **Hazır!** URL'niz: `https://url-shortener.onrender.com`

## 5️⃣ İlk Kullanım

1. Tarayıcıda URL'nizi aç
2. **Admin girişi:**
   - Email: `admin@urlshortener.com`
   - Şifre: `admin123`
3. URL kısalt ve test et!

## ⚠️ Önemli Notlar

- **İlk deploy 2-3 dakika sürer**
- **Free plan'da uyku modu var** - ilk istekte 30 saniye bekleme olabilir
- **Logs:** Render dashboard'da "Logs" sekmesinden hataları görebilirsin
- **Environment Variables:** Değiştirdikten sonra "Manual Deploy" yap

## 🔄 Güncelleme

Kod değişikliği yaptığında:
1. GitHub'a push et
2. Render otomatik olarak yeniden deploy eder
3. Veya "Manual Deploy" butonuna tıkla

---

**Sorun mu var?** Render dashboard'da "Logs" sekmesine bak, hata mesajlarını kontrol et!

