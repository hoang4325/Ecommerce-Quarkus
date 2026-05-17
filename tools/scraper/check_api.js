const axios = require('axios');

async function checkApi() {
  try {
    const authRes = await axios.post(`http://localhost:8082/api/auth/login`, {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    });
    const token = authRes.data.data.access_token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    console.log('Sending request for size=1000...');
    try {
      const res1 = await axios.get('http://localhost:8086/api/products?page=0&size=1000');
      console.log('size=1000 success!', res1.data.data.content.length, 'products');
    } catch (e) {
      console.error('size=1000 failed:', e.message, e.response ? e.response.status : '');
    }

    console.log('Sending request for size=10...');
    try {
      const res2 = await axios.get('http://localhost:8086/api/products?page=0&size=10');
      console.log('size=10 success!', res2.data.data.content.length, 'products');
    } catch (e) {
      console.error('size=10 failed:', e.message, e.response ? e.response.status : '');
    }

  } catch (err) {
    console.error('Admin auth failed:', err.message);
  }
}

checkApi();
