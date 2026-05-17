const axios = require('axios');

const API_URL = 'http://localhost:8086/api';

async function inspectBoDo() {
  try {
    const authRes = await axios.post(`http://localhost:8082/api/auth/login`, {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    });
    const token = authRes.data.data.access_token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const catRes = await axios.get(`${API_URL}/categories`);
    const categories = catRes.data.data;

    const boDoCat = categories.find(c => c.name === 'Bộ Đồ Nam');

    if (boDoCat) {
      console.log(`\n--- Bộ Đồ Nam (ID: ${boDoCat.id}) ---`);
      const prodRes = await axios.get(`${API_URL}/products?categoryId=${boDoCat.id}&size=100`);
      prodRes.data.data.content.forEach(p => {
        console.log(`[${p.id}] ${p.name} | Image: ${p.imageUrl}`);
      });
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

inspectBoDo();
