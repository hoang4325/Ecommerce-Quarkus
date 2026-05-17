const axios = require('axios');

async function testThresholds() {
  const sizes = [50, 100, 150, 200];
  for (const size of sizes) {
    try {
      console.log(`Testing size=${size} via Nginx (port 3000)...`);
      const res = await axios.get(`http://localhost:3000/api/products?page=0&size=${size}`);
      console.log(`Success for size=${size}! Count:`, res.data.data.content.length);
    } catch (e) {
      console.error(`Failed for size=${size}:`, e.message, e.response ? e.response.status : '');
    }
  }
}

testThresholds();
