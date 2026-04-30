# APK Build Setup - Quick Guide

## Issue Found
Flutter SDK is not accessible at the expected location. The build script needs Flutter to compile your app.

## Solution: Download Flutter

### Step 1: Download Flutter  

1. Go to https://flutter.dev/docs/development/tools/sdk/releases
2. Download **Flutter 3.x for Windows** (stable channel)
3. Extract to: `C:\Users\sagacious wizzy\Desktop\PharmcyEHR\pharmacy\flutter`
   - Folder structure should be: `pharmacy\flutter\bin\flutter.bat`

### Step 2: Verify Installation

```powershell
cd "C:\Users\sagacious wizzy\Desktop\PharmcyEHR\pharmacy\flutter\bin"
.\flutter.bat --version
```

Should output something like:
```
Flutter 3.xx.x • channel stable
```

### Step 3: Build the APK

```powershell
cd "C:\Users\sagacious wizzy\Desktop\PharmcyEHR"

# Set environment
$env:ANDROID_HOME = "$env:USERPROFILE\AppData\Local\Android\Sdk"

# Run build
.\build_apk_clean.ps1
```

Follow the prompts to create the signing keystore.

## Alternative: Use Existing Flutter

If you have Flutter installed elsewhere:
1. Copy the Flutter installation path
2. Edit `build_apk_clean.ps1` line 6 with your path:
   ```powershell
   $FlutterSDK = "C:\YOUR\PATH\To\flutter\bin\flutter.bat"
   ```

## Still Having Issues?

Run this to verify all prerequisites:
```powershell
# Check Android SDK
$env:ANDROID_HOME = "$env:USERPROFILE\AppData\Local\Android\Sdk"
Test-Path $env:ANDROID_HOME  # Should return 'True'

# Check Flutter (after downloading)
Test-Path "C:\Users\sagacious wizzy\Desktop\PharmcyEHR\pharmacy\flutter\bin\flutter.bat"  # Should return 'True'

# Check project
Test-Path "C:\Users\sagacious wizzy\Desktop\PharmcyEHR\pharmacy\mobile"  # Should return 'True'
```

All three should return `True` before the build can proceed.
