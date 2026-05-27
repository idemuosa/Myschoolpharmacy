# build_apk.ps1 - Standardized Android APK Build
$ProjectRoot = $PSScriptRoot
$FrontendDir = Join-Path $ProjectRoot "pharmacy"
$AndroidDir = Join-Path $FrontendDir "android"
$JavaHome = "C:\Program Files\Android\Android Studio\jbr"
$AndroidHome = "$env:USERPROFILE\AppData\Local\Android\Sdk"

Write-Host "--- Josiah Pharmacy Android Build ---" -ForegroundColor Cyan

# 1. Build React Frontend
Write-Host "[1/3] Building Web Assets..." -ForegroundColor Green
Set-Location $FrontendDir
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "Web build failed."; exit 1 }

# 2. Sync to Android
Write-Host "[2/3] Syncing Capacitor Android..." -ForegroundColor Green
npx cap sync android
if ($LASTEXITCODE -ne 0) { Write-Error "Capacitor sync failed."; exit 1 }

# 3. Build APK
Write-Host "[3/3] Running Gradle Build..." -ForegroundColor Green
Set-Location $AndroidDir
# Set environment variables for the current session
$env:JAVA_HOME = $JavaHome
$env:ANDROID_HOME = $AndroidHome

# Create local.properties
"sdk.dir=$AndroidHome" | Out-File -FilePath "local.properties" -Encoding utf8

# Set compile SDK to 34/35 in variables.gradle if needed
# We already did this via replace_file_content earlier

./gradlew assembleDebug --no-daemon
if ($LASTEXITCODE -ne 0) { Write-Error "Android build failed."; exit 1 }

# Move APK to root
$ApkPath = Join-Path $AndroidDir "app\build\outputs\apk\debug\app-debug.apk"
Copy-Item $ApkPath "$ProjectRoot\josiah-pharmacy-v3.apk" -Force

Write-Host "--- Build Complete! ---" -ForegroundColor Cyan
Write-Host "Final APK: $ProjectRoot\josiah-pharmacy-v3.apk"
