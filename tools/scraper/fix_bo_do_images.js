const axios = require('axios');

const API_URL = 'http://localhost:8086/api';

const stableUnsplashSports = [
  'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1519766304817-4f37bda74a27?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1550246140-5119ae4790b8?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1502904585520-fa4513c32093?auto=format&fit=crop&w=600&q=80'
];

const targetNames = [
  'Bộ Thể Thao Nam Cổ Bẻ Fast-Run',
  'Bộ Thể Thao Nam Cổ Bẻ Active-S1',
  'Bộ Thể Thao Nam Cổ Bẻ Promax-S1',
  'Bộ Thể Thao Cổ Tròn Active Cooling',
  'Bộ Thể Thao Nam Cổ Tròn Fast-Dry',
  'Bộ Thể Thao Nam Cổ Tròn Promax-S1',
  'Bộ Thể Thao Nam Cổ Tròn Active-S1',
  'Bộ Thể Thao Nam Singlet S1 Siêu Nhẹ',
  'Bộ Thể Thao Chạy Bộ Singlet Fast-Run',
  'Bộ Thể Thao Nam Sát Nách Active Cooling',
  'Bộ Thể Thao Sát Nách Chạy Bộ Singlet',
  'Bộ Sát Nách Thể Thao Nam Active-S1',
  'Bộ Sát Nách Nam Thể Thao Promax-S1'
];

async function fixSportsImages() {
  try {
    const authRes = await axios.post(`http://localhost:8082/api/auth/login`, {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    });
    const token = authRes.data.data.access_token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Đăng nhập admin thành công!');

    // 1. Fetch all products
    const prodRes = await axios.get(`${API_URL}/products?size=2000`);
    const products = prodRes.data.data.content;
    console.log(`✅ Đã tải ${products.length} sản phẩm từ cơ sở dữ liệu.`);

    let fixedCount = 0;

    for (const p of products) {
      const idx = targetNames.indexOf(p.name.trim());
      if (idx !== -1) {
        const stableImg = stableUnsplashSports[idx % stableUnsplashSports.length];
        console.log(`🔧 Sửa ảnh bộ đồ: "${p.name}"`);
        console.log(`  - Ảnh mới: ${stableImg}`);

        try {
          await axios.put(`${API_URL}/products/${p.id}`, {
            name: p.name,
            slug: p.slug,
            price: p.price,
            categoryId: p.categoryId,
            imageUrl: stableImg,
            description: p.description
          });
          fixedCount++;
        } catch (err) {
          console.error(`  ❌ Lỗi khi sửa sản phẩm ${p.id}:`, err.message);
        }
      }
    }

    console.log('\n==================================================');
    console.log(`🎉 ĐÃ SỬA THÀNH CÔNG ${fixedCount} ẢNH BỘ ĐỒ THỂ THAO NAM HOÀN HẢO! 🎉`);
    console.log('==================================================');

  } catch (err) {
    console.error('Error fixing sports images:', err.message);
  }
}

fixSportsImages();
