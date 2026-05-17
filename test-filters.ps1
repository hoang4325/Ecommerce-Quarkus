
$baseUrl = "http://localhost:8086/api"

Write-Host "--- 1. Fetching Categories ---" -ForegroundColor Cyan
$categories = Invoke-RestMethod -Uri "$baseUrl/categories"
$categories.data | Format-Table id, name

$catId = $categories.data[0].id
$catName = $categories.data[0].name

Write-Host "--- 2. Filter by Category ($catName) ---" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$baseUrl/products?categoryId=$catId" | Select-Object -ExpandProperty data | Select-Object -ExpandProperty content | Format-Table id, name, price

Write-Host "--- 3. Filter by Price Range ($50 - $150) ---" -ForegroundColor Cyan
# Price in DB is usually multiplied by 10000 based on previous formatPrice function? 
# Wait, let's check a product price first.
$products = Invoke-RestMethod -Uri "$baseUrl/products"
$p = $products.data.content[0]
Write-Host "Sample product price: $($p.price)"

$min = 500000
$max = 1500000
Invoke-RestMethod -Uri "$baseUrl/products?minPrice=$min&maxPrice=$max" | Select-Object -ExpandProperty data | Select-Object -ExpandProperty content | Format-Table id, name, price

Write-Host "--- 4. Search Filter (shirt) ---" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$baseUrl/products?search=shirt" | Select-Object -ExpandProperty data | Select-Object -ExpandProperty content | Format-Table id, name, price

Write-Host "--- 5. Color Filter (#063AF5 - Blue) ---" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$baseUrl/products?color=%23063AF5" | Select-Object -ExpandProperty data | Select-Object -ExpandProperty content | Format-Table id, name, price

Write-Host "--- 6. Size Filter (Large) ---" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$baseUrl/products?productSize=Large" | Select-Object -ExpandProperty data | Select-Object -ExpandProperty content | Format-Table id, name, price

Write-Host "--- 7. Style Filter (Casual) ---" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$baseUrl/products?style=Casual" | Select-Object -ExpandProperty data | Select-Object -ExpandProperty content | Format-Table id, name, price

Write-Host "--- 8. Sorting (Price High to Low) ---" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$baseUrl/products?sort=price,desc" | Select-Object -ExpandProperty data | Select-Object -ExpandProperty content | Format-Table id, name, price
