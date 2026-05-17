const axios = require('axios');

const urls = [
  'https://canifa.com/catalogsearch/result/?q=ao+len',
  'https://canifa.com/nam/ao-len/ao-cardigan.html',
  'https://canifa.com/nam/ao-len/ao-gile.html',
  'https://canifa.com/nam/ao-len/ao-len-basic.html',
  'https://canifa.com/catalogsearch/result/?q=quan+kaki'
];

async function testPaths() {
  console.log('Testing Canifa sub-categories and search...');
  for (const url of urls) {
    try {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      console.log(`✅ [${res.status}] ${url} (length: ${res.data.length})`);
    } catch (err) {
      console.log(`❌ [${err.response?.status || 'ERR'}] ${url}`);
    }
  }
}

testPaths();
