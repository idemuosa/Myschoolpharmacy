@echo off
REM Mobile APK Release Build Helper
REM Run this script from PharmacyEHR root directory

echo.
echo ===== Josiah Pharmacy Mobile APK Build =====
echo.

REM Check if in correct directory
if not exist "pharmacy\mobile" (
    echo ERROR: Run this script from PharmacyEHR root directory
    exit /b 1
)

REM Set local paths
setlocal enabledelayedexpansion
set "MOBILE_DIR=%CD%\pharmacy\mobile"
set "ANDROID_DIR=%MOBILE_DIR%\android"
set "KEYSTORE_PATH=%ANDROID_DIR%\app\pharmacy-release.keystore"

REM Check for Flutter SDK
if not exist "pharmacy\flutter\bin\flutter.bat" (
    echo ERROR: Flutter SDK not found at pharmacy\flutter
    echo Please ensure Flutter is installed in pharmacy\flutter directory
    exit /b 1
)

echo [1/5] Checking build prerequisites...
echo Checking Android SDK location...
if "%ANDROID_HOME%"=="" (
    echo WARNING: ANDROID_HOME not set
    echo Set it to a path WITHOUT spaces, e.g., C:\Android\Sdk
    set "ANDROID_HOME=%USERPROFILE%\AppData\Local\Android\Sdk"
    echo Using default: !ANDROID_HOME!
)

echo Checking for keystore file...
if not exist "%KEYSTORE_PATH%" (
    echo WARNING: Release keystore not found at %KEYSTORE_PATH%
    echo You need to create it first. Run from admin PowerShell:
    echo.
    echo keytool -genkey -v -keystore %KEYSTORE_PATH% ^
    echo   -keyalg RSA -keysize 2048 -validity 10000 ^
    echo   -alias pharmacy-key
    echo.
    set /p "CREATE_KEYSTORE=Create keystore now? (y/n): "
    if /i "!CREATE_KEYSTORE!"=="y" (
        echo Running keytool...
        where keytool >nul 2>&1
        if errorlevel 1 (
            echo ERROR: keytool not found. Is Java installed?
            exit /b 1
        )
    )
)

REM Check environment variables for signing
echo.
echo [2/5] Checking signing configuration...
if "%KEYSTORE_PASSWORD%"=="" (
    echo WARNING: KEYSTORE_PASSWORD environment variable not set
    set /p "KEYSTORE_PASSWORD=Enter keystore password: "
)

if "%KEY_ALIAS%"=="" (
    set "KEY_ALIAS=pharmacy-key"
)

if "%KEY_PASSWORD%"=="" (
    echo WARNING: KEY_PASSWORD not set, using keystore password
    set "KEY_PASSWORD=%KEYSTORE_PASSWORD%"
)

REM Set environment for this build
set "ANDROID_SDK_ROOT=%ANDROID_HOME%"
set "KEYSTORE_FILE=%KEYSTORE_PATH%"

echo Keystore: %KEYSTORE_FILE%
echo Key Alias: %KEY_ALIAS%
echo.

REM Navigate to mobile directory
cd /d "%MOBILE_DIR%"

echo [3/5] Cleaning previous build artifacts...
call ..\flutter\bin\flutter.bat clean
if errorlevel 1 (
    echo ERROR: Flutter clean failed
    exit /b 1
)

echo [4/5] Building release APK...
echo This may take several minutes...
call ..\flutter\bin\flutter.bat build apk --release

if errorlevel 1 (
    echo.
    echo ERROR: Android APK build failed
    echo Check the output above for details
    exit /b 1
)

echo.
echo [5/5] Copying APK to root directory...
if exist "build\app\outputs\flutter-apk\app-release.apk" (
    copy "build\app\outputs\flutter-apk\app-release.apk" "%CD%\..\..\app-release.apk"
    echo.
    echo SUCCESS! APK built and copied to: %CD%\..\..\app-release.apk
    echo.
    echo Next steps:
    echo - Test APK on physical device or emulator
    echo - For Play Store: sign the APK and upload
    echo.
) else (
    echo ERROR: APK file not found after build
    echo Check build output directory: build\app\outputs\flutter-apk\
    exit /b 1
)

echo Done!
pause
