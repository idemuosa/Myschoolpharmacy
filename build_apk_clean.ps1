# Mobile APK Release Build
$ProjectRoot = $PSScriptRoot
$MobileDir = Join-Path $ProjectRoot "pharmacy\mobile"
# Flutter may be in different locations - check both
$FlutterSDK = if (Test-Path "$ProjectRoot\pharmacy\flutter\bin\flutter.bat") {
    Join-Path $ProjectRoot "pharmacy\flutter\bin\flutter.bat"
} else {
    "C:\Users\sagacious wizzy\Desktop\my school\pharmacy\flutter\bin\flutter.bat"
}
$APKOutput = Join-Path $ProjectRoot "app-release.apk"

Write-Host "===== Pharmacy APK Build =====" -ForegroundColor Cyan

# Set Android environment
$env:ANDROID_HOME = "$env:USERPROFILE\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
Write-Host "Android SDK: $env:ANDROID_HOME" -ForegroundColor Green

# Validate
if (-not (Test-Path $MobileDir)) {
    Write-Error "Mobile folder not found" -ErrorAction Stop
}

if (-not (Test-Path $FlutterSDK)) {
    Write-Error "Flutter not found" -ErrorAction Stop
}

# Check for keystore
$KeystorePath = Join-Path $MobileDir "android\app\pharmacy-release.keystore"
if (-not (Test-Path $KeystorePath)) {
    Write-Host "Creating release keystore..." -ForegroundColor Cyan
    $Pass = Read-Host "Enter keystore password"
    keytool -genkey -v -keystore $KeystorePath -keyalg RSA -keysize 2048 -validity 10000 -alias pharmacy-key -storepass $Pass -keypass $Pass -dname "CN=Pharmacy,O=Org,L=KE,C=KE"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Keystore creation failed" -ErrorAction Stop
    }
}

# Set signing environment
$env:KEYSTORE_FILE = $KeystorePath
$env:KEY_ALIAS = "pharmacy-key"
if (-not $env:KEYSTORE_PASSWORD) {
    $env:KEYSTORE_PASSWORD = Read-Host "Keystore password"
}
$env:KEY_PASSWORD = $env:KEYSTORE_PASSWORD

# Build
Write-Host "Building APK..." -ForegroundColor Cyan
Set-Location $MobileDir
& "$FlutterSDK" clean 2>&1 | Out-Null
& "$FlutterSDK" pub get
& "$FlutterSDK" build apk --release

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed" -ErrorAction Stop
}

# Copy output
$BuildAPK = Join-Path $MobileDir "build\app\outputs\flutter-apk\app-release.apk"
if (Test-Path $BuildAPK) {
    Copy-Item $BuildAPK $APKOutput -Force
    $MB = (Get-Item $APKOutput).Length / 1MB
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "APK: $APKOutput" -ForegroundColor Green
    Write-Host "Size: $([math]::Round($MB, 2)) MB" -ForegroundColor Green
} else {
    Write-Error "APK not created" -ErrorAction Stop
}
