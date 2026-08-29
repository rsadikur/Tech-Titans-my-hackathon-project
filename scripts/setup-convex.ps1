# Convex Setup Script for CJP Platform
# Run this script after the project is configured to initialize Convex backend

Write-Host "=== CJP Platform - Convex Backend Setup ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install dependencies (if not already installed)
if (-not (Test-Path -Path "..\node_modules\convex")) {
    Write-Host "[1/3] Installing Convex dependencies..." -ForegroundColor Yellow
    npm install convex@latest
} else {
    Write-Host "[1/3] Convex dependency already installed" -ForegroundColor Green
}

# Step 2: Initialize Convex (creates deployment, generates _generated files, updates .env.local)
Write-Host "[2/3] Initializing Convex deployment..." -ForegroundColor Yellow
Write-Host "      This will open a browser to create/login to your Convex account." -ForegroundColor Gray
npx convex dev

# Step 3: Verify setup
Write-Host ""
Write-Host "[3/3] Verifying setup..." -ForegroundColor Yellow
if (Test-Path -Path "..\.env.local") {
    $content = Get-Content -Path "..\.env.local"
    if ($content -match "NEXT_PUBLIC_CONVEX_URL=") {
        Write-Host "      .env.local contains NEXT_PUBLIC_CONVEX_URL" -ForegroundColor Green
    }
}
if (Test-Path -Path "..\convex\_generated\api.d.ts") {
    Write-Host "      Convex _generated files exist" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host "Run 'npm run dev' to start the development server" -ForegroundColor Cyan
