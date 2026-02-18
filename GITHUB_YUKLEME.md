# 📤 GitHub'a Yükleme - Adım Adım

## 1️⃣ GitHub'da Yeni Repo Oluştur

1. **https://github.com** adresine git
2. Sağ üstte **"+"** → **"New repository"** tıkla
3. Bilgileri doldur:
   - **Repository name**: `url-shortener` (veya istediğin isim)
   - **Description**: "Para kazandıran URL kısaltma servisi"
   - **Public** seç (veya Private)
   - **"Initialize this repository with a README"** işaretleme!
4. **"Create repository"** tıkla

## 2️⃣ Terminal'de Komutları Çalıştır

Proje klasöründe (test klasörü) şu komutları sırayla çalıştır:

```bash
# Dosyaları ekle
git add .

# Commit yap
git commit -m "URL Shortener - Para Kazandıran Uygulama"

# GitHub repo URL'ini ekle (KULLANICI_ADIN ile değiştir)
git remote add origin https://github.com/KULLANICI_ADIN/url-shortener.git

# Branch'i main yap
git branch -M main

# GitHub'a yükle
git push -u origin main
```

**Not:** İlk kez push yapıyorsan, GitHub kullanıcı adı ve şifre (veya token) isteyebilir.

## 3️⃣ GitHub Token (Eğer Şifre Çalışmazsa)

Eğer şifre çalışmazsa:

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. **"Generate new token"** → **"Generate new token (classic)"**
3. İsim ver: `url-shortener-deploy`
4. **repo** seçeneğini işaretle
5. **"Generate token"** tıkla
6. Token'ı kopyala (bir daha gösterilmez!)
7. Push yaparken şifre yerine bu token'ı kullan

## ✅ Kontrol

GitHub'da repo'na git, dosyaların yüklendiğini gör!

---

**Sonraki Adım:** Render.com'a deploy et (QUICK_DEPLOY.md dosyasına bak)

