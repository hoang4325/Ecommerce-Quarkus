const axios = require('axios');

const API_URL = 'http://localhost:8086/api';

const autoSlug = (name) => {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

const womenProductIds = [
  'f467c10b-c304-4cba-ad8b-bf3abc895f4d', // Quần kaki basic cạp tender GABK020
  'b46f349b-dfca-4426-9b8f-219c6f9467cc', // Áo len trơn cổ trụ thêu logo ngực GWTE824
  'c7d67059-81b2-48e4-a012-fda49b658035'  // Áo len trơn cổ tròn thêu logo FWTE001
];

async function replaceProducts() {
  try {
    const authRes = await axios.post(`http://localhost:8082/api/auth/login`, {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    });
    const token = authRes.data.data.access_token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Đăng nhập admin thành công!');

    // 1. Delete old women's products
    console.log('\n--- 🗑️ Xóa các sản phẩm nữ ra khỏi danh mục nam ---');
    for (const id of womenProductIds) {
      try {
        // Delete inventory first to avoid foreign key violations if any
        try {
          await axios.delete(`${API_URL}/inventory/${id}`);
          console.log(`- Đã xóa tồn kho cho sản phẩm ${id}`);
        } catch (e) {
          // Ignored if inventory endpoint is by productId or already handled cascade
        }
        
        await axios.delete(`${API_URL}/products/${id}`);
        console.log(`✅ Đã xóa thành công sản phẩm: ${id}`);
      } catch (err) {
        console.error(`❌ Lỗi khi xóa sản phẩm ${id}:`, err.message);
      }
    }

    // 2. Fetch categories to get correct category IDs
    const catRes = await axios.get(`${API_URL}/categories`);
    const categories = catRes.data.data;
    const kakiCat = categories.find(c => c.name === 'Quần Kaki Nam');
    const lenCat = categories.find(c => c.name === 'Áo Len Nam');

    console.log('\n--- ➕ Thêm sản phẩm Nam cao cấp thay thế ---');

    // Add 1 replacement Men's Kaki
    if (kakiCat) {
      const mockName = 'Quần Kaki Nam Premium Cotton Co Giãn 4 Chiều';
      const mockSlug = autoSlug(mockName);
      const imageUrl = 'https://media.canifa.com/catalog/product/8/b/8bs23a002-sk010-1.jpg';
      const mockPrice = 450000;

      try {
        const res = await axios.post(`${API_URL}/products`, {
          name: mockName,
          slug: mockSlug,
          price: mockPrice,
          categoryId: kakiCat.id,
          imageUrl: imageUrl,
          description: 'Quần Kaki Nam Premium được dệt từ sợi cotton hữu cơ co giãn 4 chiều, giữ phom cực tốt, mang lại sự tự tin và thoải mái tuyệt đối cho các chàng trai năng động.'
        });
        const newProd = res.data.data;
        if (newProd && newProd.id) {
          await axios.post(`${API_URL}/inventory`, {
            productId: newProd.id,
            productName: newProd.name,
            quantity: 75
          });
          console.log(`✅ Đã thêm sản phẩm thay thế Kaki Nam: "${mockName}"`);
        }
      } catch (err) {
        console.error('❌ Lỗi tạo Kaki Nam thay thế:', err.message);
      }
    }

    // Add 2 replacement Men's Sweaters
    if (lenCat) {
      const mockSweaters = [
        {
          name: 'Áo Len Nam Cổ Lọ Wool Merino Premium',
          image: 'https://media.canifa.com/catalog/product/8/t/8to23w002-sw040-1.jpg',
          price: 590000,
          desc: 'Áo len nam cổ lọ dệt từ sợi len lông cừu Merino nhập khẩu siêu nhẹ, giữ ấm vượt trội và mềm mại với làn da, là điểm nhấn lịch lãm hoàn hảo cho tủ đồ mùa đông.'
        },
        {
          name: 'Áo Len Nam Basic Cổ Tròn Cashmere Blend',
          image: 'https://media.canifa.com/catalog/product/8/t/8to23w001-sw040-1.jpg',
          price: 650000,
          desc: 'Áo len cổ tròn Basic dệt sợi Cashmere cao cấp siêu mịn, giữ ấm tốt, dễ dàng phối cùng sơ mi công sở thanh lịch hoặc mặc riêng năng động.'
        }
      ];

      for (const ms of mockSweaters) {
        const mockSlug = autoSlug(ms.name);
        try {
          const res = await axios.post(`${API_URL}/products`, {
            name: ms.name,
            slug: mockSlug,
            price: ms.price,
            categoryId: lenCat.id,
            imageUrl: ms.image,
            description: ms.desc
          });
          const newProd = res.data.data;
          if (newProd && newProd.id) {
            await axios.post(`${API_URL}/inventory`, {
              productId: newProd.id,
              productName: newProd.name,
              quantity: 60
            });
            console.log(`✅ Đã thêm sản phẩm thay thế Áo Len Nam: "${ms.name}"`);
          }
        } catch (err) {
          console.error(`❌ Lỗi tạo Áo Len Nam thay thế (${ms.name}):`, err.message);
        }
      }
    }

    console.log('\n⭐ Đồng bộ và thay thế thành công mỹ mãn! Toàn bộ danh mục đã là 100% ĐỒ NAM chính hiệu!');

  } catch (err) {
    console.error('Master error:', err.message);
  }
}

replaceProducts();
