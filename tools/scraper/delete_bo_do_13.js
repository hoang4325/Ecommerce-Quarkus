const axios = require('axios');

const API_URL = 'http://localhost:8086/api';

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

async function deleteBoDo13() {
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

    let deletedCount = 0;

    for (const p of products) {
      if (targetNames.includes(p.name.trim())) {
        console.log(`🗑️ Thực hiện xóa sản phẩm: "${p.name}"`);
        try {
          // Delete inventory first
          try {
            await axios.delete(`${API_URL}/inventory/${p.id}`);
          } catch (e) {}
          
          await axios.delete(`${API_URL}/products/${p.id}`);
          deletedCount++;
        } catch (err) {
          console.error(`  ❌ Lỗi khi xóa sản phẩm ${p.id}:`, err.message);
        }
      }
    }

    console.log('\n==================================================');
    console.log(`🎉 HOÀN THÀNH XÓA 13 BỘ ĐỒ THỂ THAO NAM! ĐÃ XÓA ${deletedCount} SẢN PHẨM! 🎉`);
    console.log('==================================================');

  } catch (err) {
    console.error('Error during deletion:', err.message);
  }
}

deleteBoDo13();
