# 🚀 CANLIYA ALMA - ADIM ADIM REHBER

## ⚡ EN KOLAY YÖNTEM: Render.com (5 DAKİKA)

### 1️⃣ GitHub'a Yükleme

**Eğer Git yüklü değilse:**
- https://git-scm.com/download/win (Windows için)
- Kurulumdan sonra terminali yeniden açın

**Komutlar:**

```bash
# Proje klasöründe
git init
git add .
git commit -m "URL Shortener - Para Kazandıran Uygulama"

# GitHub'da yeni repo oluşturun: https://github.com/new
# Sonra:
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/url-shortener.git
git push -u origin main
```

### 2️⃣ Render.com'a Deploy

1. **https://render.com** → "Get Started for Free"
2. **GitHub ile giriş yapın**
3. **"New +"** → **"Web Service"** seçin
4. **GitHub repo'nuzu seçin**
5. **Ayarları doldurun:**
   ```
   Name: url-shortener
   Environment: Node
   Build Command: npm install
   Start Command: node server.js
   Plan: Free
   ```
6. **Environment Variables ekleyin:**
   - Key: `JWT_SECRET`
   - Value: Güçlü bir anahtar (örn: `MySecretKey123!@#$%^&*()`)
7. **"Create Web Service"** tıklayın
8. ⏳ 2-3 dakika bekleyin
9. ✅ **Hazır!** URL'niz: `https://url-shortener.onrender.com`

---

## 🎯 İLK KULLANIM

1. **Admin girişi:**
   - Email: `admin@urlshortener.com`
   - Şifre: `admin123`

2. **URL kısaltın ve paylaşın**

3. **Gelirleri takip edin** (Admin paneli)

---

## 💡 İPUÇLARI

- **Domain ekleme**: Render'da Settings → Custom Domain
- **SSL**: Otomatik (ücretsiz)
- **Backup**: Veritabanı otomatik yedeklenir
- **Monitoring**: Render dashboard'dan takip edin

---

## 🔄 Güncelleme

Kod değişikliği yaptığınızda:

```bash
git add .
git commit -m "Güncelleme"
git push
```

Render otomatik olarak yeniden deploy eder!

---

**Sorun mu var?** Render dashboard'dan logs'a bakın.

