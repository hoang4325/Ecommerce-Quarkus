const axios = require('axios');

const urls = [
  'https://canifa.com/nam/quan-nam/quan-kaki.html',
  'https://canifa.com/nam/quan-kaki.html',
  'https://canifa.com/nam/quan-nam/quan-tay.html',
  'https://canifa.com/nam/quan-tay.html',
  'https://canifa.com/nam/quan-nam/quan-au.html',
  'https://canifa.com/nam/quan-au.html'
];

async function testPaths() {
  console.log('Testing final Canifa paths...');
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
