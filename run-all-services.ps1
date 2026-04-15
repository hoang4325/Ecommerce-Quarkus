$services = @(
    "auth-service",
    "cart-service",
    "inventory-service",
    "notification-service",
    "order-service",
    "payment-service",
    "product-service",
    "user-service"
)

Write-Host "Building common-lib first..." -ForegroundColor Green
mvn clean install -pl common-lib -am -DskipTests

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to build common-lib. Please check the errors above."
    exit $LASTEXITCODE
}

Write-Host "Starting backed services in separate cmd windows..." -ForegroundColor Green

foreach ($service in $services) {
    Write-Host "Starting $service..."
    # Mở 1 cửa sổ cmd mới, chuyển vào thư mục service và chạy mvn quarkus:dev
    Start-Process "cmd.exe" -ArgumentList "/c title $service & cd .\backend\$service & mvn quarkus:dev"
}

Write-Host "Waiting 40 seconds for backend services to boot before starting API Gateway..." -ForegroundColor Magenta
Start-Sleep -Seconds 40

Write-Host "Starting api-gateway..." -ForegroundColor Green
Start-Process "cmd.exe" -ArgumentList "/c title api-gateway & cd .\backend\api-gateway & mvn quarkus:dev"

Write-Host "All services and API Gateway are starting up!" -ForegroundColor Cyan
Write-Host "Make sure to run 'docker-compose up -d' for Postgres, Keycloak, and Kafka if you haven't already." -ForegroundColor Yellow
