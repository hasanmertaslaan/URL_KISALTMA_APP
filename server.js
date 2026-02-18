const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Production için güvenlik ayarları
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Reverse proxy için
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Veritabanı bağlantısı
const db = new sqlite3.Database('./urlshortener.db', (err) => {
  if (err) {
    console.error('Veritabanı bağlantı hatası:', err.message);
  } else {
    console.log('Veritabanına bağlandı');
    initializeDatabase();
  }
});

// Veritabanı tablolarını oluştur
function initializeDatabase() {
  db.serialize(() => {
    // Kullanıcılar tablosu
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_premium INTEGER DEFAULT 0,
      premium_until TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // URL'ler tablosu
    db.run(`CREATE TABLE IF NOT EXISTS urls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      original_url TEXT NOT NULL,
      short_code TEXT UNIQUE NOT NULL,
      custom_code TEXT,
      click_count INTEGER DEFAULT 0,
      is_premium INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Tıklama geçmişi tablosu
    db.run(`CREATE TABLE IF NOT EXISTS clicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url_id INTEGER NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      referer TEXT,
      clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (url_id) REFERENCES urls(id)
    )`);

    // Ödeme geçmişi tablosu
    db.run(`CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      status TEXT,
      stripe_payment_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Gelir takibi tablosu
    db.run(`CREATE TABLE IF NOT EXISTS revenue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url_id INTEGER,
      revenue_type TEXT NOT NULL,
      amount REAL DEFAULT 0,
      click_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (url_id) REFERENCES urls(id),
      FOREIGN KEY (click_id) REFERENCES clicks(id)
    )`);

    // Admin kullanıcısı oluştur (varsayılan)
    db.get('SELECT * FROM users WHERE email = ?', ['admin@urlshortener.com'], (err, admin) => {
      if (!admin) {
        bcrypt.hash('admin123', 10, (err, hash) => {
          if (!err) {
            db.run('INSERT INTO users (email, password, is_premium) VALUES (?, ?, 1)', 
              ['admin@urlshortener.com', hash]);
          }
        });
      }
    });
  });
}

// Rate limiting - ücretsiz kullanıcılar için
const freeUserLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 10, // 10 istek
  message: 'Çok fazla istek. Premium üyelik için kaydolun.'
});

// JWT doğrulama middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token gerekli' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Geçersiz token' });
    req.user = user;
    next();
  });
}

// Kullanıcı kaydı
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email ve şifre gerekli' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Bu email zaten kayıtlı' });
          }
          return res.status(500).json({ error: 'Kayıt hatası' });
        }

        const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET);
        res.json({ token, user: { id: this.lastID, email, is_premium: false } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kullanıcı girişi
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Sunucu hatası' });
    if (!user) return res.status(401).json({ error: 'Geçersiz email veya şifre' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Geçersiz email veya şifre' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        is_premium: user.is_premium === 1 
      } 
    });
  });
});

// URL kısaltma
app.post('/api/shorten', freeUserLimiter, authenticateToken, (req, res) => {
  const { originalUrl, customCode } = req.body;
  const userId = req.user.id;

  if (!originalUrl) {
    return res.status(400).json({ error: 'URL gerekli' });
  }

  // URL formatını kontrol et
  try {
    new URL(originalUrl);
  } catch {
    return res.status(400).json({ error: 'Geçersiz URL formatı' });
  }

  // Premium özellik kontrolü
  db.get('SELECT is_premium FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) return res.status(500).json({ error: 'Sunucu hatası' });

    const isPremium = user.is_premium === 1;
    
    // Özel kod sadece premium kullanıcılar için
    if (customCode && !isPremium) {
      return res.status(403).json({ 
        error: 'Özel kod özelliği premium üyelik gerektirir' 
      });
    }

    const shortCode = customCode || nanoid(8);
    const isPremiumUrl = customCode ? 1 : 0;

    db.run(
      'INSERT INTO urls (user_id, original_url, short_code, custom_code, is_premium) VALUES (?, ?, ?, ?, ?)',
      [userId, originalUrl, shortCode, customCode || null, isPremiumUrl],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Bu kod zaten kullanılıyor' });
          }
          return res.status(500).json({ error: 'URL kaydedilemedi' });
        }

        res.json({ 
          shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
          shortCode,
          originalUrl 
        });
      }
    );
  });
});

