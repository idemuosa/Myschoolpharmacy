# build_dist.ps1 - Automate Windows and Android Builds

$ProjectRoot = "c:\Users\sagacious wizzy\Desktop\my school"
$MobileDir = Join-Path $ProjectRoot "pharmacy\mobile"
$FlutterSDK = Join-Path $ProjectRoot "pharmacy\flutter\bin\flutter.bat"
$AndroidSDK = "c:\Users\sagacious wizzy\AppData\Local\Android\Sdk"

# Set Android SDK environment for this session
$env:ANDROID_HOME = $AndroidSDK
$env:ANDROID_SDK_ROOT = $AndroidSDK

Write-Host "--- Josiah Pharmacy Build Automation ---" -ForegroundColor Cyan

# 1. Android Build via Host
Write-Host "[1/2] Building Android APK via Host SDK..." -ForegroundColor Green
Set-Location $MobileDir
& "$FlutterSDK" build apk --release
if ($LASTEXITCODE -ne 0) { Write-Error "Android build failed."; exit 1 }

Write-Host "Copying APK to root..." -ForegroundColor DarkCyan
Copy-Item "build\app\outputs\flutter-apk\app-release.apk" "$ProjectRoot\app-release.apk" -Force

# 2. Windows Build via Local Host
Write-Host "[2/2] Building Windows EXE via Local SDK..." -ForegroundColor Green
Set-Location $MobileDir
& "$FlutterSDK" build windows --release
if ($LASTEXITCODE -ne 0) { Write-Error "Windows build failed."; exit 1 }

Write-Host "Copying Windows executable..." -ForegroundColor DarkCyan
New-Item -ItemType Directory -Force -Path "$ProjectRoot\release-windows\"
Copy-Item "build\windows\runner\Release\*" "$ProjectRoot\release-windows\" -Recurse -Force

Write-Host "--- Build Complete! ---" -ForegroundColor Cyan
Write-Host "Android APK: $ProjectRoot\app-release.apk"
Write-Host "Windows EXE: $ProjectRoot\release-windows\mobile.exe"
