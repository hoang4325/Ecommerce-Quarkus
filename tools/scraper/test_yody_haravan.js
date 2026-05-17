const axios = require('axios');

const urls = [
  'https://yody.vn/collections/quan-kaki-nam/products.json',
  'https://yody.vn/quan-kaki-nam.json',
  'https://yody.vn/collections/quan-kaki-nam.json',
  'https://yody.vn/collections/ao-len-nam/products.json'
];

async function testPaths() {
  console.log('Testing Yody Haravan JSON endpoints...');
  for (const url of urls) {
    try {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      console.log(`✅ [200] ${url} | keys: ${Object.keys(res.data)}`);
      if (res.data.products) {
        console.log(`- Products count: ${res.data.products.length}`);
      }
    } catch (err) {
      console.log(`❌ [${err.response?.status || 'ERR'}] ${url}`);
    }
  }
}

testPaths();
