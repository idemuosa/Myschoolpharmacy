# build_apk.ps1 - Standardized Android APK Build
$ProjectRoot = $PSScriptRoot
$FrontendDir = Join-Path $ProjectRoot "pharmacy"
$AndroidDir = Join-Path $FrontendDir "android"

# Try to find a valid Android SDK path without spaces
$PossibleSdkPaths = @(
    "C:\AndroidSDK",
    "C:\Android\Sdk",
    "$env:USERPROFILE\AppData\Local\Android\Sdk"
)

$AndroidHome = ""
foreach ($path in $PossibleSdkPaths) {
    if (Test-Path $path) {
        $AndroidHome = $path
        break
    }
}

# Try to find Java Home
$JavaHome = "C:\Program Files\Android\Android Studio\jbr"
if (-not (Test-Path $JavaHome)) {
    $JavaHome = $env:JAVA_HOME
}

Write-Host "--- Josiah Pharmacy Android Build ---" -ForegroundColor Cyan
Write-Host "Using SDK: $AndroidHome" -ForegroundColor Yellow
Write-Host "Using Java: $JavaHome" -ForegroundColor Yellow

if ($AndroidHome -like "* *") {
    Write-Host "WARNING: Android SDK path contains spaces. This may cause NDK build errors." -ForegroundColor Red
}

# 1. Build React Frontend
Write-Host "[1/3] Building Web Assets..." -ForegroundColor Green
Set-Location $FrontendDir
npm install --legacy-peer-deps  # Ensure deps are present
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
"sdk.dir=$($AndroidHome.Replace('\', '/'))" | Out-File -FilePath "local.properties" -Encoding utf8

./gradlew assembleDebug --no-daemon
if ($LASTEXITCODE -ne 0) { Write-Error "Android build failed."; exit 1 }

# Move APK to root
$ApkPath = Join-Path $AndroidDir "app\build\outputs\apk\debug\app-debug.apk"
Copy-Item $ApkPath "$ProjectRoot\josiah-pharmacy-v3.apk" -Force

Write-Host "--- Build Complete! ---" -ForegroundColor Cyan
Write-Host "Final APK: $ProjectRoot\josiah-pharmacy-v3.apk"
