# build_apk.ps1 - Mobile APK Release Build Script
param(
    [switch]$CreateKeystore,
    [string]$KeystorePassword,
    [string]$KeyPassword
)

$ProjectRoot = $PSScriptRoot
$MobileDir = Join-Path $ProjectRoot "pharmacy\mobile"
$AndroidDir = Join-Path $MobileDir "android"
$AppDir = Join-Path $AndroidDir "app"
$KeystorePath = Join-Path $AppDir "pharmacy-release.keystore"
$FlutterSDK = Join-Path $ProjectRoot "pharmacy\flutter\bin\flutter.bat"
$AndroidSDK = "$env:USERPROFILE\AppData\Local\Android\Sdk"

Write-Host "===== Josiah Pharmacy Mobile APK Release Build =====" -ForegroundColor Cyan

# Validation
if (-not (Test-Path $MobileDir)) {
    Write-Error "Mobile directory not found at $MobileDir" -ErrorAction Stop
}

if (-not (Test-Path $FlutterSDK)) {
    Write-Error "Flutter SDK not found at $FlutterSDK" -ErrorAction Stop
}

# Setup environment
Write-Host "[1/6] Setting up build environment..." -ForegroundColor Green
$env:ANDROID_HOME = $AndroidSDK
$env:ANDROID_SDK_ROOT = $AndroidSDK

# Check for Android SDK with spaces warning
if ($env:ANDROID_HOME -like "* *") {
    Write-Host "WARNING: Android SDK path contains spaces" -ForegroundColor Yellow
}

# Keystore setup
Write-Host "[2/6] Checking release signing configuration..." -ForegroundColor Green

if (-not (Test-Path $KeystorePath)) {
    Write-Host "Release keystore not found" -ForegroundColor Yellow
    
    $GenerateKeystore = if ($CreateKeystore) { $true } else { (Read-Host "Generate keystore? (y/n)") -eq "y" }
    
    if ($GenerateKeystore) {
        Write-Host "Generating release keystore..." -ForegroundColor Cyan
        $StorePass = if ($KeystorePassword) { $KeystorePassword } else { Read-Host "Enter keystore password" }
        $KeyPass = if ($KeyPassword) { $KeyPassword } else { $StorePass }
        
        $DNString = "CN=Josiah,OU=Dev,O=Pharmacy,L=Nbi,ST=Kenya,C=KE"
        keytool -genkey -v -keystore $KeystorePath -keyalg RSA -keysize 2048 -validity 10000 -alias pharmacy-key -storepass $StorePass -keypass $KeyPass -dname $DNString
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Keystore created!" -ForegroundColor Green
        } else {
            Write-Error "Failed to create keystore" -ErrorAction Stop
        }
    } else {
        Write-Error "Keystore required for release build" -ErrorAction Stop
    }
}

# Set environment variables for signing
$env:KEYSTORE_FILE = $KeystorePath
$env:KEY_ALIAS = "pharmacy-key"

if (-not $env:KEYSTORE_PASSWORD) {
    if ($KeystorePassword) {
        $env:KEYSTORE_PASSWORD = $KeystorePassword
    } else {
        $env:KEYSTORE_PASSWORD = Read-Host "Enter keystore password"
    }
}

if (-not $env:KEY_PASSWORD) {
    $env:KEY_PASSWORD = $env:KEYSTORE_PASSWORD
}

Write-Host "Signing configured" -ForegroundColor Green

# Clean
Write-Host "[3/6] Cleaning..." -ForegroundColor Green
Set-Location $MobileDir
& "$FlutterSDK" clean 2>&1 | Out-Null

# Get dependencies
Write-Host "[4/6] Getting dependencies..." -ForegroundColor Green
& "$FlutterSDK" pub get
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to get Flutter dependencies" -ErrorAction Stop
}

# Build
Write-Host "[5/6] Building APK..." -ForegroundColor Green
Write-Host "This may take 5-10 minutes..." -ForegroundColor Cyan
& "$FlutterSDK" build apk --release
if ($LASTEXITCODE -ne 0) {
    Write-Error "APK build failed" -ErrorAction Stop
}

# Copy to root
Write-Host "[6/6] Finalizing..." -ForegroundColor Green
$APKSource = Join-Path $MobileDir "build\app\outputs\flutter-apk\app-release.apk"
$APKDest = Join-Path $ProjectRoot "app-release.apk"

if (Test-Path $APKSource) {
    Copy-Item $APKSource $APKDest -Force
    $FileSize = (Get-Item $APKDest).Length / 1MB
    Write-Host "SUCCESS! APK ready" -ForegroundColor Green
    Write-Host "Output: $APKDest" -ForegroundColor Cyan
    Write-Host "Size: $([math]::Round($FileSize, 2)) MB" -ForegroundColor Cyan
} else {
    Write-Error "APK not found after build" -ErrorAction Stop
}
