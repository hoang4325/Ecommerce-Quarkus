const axios = require('axios');

async function testPage() {
  const url = 'https://torano.vn/collections/quan-au?page=2';
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

testPage();
