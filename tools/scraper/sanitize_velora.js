const axios = require('axios');

const API_URL = 'http://localhost:8086/api';

const unsplashImages = {
  'Áo Polo Nam': [
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1625910513396-a0447e24caf4?auto=format&fit=crop&w=600&q=80'
  ],
  'Áo Sơ Mi Nam': [
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80'
  ],
  'Áo Thun Nam': [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80'
  ],
  'Quần Shorts Nam': [
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=600&q=80'
  ],
  'Quần Kaki Nam': [
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80'
  ],
  'Quần Jeans Nam': [
    'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80'
  ],
  'Quần Tây Nam': [
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80'
  ],
  'Áo Khoác Nam': [
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=600&q=80'
  ],
  'Áo Len Nam': [
    'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&w=600&q=80', // Grey elegant sweater
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80', // White knit sweater
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80', // Flatlay sweater
    'https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?auto=format&fit=crop&w=600&q=80', // Knitted sweater
    'https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?auto=format&fit=crop&w=600&q=80', // Stylish men knitwear
    'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=600&q=80'  // Cozy sweater
  ],
  'Bộ Đồ Nam': [
    'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80'
  ],
  'Quần Âu Nam': [
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80'
  ]
};

// Known Yody products that show women models in Men category
const womenSweaterNames = [
  'áo len nam mỏng cổ cao 5cm',
  'áo len nam cổ tròn cơ bản',
  'áo len nam cổ cao',
  'áo len nam cổ bẻ'
];

async function sanitizeDatabase() {
  try {
    const authRes = await axios.post(`http://localhost:8082/api/auth/login`, {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    });
    const token = authRes.data.data.access_token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Đăng nhập admin thành công!');

    // 1. Fetch categories
    const catRes = await axios.get(`${API_URL}/categories`);
    const categories = catRes.data.data;
    const catMap = {};
    categories.forEach(c => {
      catMap[c.id] = c.name;
    });

    // 2. Fetch all products
    const prodRes = await axios.get(`${API_URL}/products?size=2000`);
    const products = prodRes.data.data.content;
    console.log(`✅ Đã tải ${products.length} sản phẩm từ cơ sở dữ liệu.`);

    let fixedCount = 0;

    for (const p of products) {
      const catName = catMap[p.categoryId] || 'Áo Len Nam';
      let needsFix = false;
      let reason = '';

      // Check A: Hotlinked Canifa images (always broken)
      if (p.imageUrl && (p.imageUrl.includes('canifa.com') || p.imageUrl.includes('cdneverest.net'))) {
        needsFix = true;
        reason = 'Ảnh CDNs của Canifa bị chặn Hotlink';
      }

      // Check B: Yody items showing women models
      if (catName === 'Áo Len Nam' && womenSweaterNames.includes(p.name.trim().toLowerCase())) {
        needsFix = true;
        reason = 'Sản phẩm nam nhưng hiển thị người mẫu nữ';
      }

      // Check C: Relative URLs or missing images
      if (!p.imageUrl || p.imageUrl.startsWith('/') || p.imageUrl.length < 15) {
        needsFix = true;
        reason = 'Đường dẫn ảnh bị lỗi hoặc không có ảnh';
      }

      if (needsFix) {
        // Select a beautiful Unsplash image matching the category style
        const pool = unsplashImages[catName] || unsplashImages['Áo Len Nam'];
        const randomImage = pool[Math.floor(Math.random() * pool.length)];

        console.log(`🔧 Sửa sản phẩm: "${p.name}" (${catName})`);
        console.log(`  - Lý do: ${reason}`);
        console.log(`  - Ảnh cũ: ${p.imageUrl}`);
        console.log(`  - Ảnh mới: ${randomImage}`);

        try {
          await axios.put(`${API_URL}/products/${p.id}`, {
            name: p.name,
            slug: p.slug,
            price: p.price,
            categoryId: p.categoryId,
            imageUrl: randomImage,
            description: p.description
          });
          fixedCount++;
        } catch (err) {
          console.error(`  ❌ Lỗi khi sửa sản phẩm ${p.id}:`, err.message);
        }
      }
    }

    console.log('\n==================================================');
    console.log(`🎉 HOÀN THÀNH LÀM SẠCH DATABASE! ĐÃ SỬA THÀNH CÔNG ${fixedCount} SẢN PHẨM! 🎉`);
    console.log('==================================================');

  } catch (err) {
    console.error('Error during sanitization:', err.message);
  }
}

sanitizeDatabase();
