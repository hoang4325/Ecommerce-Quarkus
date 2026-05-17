const axios = require('axios');

async function testLowerThresholds() {
  const sizes = [10, 20, 30, 40];
  for (const size of sizes) {
    try {
      console.log(`Testing size=${size} via Nginx...`);
      const res = await axios.get(`http://localhost:3000/api/products?page=0&size=${size}`);
      console.log(`Success for size=${size}! Count:`, res.data.data.content.length);
    } catch (e) {
      console.error(`Failed for size=${size}:`, e.message, e.response ? e.response.status : '');
    }
  }
}

testLowerThresholds();
