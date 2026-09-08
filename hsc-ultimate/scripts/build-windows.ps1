# ===================================================================
# HSC Ultimate — Windows MSIX Build Script
# ===================================================================
# Usage (PowerShell):
#   .\scripts\build-windows.ps1           # Release MSIX
#   .\scripts\build-windows.ps1 -Debug    # Debug build
#   .\scripts\build-windows.ps1 -Publish  # Publish to local folder
# ===================================================================

param(
  [switch]$Debug,
  [switch]$Publish
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

$AppName = "HSC Ultimate"
$BundleId = "com.hscultimate.app"
$Version = (Get-Content package.json | ConvertFrom-Json).version

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  $AppName - Windows Build" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Bundle ID: $BundleId"
Write-Host "Version:   $Version"
Write-Host "============================================"
Write-Host ""

# 1. Check prerequisites
Write-Host "[1/5] Checking prerequisites..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "❌ Node.js not installed" -ForegroundColor Red; exit 1
}
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
  Write-Host "⚠️  .NET SDK not installed (need 6.0+)" -ForegroundColor Red
  Write-Host "   Download: https://dotnet.microsoft.com/download"
  exit 1
}
Write-Host "✅ Prerequisites OK" -ForegroundColor Green
Write-Host ""

# 2. Build Next.js
Write-Host "[2/5] Building Next.js app..." -ForegroundColor Yellow
if (-not $env:CAPACITOR_SERVER_URL) {
  Write-Host "   Building static export..."
  npx next build
} else {
  Write-Host "   Using server URL: $env:CAPACITOR_SERVER_URL"
}
Write-Host "✅ Build done" -ForegroundColor Green
Write-Host ""

# 3. Add Windows platform (if not exists)
Write-Host "[3/5] Setting up Windows platform..." -ForegroundColor Yellow
if (-not (Test-Path "windows")) {
  Write-Host "   Adding Windows platform..."
  npm install --save @capacitor/windows
  npx cap add windows
} else {
  Write-Host "   Windows platform already exists"
}
Write-Host "✅ Windows platform ready" -ForegroundColor Green
Write-Host ""

# 4. Sync
Write-Host "[4/5] Syncing Capacitor..." -ForegroundColor Yellow
npx cap sync windows
Write-Host "✅ Sync done" -ForegroundColor Green
Write-Host ""

# 5. Build
Write-Host "[5/5] Building Windows app..." -ForegroundColor Yellow
Set-Location windows

if ($Debug) {
  dotnet build -c Debug
} elseif ($Publish) {
  dotnet publish -c Release -r win-x64 --self-contained true -o "../dist/windows"
  Write-Host ""
  Write-Host "============================================" -ForegroundColor Green
  Write-Host "  ✅ BUILD SUCCESSFUL" -ForegroundColor Green
  Write-Host "============================================" -ForegroundColor Green
  Write-Host "Output: dist/windows/HSC Ultimate.exe"
  Write-Host ""
  Get-ChildItem "../dist/windows/*.exe" | Select-Object Name, Length
} else {
  dotnet build -c Release
  Write-Host ""
  Write-Host "============================================" -ForegroundColor Green
  Write-Host "  ✅ BUILD SUCCESSFUL" -ForegroundColor Green
  Write-Host "============================================" -ForegroundColor Green
  Write-Host "Output: windows/bin/Release/net6.0-windows10.0.19041.0/win-x64/HSC Ultimate.exe"
  Write-Host ""
  Write-Host "To create MSIX installer:"
  Write-Host "  1. Open 'windows/HSC Ultimate.sln' in Visual Studio"
  Write-Host "  2. Right-click project → Publish → Create App Packages"
  Write-Host "  3. Choose 'Sideloading' for direct distribution"
}

Set-Location ..
