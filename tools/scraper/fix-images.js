const axios = require('axios');

const API_URL = 'http://localhost:8086/api';
const AUTH_URL = 'http://localhost:8082/api/auth/login';

const CATEGORY_IMAGES = {
  'Áo Polo Nam': [
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80',
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80',
    'https://images.unsplash.com/photo-1625910513397-22a99c1ef3b5?w=800&q=80'
  ],
  'Áo Sơ Mi Nam': [
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
    'https://images.unsplash.com/photo-1598961942613-ba897716405b?w=800&q=80'
  ],
  'Áo Thun Nam': [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80'
  ],
  'Quần Shorts Nam': [
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80',
    'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800&q=80'
  ],
  'Quần Kaki Nam': [
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
    'https://images.unsplash.com/photo-1473966968600-fa804b868efc?w=800&q=80'
  ]
};

async function fixImages() {
  try {
    // 1. Login
    console.log('Logging in...');
    const authRes = await axios.post(AUTH_URL, {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    });
    const token = authRes.data.data.access_token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Login successful!');

    // 2. Get all products
    console.log('Fetching products...');
    const prodRes = await axios.get(`${API_URL}/products?size=100`);
    const products = prodRes.data.data.content;
    console.log(`Found ${products.length} products to check.`);

    let fixedCount = 0;
    for (const p of products) {
      // If image is the broken logo or generic, fix it
      if (!p.imageUrl || p.imageUrl.includes('logo.png') || p.imageUrl.includes('hstatic')) {
        const images = CATEGORY_IMAGES[p.categoryName] || CATEGORY_IMAGES['Áo Thun Nam'];
        const randomImg = images[Math.floor(Math.random() * images.length)];
        
        await axios.put(`${API_URL}/products/${p.id}`, {
          imageUrl: randomImg
        });
        fixedCount++;
        process.stdout.write('.');
      }
    }

    console.log(`\nFixed ${fixedCount} product images!`);
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

fixImages();
