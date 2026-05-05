const puppeteer = require('puppeteer');
const axios = require('axios');

// Configure our local API endpoint
const API_URL = 'http://localhost:8086/api';

const autoSlug = (name) => {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

const formatPrice = (priceText) => {
  const numericStr = priceText.replace(/[^0-9]/g, '');
  return parseInt(numericStr) || 250000;
};

async function scrapeAndSeed() {
  try {
    const authRes = await axios.post(`http://localhost:8082/api/auth/login`, {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    });
    const token = authRes.data.data.access_token;
    if (!token) throw new Error("No token returned");
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Đăng nhập thành công!');
  } catch (err) {
    console.error('❌ Đăng nhập thất bại. Kiểm tra xem backend đã chạy chưa:', err.message);
    return;
  }

  console.log('Khởi động trình duyệt cào dữ liệu...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Disable loading images/fonts to speed up scraping
  /*
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.resourceType() === 'image' || req.resourceType() === 'stylesheet' || req.resourceType() === 'font') {
      req.abort();
    } else {
      req.continue();
    }
  });
  */


  try {
    // We will hardcode a few known category URLs to Torano to ensure we get data
    // Torano has clean structures like /collections/ao-thun-nam
    // Configuration for pagination
    const MAX_PAGES_PER_CATEGORY = 5; 
    const targets = [
      { name: 'Áo Polo Nam', url: 'https://torano.vn/collections/ao-polo' },
      { name: 'Áo Sơ Mi Nam', url: 'https://torano.vn/collections/ao-so-mi' },
      { name: 'Áo Thun Nam', url: 'https://torano.vn/collections/ao-thun' },
      { name: 'Quần Shorts Nam', url: 'https://torano.vn/collections/quan-short' },
      { name: 'Quần Kaki Nam', url: 'https://torano.vn/collections/quan-kaki' }
    ];

    for (const target of targets) {
      console.log(`\n===========================================`);
      console.log(`Đang xử lý danh mục: ${target.name}`);
      
      // 1. Create Category in our DB
      let categoryId = null;
      try {
        const catRes = await axios.post(`${API_URL}/categories`, {
          name: target.name,
          slug: autoSlug(target.name)
        });
        categoryId = catRes.data.data.id;
        console.log(`Đã tạo Category trong DB với ID: ${categoryId}`);
      } catch (err) {
        // Fetch existing category if creation fails
        const allCats = await axios.get(`${API_URL}/categories`);
        const existing = allCats.data.data.find(c => c.name === target.name);
        if (existing) {
          categoryId = existing.id;
          console.log(`Danh mục đã tồn tại, dùng ID: ${categoryId}`);
        } else {
          console.error(`❌ Bỏ qua danh mục ${target.name} do lỗi.`);
          continue;
        }
      }

      // 2. Iterate through pages
      for (let pNum = 1; pNum <= MAX_PAGES_PER_CATEGORY; pNum++) {
        const pageUrl = `${target.url}?page=${pNum}`;
        console.log(`\n--- Đang cào dữ liệu Trang ${pNum}: ${pageUrl} ---`);
        
        try {
          await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 60000 });
          
          // Wait for products to load
          try {
            await page.waitForSelector('.product-loop', { timeout: 10000 });
          } catch (e) {
            console.log(`Không tìm thấy .product-loop trên trang ${pNum}.`);
          }

          const products = await page.evaluate(() => {
            const items = [];
            const productNodes = document.querySelectorAll('.product-loop');

            productNodes.forEach(node => {
              const titleEl = node.querySelector('.proloop-title a, .product-name a, h3 a');
              const priceEl = node.querySelector('.proloop-price, .current-price, .price');
              const imgEl = node.querySelector('.proloop-image img, .product-image img, img');

              if (titleEl && priceEl && imgEl) {
                const title = titleEl.innerText.trim();
                const price = priceEl.innerText.trim();
                // Get the real image URL from data-src or src or data-lazyload
                const img = imgEl.getAttribute('data-src') || imgEl.getAttribute('src') || imgEl.getAttribute('data-lazyload');
                
                if (title && price && img && !img.includes('logo.png') && img.length > 10) {
                  items.push({ name: title, price, image: img });
                }
              }
            });
            return items;
          });

          if (products.length === 0) {
            console.log(`Không tìm thấy sản phẩm ở trang ${pNum}. Kết thúc danh mục.`);
            break;
          }

          console.log(`Tìm thấy ${products.length} sản phẩm. Đang đẩy vào DB...`);





          // 3. Post to our DB in batches
          const BATCH_SIZE = 5; 
          let successCount = 0;

          for (let i = 0; i < products.length; i += BATCH_SIZE) {
            const batch = products.slice(i, i + BATCH_SIZE);
            
            await Promise.all(batch.map(async (p) => {
              try {
                let imageUrl = p.image;
                if (imageUrl && imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;

                await axios.post(`${API_URL}/products`, {
                  name: p.name,
                  slug: autoSlug(p.name) + '-' + Math.floor(Math.random() * 1000000), 
                  price: formatPrice(p.price) || 300000,
                  categoryId: categoryId,
                  imageUrl: imageUrl,
                  description: `Sản phẩm ${p.name} chuẩn phong cách. Nhập nguyên bản từ Torano.`
                });
                successCount++;
              } catch (err) {
                // If it's a conflict or other error, log and continue
              }
            }));
            process.stdout.write(`.`); // Simple progress indicator
          }
          console.log(`\n✅ Thành công ${successCount}/${products.length} sản phẩm trang ${pNum}.`);
          
        } catch (pageErr) {
          console.error(`❌ Lỗi khi xử lý trang ${pNum}:`, pageErr.message);
          break;
        }
      }
    }

  } catch (error) {
    console.error('Lỗi nghiêm trọng:', error);
  } finally {
    await browser.close();
    console.log('\n>>> TOÀN BỘ QUÁ TRÌNH HOÀN TẤT <<<');
  }
}

scrapeAndSeed();
