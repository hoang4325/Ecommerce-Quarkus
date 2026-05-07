import requests
from bs4 import BeautifulSoup
import json
import time
import re
from urllib.parse import urljoin
import uuid

# Configuration
BASE_URL = "https://torano.vn"
PRODUCT_SERVICE_URL = "http://localhost:8083/api/products"
CATEGORY_SERVICE_URL = "http://localhost:8083/api/categories"
INVENTORY_SERVICE_URL = "http://localhost:8087/api/inventory"
AUTH_URL = "http://localhost:8080/realms/ecommerce/protocol/openid-connect/token"

# Admin Credentials
ADMIN_USER = "admin@ecommerce.com"
ADMIN_PASS = "admin123"
CLIENT_ID = "ecommerce-backend"
CLIENT_SECRET = "ecommerce-backend-secret"

# We'll scrape all products and try to reach 1000 variants
COLLECTION_URL = "/collections/all"

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text

def get_admin_token():
    payload = {
        'grant_type': 'password',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'username': ADMIN_USER,
        'password': ADMIN_PASS
    }
    response = requests.post(AUTH_URL, data=payload)
    response.raise_for_status()
    return response.json()['access_token']

def get_or_create_category(name, token):
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(CATEGORY_SERVICE_URL, headers=headers)
    if resp.status_code != 200:
        return None
    categories = resp.json().get('data', [])
    for cat in categories:
        if cat['name'] == name:
            return cat['id']
    
    # Create new
    payload = {"name": name, "slug": slugify(name)}
    resp = requests.post(CATEGORY_SERVICE_URL, json=payload, headers=headers)
    if resp.status_code == 201:
        return resp.json()['data']['id']
    return None

def scrape_product_details(url):
    try:
        resp = requests.get(url, timeout=10)
        soup = BeautifulSoup(resp.content, 'html.parser')
        
        name_el = soup.select_one('h1')
        if not name_el: return None
        name = name_el.text.strip()
        
        price_el = soup.select_one('.product-price')
        if not price_el: price_el = soup.select_one('.pro-price')
        price_text = price_el.text.strip() if price_el else "0"
        price = int(re.sub(r'[^\d]', '', price_text))
        if price == 0: price = 500000 # Fallback
        
        description_el = soup.select_one('#pills-home')
        description = description_el.text.strip() if description_el else "Sản phẩm thời trang cao cấp từ Torano."
        
        main_img = soup.select_one('.product-image-feature')
        if not main_img: main_img = soup.select_one('.product-thumb img')
        image_url = urljoin(BASE_URL, main_img['src']) if main_img and main_img.has_attr('src') else ""
        
        # Colors & Sizes
        colors = [el.text.strip() for el in soup.select('.swatch-element.color label')]
        sizes = [el.text.strip() for el in soup.select('.swatch-element.size label')]
        
        # Breadcrumb for category
        cat_el = soup.select_one('.breadcrumb li:nth-child(2) a')
        category_name = cat_el.text.strip() if cat_el else "Thời trang nam"
        
        return {
            "name": name,
            "price": price,
            "description": description,
            "imageUrl": image_url,
            "colors": colors,
            "sizes": sizes,
            "categoryName": category_name
        }
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return None

def add_product(product_data, category_id, token):
    headers = {"Authorization": f"Bearer {token}"}
    added_count = 0
    
    # User wants 1000 products. We'll create variants as separate products.
    colors = product_data['colors'] or ["Mặc định"]
    sizes = product_data['sizes'] or ["Free Size"]
    
    for color in colors:
        for size in sizes:
            slug = slugify(f"{product_data['name']} {color} {size} {uuid.uuid4().hex[:4]}")
            payload = {
                "name": f"{product_data['name']} - {color} - {size}",
                "slug": slug,
                "description": product_data['description'],
                "price": product_data['price'],
                "imageUrl": product_data['imageUrl'],
                "color": color,
                "productSize": size,
                "dressStyle": "Hiện đại",
                "categoryId": category_id
            }
            
            try:
                resp = requests.post(PRODUCT_SERVICE_URL, json=payload, headers=headers)
                if resp.status_code == 201:
                    prod_id = resp.json()['data']['id']
                    added_count += 1
                    # Add inventory
                    inv_payload = {"productId": prod_id, "quantity": 100}
                    requests.post(INVENTORY_SERVICE_URL, json=inv_payload, headers=headers)
                else:
                    print(f"Failed to add product: {resp.status_code} {resp.text[:100]}")
            except Exception as e:
                print(f"Error adding variant: {e}")
                
    return added_count

def main():
    try:
        token = get_admin_token()
        print("Authenticated successfully.")
    except Exception as e:
        print(f"Auth failed: {e}")
        return

    total_added = 0
    target_count = 1000
    page = 1
    
    category_cache = {}

    while total_added < target_count:
        url = f"{BASE_URL}{COLLECTION_URL}?page={page}"
        print(f"Fetching collection page: {url}")
        resp = requests.get(url)
        if resp.status_code != 200:
            print("Finished or error fetching page.")
            break
            
        soup = BeautifulSoup(resp.content, 'html.parser')
        product_links = [urljoin(BASE_URL, a['href']) for a in soup.select('.proloop-link')]
        
        if not product_links:
            print("No more products found.")
            break
            
        for link in product_links:
            if total_added >= target_count:
                break
                
            print(f"Scraping: {link}")
            details = scrape_product_details(link)
            if details:
                cat_name = details['categoryName']
                if cat_name not in category_cache:
                    category_cache[cat_name] = get_or_create_category(cat_name, token)
                
                cat_id = category_cache[cat_name]
                if cat_id:
                    count = add_product(details, cat_id, token)
                    total_added += count
                    print(f"Added {count} variants. Total: {total_added}")
            
            time.sleep(0.2)
            
        page += 1
        if page > 50: break # Safety

    print(f"FINISHED. Total products added: {total_added}")

if __name__ == "__main__":
    main()
