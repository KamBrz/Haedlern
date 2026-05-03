const https = require('https');
const fs = require('fs');

const KEY = '03104f0351c640b8bed427e74e305e23';
const HOST = 'haedlern.com';

const sitemap = fs.readFileSync('./sitemap.xml', 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);

const body = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: `https://${HOST}/${KEY}.txt`,
  urlList: urls
});

const req = https.request({
  hostname: 'api.indexnow.org',
  path: '/indexnow',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  }
}, res => {
  console.log(`IndexNow: HTTP ${res.statusCode} (${urls.length} URLs submitted)`);
});

req.on('error', e => console.error('IndexNow error:', e.message));
req.write(body);
req.end();
