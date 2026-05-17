const axios = require('axios');

const API_URL = 'http://localhost:8086/api';

async function searchAnyKaki() {
  try {
    const authRes = await axios.post(`http://localhost:8082/api/auth/login`, {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    });
    const token = authRes.data.data.access_token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const prodRes = await axios.get(`${API_URL}/products?size=2000`);
    const products = prodRes.data.data.content;
    
    console.log('\n--- 🔍 Search Results for specific terms ---');
    products.forEach(p => {
      const name = p.name.toLowerCase();
      if (name.includes('premium cotton') || name.includes('dáng ôm') || name.includes('dang om') || name.includes('co giãn 4') || name.includes('co gian 4')) {
        console.log(`[${p.id}] "${p.name}"`);
      }
    });

  } catch (err) {
    console.error('Error:', err.message);
  }
}

searchAnyKaki();
