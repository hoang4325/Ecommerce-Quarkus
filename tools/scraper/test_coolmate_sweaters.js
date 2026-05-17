const axios = require('axios');

const urls = [
  'https://www.coolmate.me/collection/ao-len-nam',
  'https://www.coolmate.me/collection/ao-khoac-len',
  'https://www.coolmate.me/collection/ao-sweater',
  'https://www.coolmate.me/collection/ao-ni'
];

async function testPaths() {
  console.log('Testing Coolmate sweater paths...');
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
