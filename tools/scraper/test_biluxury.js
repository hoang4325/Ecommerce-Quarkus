const axios = require('axios');

async function testBiluxury() {
  const urls = [
    'https://biluxury.vn/collections/quan-khaki-nam',
    'https://biluxury.vn/collections/ao-len-nam'
  ];
  console.log('Testing Biluxury...');
  for (const url of urls) {
    try {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      console.log(`✅ [200] ${url} (length: ${res.data.length})`);
    } catch (err) {
      console.log(`❌ [${err.response?.status || 'ERR'}] ${url}`);
    }
  }
}

testBiluxury();
