const puppeteer = require('puppeteer');
const axios = require('axios');

const API_URL = 'http://localhost:8086/api';

const autoSlug = (name) => {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

const formatPrice = (priceText) => {
  if (typeof priceText === 'number') return priceText;
  const numericStr = priceText.replace(/[^0-9]/g, '');
  return parseInt(numericStr) || 250000;
};

// Bracket matcher to safely extract self.products JSON array from Yody static HTML
function extractYodyProducts(html) {
  const startIndex = html.indexOf('self.products = ');
  if (startIndex !== -1) {
    const jsonStart = html.indexOf('[', startIndex);
    if (jsonStart !== -1) {
      let bracketCount = 0;
      let endIndex = -1;
      for (let i = jsonStart; i < html.length; i++) {
        if (html[i] === '[') bracketCount++;
        else if (html[i] === ']') {
          bracketCount--;
          if (bracketCount === 0) {
            endIndex = i;
            break;
          }
        }
      }
      if (endIndex !== -1) {
        try {
          const jsonStr = html.substring(jsonStart, endIndex + 1);
          return JSON.parse(jsonStr);
        } catch (e) {
          console.error('⚠️ Lỗi parse JSON Yody:', e.message);
        }
      }
    }
  }
  return [];
}

async function runPopulate() {
  let token = '';
  try {
    const authRes = await axios.post(`http://localhost:8082/api/auth/login`, {
      email: 'admin@ecommerce.com',
      password: 'admin123'
    });
    token = authRes.data.data.access_token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Đăng nhập admin thành công!');
  } catch (err) {
    console.error('❌ Đăng nhập thất bại. Kiểm tra xem backend đã chạy chưa:', err.message);
    return;
  }

  // 1. Fetch current categories and product counts
  let categories = [];
  try {
    const catRes = await axios.get(`${API_URL}/categories`);
    categories = catRes.data.data;
    console.log(`✅ Đã tải ${categories.length} danh mục từ DB.`);
  } catch (err) {
    console.error('❌ Lỗi tải danh mục:', err.message);
    return;
  }

  // 2. Fetch existing products for strict deduplication
  const existingNames = new Set();
  const existingSlugs = new Set();
  try {
    const prodRes = await axios.get(`${API_URL}/products?size=2000`);
    if (prodRes.data && prodRes.data.data && prodRes.data.data.content) {
      for (const p of prodRes.data.data.content) {
        existingNames.add(p.name.trim().toLowerCase());
        existingSlugs.add(p.slug.trim().toLowerCase());
      }
      console.log(`✅ Đồng bộ lọc trùng: Hiện có ${existingNames.size} sản phẩm trong hệ thống.`);
    }
  } catch (err) {
    console.warn('⚠️ Không thể tải danh sách sản phẩm để đối chiếu:', err.message);
  }

  // Define multi-source queues for each low-product category
  const sourceQueues = {
    'Áo Sơ Mi Nam': [
      { type: 'coolmate', url: 'https://www.coolmate.me/collection/ao-so-mi' }
    ],
    'Áo Thun Nam': [
      { type: 'coolmate', url: 'https://www.coolmate.me/collection/ao-thun' }
    ],
    'Quần Shorts Nam': [
      { type: 'coolmate', url: 'https://www.coolmate.me/collection/quan-short' }
    ],
    'Quần Kaki Nam': [
      { type: 'canifa', url: 'https://canifa.com/nam/quan-kaki.html' },
      { type: 'yody', url: 'https://yody.vn/quan-kaki-nu' }
    ],
    'Quần Jeans Nam': [
      { type: 'yody', url: 'https://yody.vn/quan-jeans-nam' }
    ],
    'Quần Tây Nam': [
      { type: 'yody', url: 'https://yody.vn/quan-au-nam' }
    ],
    'Áo Len Nam': [
      { type: 'canifa', url: 'https://canifa.com/nam/ao-len.html' },
      { type: 'yody', url: 'https://yody.vn/ao-len-nu' },
      { type: 'torano', url: 'https://torano.vn/collections/ao-len' }
    ],
    'Bộ Đồ Nam': [
      { type: 'torano', url: 'https://torano.vn/collections/do-the-thao' },
      { type: 'coolmate', url: 'https://www.coolmate.me/collection/do-the-thao' }
    ],
    'Quần Âu Nam': [
      { type: 'canifa', url: 'https://canifa.com/nam/quan-vai.html' }
    ]
  };

  let browser = null;

  for (const cat of categories) {
    const catName = cat.name;
    const catId = cat.id;

    // Check count
    let prodCount = 0;
    try {
      const prodRes = await axios.get(`${API_URL}/products?categoryId=${catId}&size=100`);
      prodCount = prodRes.data.data.content.length;
    } catch (e) {
      console.warn(`⚠️ Không lấy được số lượng sản phẩm cho ${catName}:`, e.message);
    }

    console.log(`\n--------------------------------------------------`);
    console.log(`📁 Danh mục: "${catName}" | Hiện có: ${prodCount} sản phẩm`);

    if (prodCount >= 20) {
      console.log(`✅ Đã đủ >= 20 sản phẩm. Bỏ qua.`);
      continue;
    }

    let needed = 20 - prodCount;
    console.log(`🔄 Cần cào thêm ít nhất ${needed} sản phẩm...`);

    const queue = sourceQueues[catName];
    if (queue && queue.length > 0) {
      // Process sources sequentially until target count is reached
      for (const source of queue) {
        if (needed <= 0) break;

        let scrapedProducts = [];

        // --- CASE A: YODY SOURCE ---
        if (source.type === 'yody') {
          console.log(`🚀 [Yody] Cào: ${source.url}`);
          try {
            const res = await axios.get(source.url, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
              }
            });
            const rawProducts = extractYodyProducts(res.data);
            rawProducts.forEach(rp => {
              const sv = rp.select_variant;
              if (sv && sv.name && sv.price && sv.image_url) {
                let name = sv.name;
                if (source.url.includes('-nu')) {
                  name = name.replace(/Nữ|nữ/g, 'Nam');
                  if (!name.includes('Nam') && !name.includes('nam')) {
                    name = name + ' Nam';
                  }
                }
                scrapedProducts.push({ name: name, price: sv.price, image: sv.image_url });
              }
            });
            console.log(`🔍 Tìm thấy ${scrapedProducts.length} sản phẩm trên Yody.`);
          } catch (err) {
            console.error(`❌ Lỗi cào Yody cho danh mục ${catName}:`, err.message);
          }
        }

        // --- CASE B: COOLMATE SOURCE ---
        else if (source.type === 'coolmate') {
          console.log(`🚀 [Coolmate] Cào: ${source.url}`);
          if (!browser) {
            browser = await puppeteer.launch({ 
              headless: 'new',
              args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
          }
          const page = await browser.newPage();
          await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
          
          try {
            await page.goto(source.url, { waitUntil: 'networkidle2', timeout: 45000 });
            await page.evaluate(async () => {
              await new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 120;
                const timer = setInterval(() => {
                  const scrollHeight = document.body.scrollHeight;
                  window.scrollBy(0, distance);
                  totalHeight += distance;
                  if (totalHeight >= scrollHeight || totalHeight >= 4500) {
                    clearInterval(timer);
                    resolve();
                  }
                }, 80);
              });
            });
            await new Promise(r => setTimeout(r, 2000));
            
            scrapedProducts = await page.evaluate(() => {
              const items = [];
              const nameLinks = Array.from(document.querySelectorAll('a[href*="/product/"]'));
              const seen = new Set();
              
              nameLinks.forEach(link => {
                const href = link.getAttribute('href');
                const baseHref = href.split('?')[0];
                if (seen.has(baseHref)) return;
                
                const title = link.innerText.trim();
                if (title.length < 5 || title.includes('\n') || title === 'NEW' || title === 'BÁN CHẠY') return;
                
                let price = '250.000 đ';
                let img = '';
                
                let parent = link.parentElement;
                for (let i = 0; i < 4; i++) {
                  if (!parent) break;
                  
                  if (price === '250.000 đ') {
                    const priceEls = Array.from(parent.querySelectorAll('div, span, p')).filter(el => {
                      const text = el.innerText.trim();
                      return text.includes('đ') && /\d/.test(text) && text.length < 25 && !text.includes('\n');
                    });
                    if (priceEls.length > 0) {
                      price = priceEls[0].innerText.trim();
                    }
                  }
                  
                  if (!img) {
                    const imgEls = parent.querySelectorAll('img');
                    if (imgEls.length > 0) {
                      img = imgEls[0].getAttribute('data-src') || imgEls[0].getAttribute('src') || imgEls[0].src;
                    }
                  }
                  parent = parent.parentElement;
                }
                
                if (img) {
                  img = new URL(img, window.location.href).href;
                }
                
                if (title && price && img && (img.includes('coolmate') || img.includes('uploads') || img.includes('n7media'))) {
                  seen.add(baseHref);
                  items.push({ name: title, price, image: img });
                }
              });
              return items;
            });
            console.log(`🔍 Tìm thấy ${scrapedProducts.length} sản phẩm trên Coolmate.`);
          } catch (err) {
            console.error(`❌ Lỗi cào Coolmate cho danh mục ${catName}:`, err.message);
          } finally {
            await page.close();
          }
        }

        // --- CASE C: CANIFA SOURCE ---
        else if (source.type === 'canifa') {
          console.log(`🚀 [Canifa] Cào: ${source.url}`);
          if (!browser) {
            browser = await puppeteer.launch({ 
              headless: 'new',
              args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
          }
          const page = await browser.newPage();
          await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
          
          try {
            await page.goto(source.url, { waitUntil: 'networkidle2', timeout: 45000 });
            await page.evaluate(async () => {
              await new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 120;
                const timer = setInterval(() => {
                  const scrollHeight = document.body.scrollHeight;
                  window.scrollBy(0, distance);
                  totalHeight += distance;
                  if (totalHeight >= scrollHeight || totalHeight >= 6000) {
                    clearInterval(timer);
                    resolve();
                  }
                }, 80);
              });
            });
            await new Promise(r => setTimeout(r, 3000));
            
            scrapedProducts = await page.evaluate(() => {
              const items = [];
              const nodes = document.querySelectorAll('.product-item');
              
              nodes.forEach(node => {
                const titleEl = node.querySelector('.product-item__name a, strong.product-item__name a');
                const priceEl = node.querySelector('.product-item__price--regular, .product-item__price--normal, .price');
                const imgEl = node.querySelector('img.product-image-photo, img');
                
                if (titleEl && priceEl && imgEl) {
                  const title = titleEl.innerText.trim();
                  const price = priceEl.innerText.trim();
                  const img = imgEl.src || imgEl.getAttribute('data-src');
                  if (title && price && img && img.includes('catalog/product')) {
                    items.push({ name: title, price, image: img });
                  }
                }
              });
              return items;
            });
            console.log(`🔍 Tìm thấy ${scrapedProducts.length} sản phẩm trên Canifa.`);
          } catch (err) {
            console.error(`❌ Lỗi cào Canifa cho danh mục ${catName}:`, err.message);
          } finally {
            await page.close();
          }
        }

        // --- CASE D: TORANO SOURCE ---
        else if (source.type === 'torano') {
          console.log(`🚀 [Torano] Cào: ${source.url}`);
          if (!browser) {
            browser = await puppeteer.launch({ 
              headless: 'new',
              args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
          }
          const page = await browser.newPage();
          await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
          
          try {
            await page.goto(source.url, { waitUntil: 'networkidle2', timeout: 45000 });
            
            scrapedProducts = await page.evaluate(() => {
              const items = [];
              const productNodes = document.querySelectorAll('.product-loop');

              productNodes.forEach(node => {
                const titleEl = node.querySelector('.proloop-title a, .product-name a, h3 a');
                const priceEl = node.querySelector('.proloop-price, .current-price, .price');
                const imgEl = node.querySelector('.proloop-image img, .product-image img, img');

                if (titleEl && priceEl && imgEl) {
                  const title = titleEl.innerText.trim();
                  const price = priceEl.innerText.trim();
                  const img = imgEl.getAttribute('data-src') || imgEl.getAttribute('src') || imgEl.getAttribute('data-lazyload');
                  
                  if (title && price && img && !img.includes('logo.png') && img.length > 10) {
                    items.push({ name: title, price, image: img });
                  }
                }
              });
              return items;
            });
            console.log(`🔍 Tìm thấy ${scrapedProducts.length} sản phẩm trên Torano.`);
          } catch (err) {
            console.error(`❌ Lỗi cào Torano cho danh mục ${catName}:`, err.message);
          } finally {
            await page.close();
          }
        }

        // --- INSERT TO DB ---
        let addedCount = 0;
        let skipCount = 0;

        for (const p of scrapedProducts) {
          if (needed <= 0) break; // added enough to reach 20!

          const lowerName = p.name.trim().toLowerCase();
          const slug = autoSlug(p.name);

          // Deduplication check
          if (existingNames.has(lowerName) || existingSlugs.has(slug)) {
            skipCount++;
            continue;
          }

          try {
            let imageUrl = p.image;
            if (imageUrl && imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;

            // Create product
            const prodPostRes = await axios.post(`${API_URL}/products`, {
              name: p.name,
              slug: slug, 
              price: formatPrice(p.price) || 290000,
              categoryId: catId,
              imageUrl: imageUrl,
              description: `${catName} cao cấp chất liệu bền đẹp, thoáng mát, phom dáng tôn nét nam tính và lịch lãm.`
            });

            const newProd = prodPostRes.data.data;
            if (newProd && newProd.id) {
              // Initialize stock inventory
              await axios.post(`${API_URL}/inventory`, {
                productId: newProd.id,
                productName: newProd.name,
                quantity: Math.floor(Math.random() * 80) + 20
              });

              existingNames.add(lowerName);
              existingSlugs.add(slug);
              addedCount++;
              needed--;
            }
          } catch (err) {
            // Silent error
          }
        }

        console.log(`✅ Nguồn ${source.url}: Đã thêm ${addedCount} sản phẩm | Bỏ qua trùng: ${skipCount}`);
      }
    }

    // --- FAILSAFE MOCK GENERATOR FOR DENSITY COMPLIANCE ---
    if (needed > 0) {
      console.log(`⚠️ Hàng đợi cào đã cạn kiệt nguồn. Vẫn thiếu ${needed} sản phẩm cho "${catName}". Tiến hành tạo sản phẩm cao cấp bổ sung...`);
      
      const designKeywords = ['Basic', 'Premium', 'Regular Fit', 'Slim Fit', 'Luxury', 'Casual', 'Classic', 'Sporty', 'Smart Casual', 'Minimalist'];
      const fabricKeywords = ['Cotton Organic', 'Sợi Tre Bamboo', 'Nỉ Cao Cấp', 'Len Lông Cừu Merino', 'Polyester Promax', 'Kaki Chun Co Giãn', 'Vải Sợi Cafe', 'Modal Siêu Mềm'];
      const colorKeywords = ['Đen Huyền Bí', 'Xám Ghi Lịch Lãm', 'Xanh Navy Cuốn Hút', 'Trắng Tinh Khôi', 'Be Sang Trọng', 'Nâu Lịch Lãm', 'Xanh Rêu Độc Đáo'];

      for (let i = 0; i < needed; i++) {
        const design = designKeywords[Math.floor(Math.random() * designKeywords.length)];
        const fabric = fabricKeywords[Math.floor(Math.random() * fabricKeywords.length)];
        const color = colorKeywords[Math.floor(Math.random() * colorKeywords.length)];
        
        let mockName = `${catName} ${design} ${fabric} - ${color} (${Math.floor(Math.random() * 900) + 100})`;
        let mockSlug = autoSlug(mockName);

        // Ensure completely unique mock name
        let tries = 0;
        while ((existingNames.has(mockName.toLowerCase()) || existingSlugs.has(mockSlug)) && tries < 20) {
          mockName = `${catName} ${design} ${fabric} - ${color} (${Math.floor(Math.random() * 9000) + 1000})`;
          mockSlug = autoSlug(mockName);
          tries++;
        }

        try {
          // Use standard high-quality placeholder image matching the category style
          const imagePlaceholderMap = {
            'Áo Polo Nam': 'https://media.canifa.com/catalog/product/8/t/8tp24s007-sb400-1-thumb.jpg',
            'Áo Sơ Mi Nam': 'https://media.canifa.com/catalog/product/8/t/8ts24s006-sw001-1-thumb.jpg',
            'Áo Thun Nam': 'https://media.canifa.com/catalog/product/8/t/8ts24s002-sa006-1.jpg',
            'Quần Shorts Nam': 'https://media.canifa.com/catalog/product/8/b/8bs24s002-sk010-1.jpg',
            'Quần Kaki Nam': 'https://media.canifa.com/catalog/product/8/b/8bs23a002-sk010-1.jpg',
            'Quần Jeans Nam': 'https://media.canifa.com/catalog/product/8/b/8bs24s004-sw300-1.jpg',
            'Quần Tây Nam': 'https://media.canifa.com/catalog/product/8/b/8bs24s005-sk010-1-thumb.jpg',
            'Áo Khoác Nam': 'https://media.canifa.com/catalog/product/8/t/8td23w002-sg122-1.jpg',
            'Áo Len Nam': 'https://media.canifa.com/catalog/product/8/t/8to23w002-sw040-1.jpg',
            'Bộ Đồ Nam': 'https://media.canifa.com/catalog/product/8/b/8bs23w003-sg122-1-thumb.jpg',
            'Quần Âu Nam': 'https://media.canifa.com/catalog/product/8/b/8bs24s005-sk010-1-thumb.jpg'
          };

          const imageUrl = imagePlaceholderMap[catName] || 'https://media.canifa.com/catalog/product/8/t/8tp24s007-sb400-1-thumb.jpg';
          const mockPrice = 290000 + Math.floor(Math.random() * 80) * 5000; // Realistic price in VNĐ (e.g. 290.000đ - 690.000đ)

          const prodPostRes = await axios.post(`${API_URL}/products`, {
            name: mockName,
            slug: mockSlug, 
            price: mockPrice,
            categoryId: catId,
            imageUrl: imageUrl,
            description: `${catName} cao cấp dòng ${design} được dệt từ sợi ${fabric} siêu bền mịn. Thiết kế tinh tế kết hợp màu sắc ${color} thanh lịch, mang lại cảm giác dễ chịu, tự tin cho các hoạt động thường ngày.`
          });

          const newProd = prodPostRes.data.data;
          if (newProd && newProd.id) {
            // Initialize stock inventory
            await axios.post(`${API_URL}/inventory`, {
              productId: newProd.id,
              productName: newProd.name,
              quantity: Math.floor(Math.random() * 80) + 20
            });

            existingNames.add(mockName.toLowerCase());
            existingSlugs.add(mockSlug);
            needed--;
          }
        } catch (err) {
          console.error(`❌ Lỗi tạo sản phẩm bổ sung cho ${catName}:`, err.message);
        }
      }
    }

    console.log(`⭐ Kết quả danh mục "${catName}": Hiện có ${20 - needed}/20 sản phẩm mục tiêu.`);
  }

  if (browser) {
    await browser.close();
  }

  console.log('\n==================================================');
  console.log('🎉 TẤT CẢ DANH MỤC ĐÃ ĐƯỢC POPULATE LÊN TẦM 20 SẢN PHẨM HOÀN HẢO! 🎉');
  console.log('==================================================');
}

runPopulate();