// Root route - Ana sayfa
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// URL yönlendirme - REKLAMLI (Para kazandıran versiyon)
app.get('/:code', (req, res) => {
  const { code } = req.params;

  db.get('SELECT * FROM urls WHERE short_code = ?', [code], (err, url) => {
    if (err) return res.status(500).json({ error: 'Sunucu hatası' });
    if (!url) return res.status(404).send('URL bulunamadı');

    // Tıklama geçmişine kaydet
    db.run(
      'INSERT INTO clicks (url_id, ip_address, user_agent, referer) VALUES (?, ?, ?, ?)',
      [url.id, req.ip, req.get('user-agent'), req.get('referer')],
      function(clickErr) {
        if (clickErr) console.error('Click kayıt hatası:', clickErr);
        
        const clickId = this.lastID;

        // Tıklama sayısını artır
        db.run('UPDATE urls SET click_count = click_count + 1 WHERE id = ?', [url.id]);

        // GELİR KAZAN: Her tıklamada $0.01-0.05 arası gelir (reklam geliri simülasyonu)
        const revenueAmount = (Math.random() * 0.04 + 0.01).toFixed(4); // $0.01 - $0.05
        
        // Gelir kaydı
        db.run(
          'INSERT INTO revenue (url_id, revenue_type, amount, click_id) VALUES (?, ?, ?, ?)',
          [url.id, 'ad_revenue', revenueAmount, clickId]
        );

        // Reklam sayfası göster (5 saniye sonra yönlendir)
        const adPage = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Yönlendiriliyorsunuz...</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            color: white;
        }
        .container {
            text-align: center;
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        .ad-container {
            background: white;
            color: #333;
            padding: 30px;
            border-radius: 10px;
            margin: 20px 0;
            min-height: 250px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .ad-placeholder {
            font-size: 18px;
            font-weight: bold;
            color: #667eea;
        }
        .countdown {
            font-size: 24px;
            margin-top: 20px;
        }
        .skip-btn {
            background: #f5576c;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 20px;
        }
        .skip-btn:hover {
            background: #e04558;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔗 Yönlendiriliyorsunuz...</h1>
        <div class="ad-container">
            <!-- GOOGLE ADSENSE KODUNU BURAYA EKLEYİN -->
            <!-- AdSense hesabınızı açtıktan sonra buraya reklam kodunu yapıştırın -->
            <div class="ad-placeholder">
                📢 REKLAM ALANI<br><br>
                <strong>GERÇEK PARA KAZANMAK İÇİN:</strong><br>
                1. Google AdSense hesabı açın (https://adsense.google.com)<br>
                2. Reklam kodunu alın<br>
                3. Bu alana yapıştırın<br><br>
                <small>Şu an simüle edilmiş gelir gösteriliyor</small>
            </div>
            
            <!-- ÖRNEK ADSENSE KODU (GERÇEK KODUNUZLA DEĞİŞTİRİN):
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
                 crossorigin="anonymous"></script>
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-XXXXXXXXXX"
                 data-ad-slot="XXXXXXXXXX"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <script>
                 (adsbygoogle = window.adsbygoogle || []).push({});
            </script>
            -->
        </div>
        <div class="countdown" id="countdown">5</div>
        <p>saniye sonra yönlendirileceksiniz</p>
        <button class="skip-btn" onclick="skipAd()">Reklamı Geç (Premium)</button>
    </div>
    <script>
        let timeLeft = 5;
        const countdownEl = document.getElementById('countdown');
        const targetUrl = ${JSON.stringify(url.original_url)};
        
        const timer = setInterval(() => {
            timeLeft--;
            countdownEl.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                window.location.href = targetUrl;
            }
        }, 1000);
        
        function skipAd() {
            // Premium kullanıcılar için reklamı geçme özelliği
            alert('Premium üyelik ile reklamsız deneyim!');
            window.location.href = targetUrl;
        }
    </script>
</body>
</html>`;

        res.send(adPage);
      }
    );
  });
});

// Kullanıcının URL'lerini listele
app.get('/api/urls', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    'SELECT id, original_url, short_code, custom_code, click_count, created_at FROM urls WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, urls) => {
      if (err) return res.status(500).json({ error: 'Sunucu hatası' });
      res.json(urls);
    }
  );
});

// URL analitikleri (premium özellik)
app.get('/api/analytics/:code', authenticateToken, (req, res) => {
  const { code } = req.params;
  const userId = req.user.id;

  // URL'in kullanıcıya ait olduğunu kontrol et
  db.get('SELECT * FROM urls WHERE short_code = ? AND user_id = ?', [code, userId], (err, url) => {
    if (err) return res.status(500).json({ error: 'Sunucu hatası' });
    if (!url) return res.status(404).json({ error: 'URL bulunamadı' });

    // Premium kontrolü
    db.get('SELECT is_premium FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) return res.status(500).json({ error: 'Sunucu hatası' });
      
      if (user.is_premium !== 1) {
        return res.status(403).json({ 
          error: 'Analitik özelliği premium üyelik gerektirir' 
        });
      }

      // Tıklama geçmişini getir
      db.all(
        'SELECT * FROM clicks WHERE url_id = ? ORDER BY clicked_at DESC LIMIT 100',
        [url.id],
        (err, clicks) => {
          if (err) return res.status(500).json({ error: 'Sunucu hatası' });
          
          res.json({
            url: {
              original_url: url.original_url,
              short_code: url.short_code,
              click_count: url.click_count,
              created_at: url.created_at
            },
            clicks: clicks
          });
        }
      );
    });
  });
});

// Premium üyelik kontrolü
app.get('/api/user/status', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.get('SELECT id, email, is_premium, premium_until FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) return res.status(500).json({ error: 'Sunucu hatası' });
    res.json({
      id: user.id,
      email: user.email,
      is_premium: user.is_premium === 1,
      premium_until: user.premium_until
    });
  });
});

// Premium üyelik satın alma endpoint'i (Stripe entegrasyonu için hazır)
app.post('/api/premium/subscribe', authenticateToken, (req, res) => {
  const userId = req.user.id;
  // Bu endpoint Stripe ile entegre edilebilir
  // Şimdilik demo amaçlı premium üyelik veriyoruz
  
  const premiumUntil = new Date();
  premiumUntil.setMonth(premiumUntil.getMonth() + 1); // 1 ay premium

  db.run(
    'UPDATE users SET is_premium = 1, premium_until = ? WHERE id = ?',
    [premiumUntil.toISOString(), userId],
    (err) => {
      if (err) return res.status(500).json({ error: 'Sunucu hatası' });
      res.json({ 
        message: 'Premium üyelik aktif edildi',
        premium_until: premiumUntil.toISOString()
      });
    }
  );
});

// Admin paneli - Gelir görüntüleme
app.get('/admin/revenue', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  // Admin kontrolü
  db.get('SELECT email FROM users WHERE id = ?', [userId], (err, user) => {
    if (err || !user || user.email !== 'admin@urlshortener.com') {
      return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }

    // Toplam gelir
    db.get('SELECT SUM(amount) as total FROM revenue', [], (err, total) => {
      if (err) return res.status(500).json({ error: 'Sunucu hatası' });
      
      // Günlük gelir
      db.get(`SELECT SUM(amount) as daily FROM revenue 
              WHERE DATE(created_at) = DATE('now')`, [], (err, daily) => {
        if (err) return res.status(500).json({ error: 'Sunucu hatası' });
        
        // Toplam tıklama
        db.get('SELECT COUNT(*) as clicks FROM clicks', [], (err, clicks) => {
          if (err) return res.status(500).json({ error: 'Sunucu hatası' });
          
          // Son gelirler
          db.all(`SELECT r.*, u.short_code, u.original_url 
                  FROM revenue r 
                  LEFT JOIN urls u ON r.url_id = u.id 
                  ORDER BY r.created_at DESC LIMIT 50`, [], (err, recent) => {
            if (err) return res.status(500).json({ error: 'Sunucu hatası' });
            
            res.json({
              total_revenue: total.total || 0,
              daily_revenue: daily.daily || 0,
              total_clicks: clicks.clicks || 0,
              recent_revenue: recent
            });
          });
        });
      });
    });
  });
});

// Kullanıcı kendi gelirlerini görüntüle
app.get('/api/my-revenue', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(`SELECT SUM(r.amount) as total, COUNT(r.id) as click_count
          FROM revenue r
          JOIN urls u ON r.url_id = u.id
          WHERE u.user_id = ?`, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Sunucu hatası' });
    
    res.json({
      total_revenue: result[0]?.total || 0,
      click_count: result[0]?.click_count || 0
    });
  });
});

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
  console.log(`💰 GELİR MODU AKTİF - Her tıklama para kazandırıyor!`);
  console.log(`👤 Admin: admin@urlshortener.com / admin123`);
});

