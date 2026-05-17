const axios = require('axios');

const API_URL = 'http://localhost:8086/api';

const autoSlug = (name) => {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

const deleteProductIds = [
  'c9c22369-0f37-4da7-99d9-523c40e0e2ea', // Áo bơi dài tay nữ Coolmate
  '6342505f-edb1-468b-8795-5b365b691c3d', // Summer shorts bơi nữ Coolmate 3.5 inch
  '8f74f851-949a-47aa-a0f4-b0b4273b233b', // Áo tank bơi nữ Coolmate Cutline
  'b92e3081-4d22-4f1d-afba-786926961061', // Áo bra bơi nữ Coolmate Cutline
  '3b8c6a7e-9e70-4043-b4ba-7ddb86e46ba0', // Bộ đồ bơi nữ Coolmate Flexline
  '6ae6e1b5-cdfc-49d0-9293-59bb8c3d9c3e', // Summer shorts bơi nữ Coolmate 2.5 inch
  '3e14ef6f-91de-440f-88e1-1dbd734507e2', // Bộ đồ bơi nữ dài tay Coolmate Basic
  'bb899d33-918c-4cf0-8509-33b4927292f5', // Bộ đồ bơi nữ dài tay Coolmate Racing
  '3e9f634d-6429-4aeb-b189-f46f0ae774b7', // Bộ đồ bơi nữ Coolmate Basic
  'c21665a0-5983-47d8-9fa0-56d2f991c54d', // Bộ đồ bơi nữ Coolmate Racing
  'eed55d1b-14c2-4061-a3ca-a16b1948f9a8', // Bộ đồ bơi nữ Coolmate Free-back
  '6f841bc1-75ef-4460-9f96-ddb228ce3f61', // Tshirt thể thao nữ Coolmate basic
  'c3a7c493-06db-49d4-acad-f67fe31e8d5e'  // Tất Pickleball Nam Cổ Trung
];

const newSportSets = [
  {
    name: 'Bộ Sát Nách Nam Thể Thao Promax-S1',
    image: 'https://n7media.coolmate.me/uploads/August2025/bo-sat-nach-nam-the-thao-promax-s1-den-1.jpg?aio=w-700',
    price: 249000,
    desc: 'Bộ thể thao sát nách Promax-S1 chất liệu co giãn, thoáng khí, phom dáng thể thao khỏe khoắn giúp bạn tự tin vận động.'
  },
  {
    name: 'Bộ Sát Nách Thể Thao Nam Active-S1',
    image: 'https://n7media.coolmate.me/uploads/July2025/bo-sat-nach-the-thao-nam-active-s1-xam-1.jpg?aio=w-700',
    price: 259000,
    desc: 'Bộ sát nách active dệt công nghệ mới, chống nhăn hiệu quả, thoát mồ hôi nhanh thích hợp cho các buổi tập luyện cường độ cao.'
  },
  {
    name: 'Bộ Thể Thao Sát Nách Chạy Bộ Singlet',
    image: 'https://n7media.coolmate.me/uploads/October2025/bo-the-thao-sat-nach-chay-bo-men-singlet-den-1.jpg?aio=w-700',
    price: 269000,
    desc: 'Bộ đồ chạy bộ thiết kế Singlet siêu nhẹ, giảm ma sát tối đa giúp tối ưu hóa hiệu suất đường chạy của bạn.'
  },
  {
    name: 'Bộ Thể Thao Nam Sát Nách Active Cooling',
    image: 'https://n7media.coolmate.me/uploads/July2025/bo-sat-nach-nam-active-cooling-xam-1.jpg?aio=w-700',
    price: 279000,
    desc: 'Bộ sát nách công nghệ làm mát Active Cooling hạ nhiệt tức thì, mang lại cảm giác dễ chịu suốt ngày dài.'
  },
  {
    name: 'Bộ Thể Thao Chạy Bộ Singlet Fast-Run',
    image: 'https://n7media.coolmate.me/uploads/November2025/bo-the-thao-nam-chay-bo-singlet-fast-run-xam-1.jpg?aio=w-700',
    price: 289000,
    desc: 'Thiết kế chuẩn vận động viên điền kinh, sợi vải dệt kim siêu thoáng khí cùng chi tiết phản quang an toàn chạy đêm.'
  },
  {
    name: 'Bộ Thể Thao Nam Singlet S1 Siêu Nhẹ',
    image: 'https://n7media.coolmate.me/uploads/July2025/bo-the-thao-nam-chay-bo-singlet-singlet-s1-xanh-1.jpg?aio=w-700',
    price: 269000,
    desc: 'Bộ Singlet S1 dệt từ sợi polyester tái chế thân thiện môi trường, nhanh khô và co giãn tốt.'
  },
  {
    name: 'Bộ Thể Thao Nam Cổ Tròn Active-S1',
    image: 'https://n7media.coolmate.me/uploads/September2025/bo-the-thao-nam-co-tron-active-s1-den-1.jpg?aio=w-700',
    price: 299000,
    desc: 'Bộ thể thao cổ tròn cơ bản, năng động lịch sự, phù hợp cả khi tập luyện lẫn mặc thường ngày.'
  },
  {
    name: 'Bộ Thể Thao Nam Cổ Tròn Promax-S1',
    image: 'https://n7media.coolmate.me/uploads/July2025/bo-the-thao-nam-co-tron-promax-s1-xam-1.jpg?aio=w-700',
    price: 319000,
    desc: 'Sử dụng chất liệu vải Promax dệt lỗ thoáng khí li ti, giữ cơ thể luôn khô thoáng và thơm mát.'
  },
  {
    name: 'Bộ Thể Thao Nam Cổ Tròn Fast-Dry',
    image: 'https://n7media.coolmate.me/uploads/August2025/bo-the-thao-nam-co-tron-fast-dry-den-1.jpg?aio=w-700',
    price: 289000,
    desc: 'Công nghệ dệt Fast-Dry giúp bề mặt vải khô ngay sau khi giặt hoặc đổ mồ hôi, chống bám mùi tối ưu.'
  },
  {
    name: 'Bộ Thể Thao Cổ Tròn Active Cooling',
    image: 'https://n7media.coolmate.me/uploads/September2025/bo-the-thao-nam-co-tron-active-cooling-xam-1.jpg?aio=w-700',
    price: 329000,
    desc: 'Bộ đồ thể thao mát lạnh, dệt từ sợi nylon siêu mượt mà cho trải nghiệm vận động tự do tuyệt đối.'
  },
  {
    name: 'Bộ Thể Thao Nam Cổ Bẻ Promax-S1',
    image: 'https://n7media.coolmate.me/uploads/October2025/bo-the-thao-nam-co-be-promax-s1-den-1.jpg?aio=w-700',
    price: 349000,
    desc: 'Bộ polo thể thao lịch lãm, thích hợp chơi golf, tennis hay các hoạt động dã ngoại sang trọng.'
  },
  {
    name: 'Bộ Thể Thao Nam Cổ Bẻ Active-S1',
    image: 'https://n7media.coolmate.me/uploads/July2025/bo-the-thao-nam-co-be-active-s1-xam-1.jpg?aio=w-700',
    price: 359000,
    desc: 'Polo thể thao Active-S1 phom dáng ôm tôn nét nam tính, cổ bẻ thanh lịch mềm mại không gây cọ xát.'
  },
  {
    name: 'Bộ Thể Thao Nam Cổ Bẻ Fast-Run',
    image: 'https://n7media.coolmate.me/uploads/November2025/bo-the-thao-nam-co-be-fast-run-xam-1.jpg?aio=w-700',
    price: 369000,
    desc: 'Bộ đồ cao cấp phối cổ bẻ dệt jacquard tinh xảo, chất vải chống nhăn tự nhiên, bền màu sau nhiều lần giặt.'
  }
];

async function replaceBoDo() {
  try {
    const authRes = await axios.post(`http://localhost:8082/api/auth/login`, {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    });
    const token = authRes.data.data.access_token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Đăng nhập admin thành công!');

    // 1. Delete women swimsuits and socks
    console.log('\n--- 🗑️ Xóa đồ bơi/thể thao nữ khỏi Bộ Đồ Nam ---');
    for (const id of deleteProductIds) {
      try {
        try {
          await axios.delete(`${API_URL}/inventory/${id}`);
        } catch (e) {}
        await axios.delete(`${API_URL}/products/${id}`);
        console.log(`✅ Đã xóa thành công sản phẩm: ${id}`);
      } catch (err) {
        console.error(`❌ Lỗi khi xóa sản phẩm ${id}:`, err.message);
      }
    }

    // 2. Fetch Bo Do Nam category ID
    const catRes = await axios.get(`${API_URL}/categories`);
    const categories = catRes.data.data;
    const boDoCat = categories.find(c => c.name === 'Bộ Đồ Nam');

    if (!boDoCat) {
      console.error('❌ Không tìm thấy danh mục Bộ Đồ Nam!');
      return;
    }

    console.log('\n--- ➕ Thêm Bộ Đồ Thể Thao Nam cao cấp thay thế ---');
    for (const s of newSportSets) {
      const slug = autoSlug(s.name);
      try {
        const res = await axios.post(`${API_URL}/products`, {
          name: s.name,
          slug: slug,
          price: s.price,
          categoryId: boDoCat.id,
          imageUrl: s.image,
          description: s.desc
        });
        const newProd = res.data.data;
        if (newProd && newProd.id) {
          await axios.post(`${API_URL}/inventory`, {
            productId: newProd.id,
            productName: newProd.name,
            quantity: Math.floor(Math.random() * 80) + 20
          });
          console.log(`✅ Đã thêm Bộ đồ Nam: "${s.name}"`);
        }
      } catch (err) {
        console.error(`❌ Lỗi tạo bộ đồ nam (${s.name}):`, err.message);
      }
    }

    console.log('\n⭐ Đồng bộ thành công! Danh mục "Bộ Đồ Nam" đã sạch bóng đồ bơi nữ và tràn ngập đồ thể thao nam cực chất!');

  } catch (err) {
    console.error('Error during Bo Do replacement:', err.message);
  }
}

replaceBoDo();
