// Basit test sunucusu
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>Test Sunucusu Çalışıyor!</h1><p>Port 3000 erişilebilir.</p>');
});

server.listen(3000, () => {
  console.log('Test sunucusu http://localhost:3000 adresinde çalışıyor');
});

