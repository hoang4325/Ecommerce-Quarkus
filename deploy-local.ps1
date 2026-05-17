<#
.SYNOPSIS
    Deploy ElectroShop E-Commerce to local Kubernetes (Docker Desktop).

.DESCRIPTION
    This script:
    1. Verifies Docker Desktop Kubernetes is enabled
    2. Builds all Docker images locally
    3. Applies K8s manifests in the correct order
    4. Waits for all pods to be ready

.EXAMPLE
    .\deploy-local.ps1           # Full deploy
    .\deploy-local.ps1 -SkipBuild  # Skip Docker build, only apply K8s
#>
param(
    [switch]$SkipBuild
)

$ErrorActionPreference = "Continue"
Set-Location $PSScriptRoot

# ─── Colors ───────────────────────────────────────────────────────────────────
function Write-Step($msg) { Write-Host "`n🔹 $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "  ✅ $msg" -ForegroundColor Green }
function Write-Err($msg)  { Write-Host "  ❌ $msg" -ForegroundColor Red }
function Write-Warn($msg) { Write-Host "  ⚠️  $msg" -ForegroundColor Yellow }

# ─── 0. Pre-flight checks ────────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║     ElectroShop — Local Kubernetes Deployment               ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta

Write-Step "Checking prerequisites..."

# Check Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Err "Docker not found. Install Docker Desktop first!"
    exit 1
}
$dockerOut = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Err "Docker is not running. Start Docker Desktop first!"
    exit 1
}
Write-Ok "Docker is running"

# Check kubectl
if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Err "kubectl not found!"
    Write-Host ""
    Write-Host "  HOW TO FIX:" -ForegroundColor Yellow
    Write-Host "  1. Open Docker Desktop -> Settings -> Kubernetes" -ForegroundColor Yellow
    Write-Host "  2. Enable Kubernetes -> Apply & Restart" -ForegroundColor Yellow
    Write-Host "  OR install kubectl manually:" -ForegroundColor Yellow
    Write-Host "     winget install Kubernetes.kubectl" -ForegroundColor Yellow
    exit 1
}
Write-Ok "kubectl is installed"

# Check Kubernetes cluster
Write-Step "Verifying Kubernetes cluster..."
$clusterOut = kubectl cluster-info 2>&1
$clusterExit = $LASTEXITCODE

if ($clusterExit -ne 0) {
    Write-Err "Kubernetes cluster is NOT running!"
    Write-Host ""
    Write-Host "  HOW TO FIX:" -ForegroundColor Yellow
    Write-Host "  1. Open Docker Desktop" -ForegroundColor Yellow
    Write-Host "  2. Go to Settings (gear icon)" -ForegroundColor Yellow
    Write-Host "  3. Click 'Kubernetes' in the sidebar" -ForegroundColor Yellow
    Write-Host "  4. Check 'Enable Kubernetes'" -ForegroundColor Yellow
    Write-Host "  5. Click 'Apply & Restart'" -ForegroundColor Yellow
    Write-Host "  6. Wait 2-3 minutes for K8s to start" -ForegroundColor Yellow
    Write-Host "  7. Re-run this script" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
Write-Ok "Kubernetes cluster is running"

# ─── 1. Build Docker images ──────────────────────────────────────────────────
$services = @(
    @{ Name = "auth-service";         Dockerfile = "backend/auth-service/Dockerfile" },
    @{ Name = "product-service";      Dockerfile = "backend/product-service/Dockerfile" },
    @{ Name = "cart-service";         Dockerfile = "backend/cart-service/Dockerfile" },
    @{ Name = "order-service";        Dockerfile = "backend/order-service/Dockerfile" },
    @{ Name = "inventory-service";    Dockerfile = "backend/inventory-service/Dockerfile" },
    @{ Name = "payment-service";      Dockerfile = "backend/payment-service/Dockerfile" },
    @{ Name = "notification-service"; Dockerfile = "backend/notification-service/Dockerfile" },
    @{ Name = "user-service";         Dockerfile = "backend/user-service/Dockerfile" },
    @{ Name = "api-gateway";          Dockerfile = "backend/api-gateway/Dockerfile" },
    @{ Name = "frontend";             Dockerfile = "frontend/Dockerfile" }
)

if (-not $SkipBuild) {
    Write-Step "Building Docker images (this may take a while)..."

    foreach ($svc in $services) {
        $tag = "ecommerce/$($svc.Name):latest"
        Write-Host "  📦 Building $tag ..." -ForegroundColor DarkGray
        docker build -t $tag -f $svc.Dockerfile .
        if ($LASTEXITCODE -ne 0) {
            Write-Err "Failed to build $($svc.Name)"
            exit 1
        }
        Write-Ok "$($svc.Name) built"
    }
} else {
    Write-Warn "Skipping Docker build (--SkipBuild flag)"
}

# ─── 2. Apply K8s manifests ──────────────────────────────────────────────────
Write-Step "Applying Kubernetes manifests..."

# Namespace first
kubectl apply -f k8s/namespace.yaml
Write-Ok "Namespace created"

# Secrets & ConfigMaps
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/configmap.yaml
Write-Ok "Secrets & ConfigMaps applied"

# Infrastructure
Write-Step "Deploying infrastructure (PostgreSQL, Kafka, Keycloak)..."
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/kafka.yaml
kubectl apply -f k8s/keycloak.yaml
Write-Ok "Infrastructure deployed"

# Wait for Postgres to be ready
Write-Step "Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n ecommerce --timeout=120s 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Warn "PostgreSQL not ready yet, waiting 30s more..."
    Start-Sleep -Seconds 30
}
Write-Ok "PostgreSQL is ready"

# Backend microservices
Write-Step "Deploying backend microservices..."
kubectl apply -f k8s/auth-service.yaml
kubectl apply -f k8s/product-service.yaml
kubectl apply -f k8s/cart-service.yaml
kubectl apply -f k8s/order-service.yaml
kubectl apply -f k8s/inventory-service.yaml
kubectl apply -f k8s/payment-service.yaml
kubectl apply -f k8s/notification-service.yaml
kubectl apply -f k8s/user-service.yaml
kubectl apply -f k8s/api-gateway.yaml
Write-Ok "All backend services deployed"

# Frontend
Write-Step "Deploying frontend..."
kubectl apply -f k8s/frontend.yaml
Write-Ok "Frontend deployed"

# ─── 3. Wait for rollouts ────────────────────────────────────────────────────
Write-Step "Waiting for deployments to be ready (timeout: 3 min)..."

$deployments = @("api-gateway", "frontend")
foreach ($dep in $deployments) {
    Write-Host "  ⏳ Waiting for $dep..." -ForegroundColor DarkGray
    kubectl rollout status deployment/$dep -n ecommerce --timeout=180s 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Ok "$dep is ready"
    } else {
        Write-Warn "$dep not fully ready yet (services may still be starting)"
    }
}

# ─── 4. Final status ─────────────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║     🎉  Deployment Complete!                                 ║" -ForegroundColor Green
Write-Host "╠══════════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║                                                              ║" -ForegroundColor Green
Write-Host "║  Frontend:    http://localhost:30000                         ║" -ForegroundColor Green
Write-Host "║  API Gateway: http://localhost:30086                         ║" -ForegroundColor Green
Write-Host "║  Keycloak:    http://localhost:30080                         ║" -ForegroundColor Green
Write-Host "║                                                              ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Step "Pod status:"
kubectl get pods -n ecommerce -o wide

Write-Host ""
Write-Step "Services:"
kubectl get svc -n ecommerce
