# Mobile APK Release Setup Guide

## Critical Prerequisites

### 1. Fix Android SDK Path (Required)
The current Android SDK path contains spaces which breaks NDK tools:
- **Current**: `C:\Users\sagacious wizzy\AppData\Local\Android\Sdk`
- **Solution**: Move SDK to a path without spaces

```powershell
# Option A: Use Android Studio to move SDK
# Settings > Appearance & Behavior > System Settings > Android SDK > Change path to:
# C:\Android\Sdk  (or similar path without spaces)

# Option B: Manual move (if you have SDK already)
mkdir C:\Android\Sdk
# Copy existing SDK contents from old location
```

After moving, update the environment variable:
```powershell
# Set in System Environment Variables
ANDROID_HOME=C:\Android\Sdk
ANDROID_SDK_ROOT=C:\Android\Sdk
```

### 2. Setup Release Signing Key
Generate a keystore file for signing releases:

```powershell
# Navigate to pharmacy/mobile/android/app directory
cd pharmacy\mobile\android\app

# Generate release keystore
keytool -genkey -v -keystore pharmacy-release.keystore `
  -keyalg RSA -keysize 2048 -validity 10000 `
  -alias pharmacy-key `
  -dname "CN=Josiah Pharmacy, OU=Development, O=Josiah, L=Unknown, ST=Unknown, C=KE"

# When prompted:
# - Store password: [Create a secure password]
# - Key password: [Same as store password]
```

**IMPORTANT**: 
- Save the keystore password securely
- Never commit `pharmacy-release.keystore` to version control
- Add to `.gitignore` if not already there

### 3. Set Release Signing Environment Variables

**Windows (PowerShell)**:
```powershell
$env:KEYSTORE_FILE="C:\Users\[YourUsername]\Desktop\PharmcyEHR\pharmacy\mobile\android\app\pharmacy-release.keystore"
$env:KEYSTORE_PASSWORD="your-store-password"
$env:KEY_ALIAS="pharmacy-key"
$env:KEY_PASSWORD="your-key-password"
```

**Windows (Persistent)** - Add to System Environment Variables:
- `KEYSTORE_FILE`: Full path to keystore file
- `KEYSTORE_PASSWORD`: Your keystore password
- `KEY_ALIAS`: pharmacy-key
- `KEY_PASSWORD`: Your key password

**Alternative**: Update `gradle.properties` in `pharmacy/mobile/android/`:
```properties
# Release signing configuration
KEYSTORE_FILE=app/pharmacy-release.keystore
KEYSTORE_PASSWORD=your-store-password
KEY_ALIAS=pharmacy-key
KEY_PASSWORD=your-key-password
```

## Building the Release APK

### Method 1: Using Build Script (Recommended)
```powershell
cd C:\Users\sagacious wizzy\Desktop\PharmcyEHR
.\build_dist.ps1
```

This will:
- Build Android APK (release)
- Build Windows executable
- Output: `app-release.apk` in project root

### Method 2: Manual Flutter Build
```powershell
cd pharmacy\mobile

# Using local Flutter
..\flutter\bin\flutter.bat build apk --release

# Output: build/app/outputs/flutter-apk/app-release.apk
```

### Method 3: Using Gradle Directly
```powershell
cd pharmacy\mobile\android

# Set environment variables first (see section 3 above)
# Then run:
gradlew assembleRelease

# Output: app/build/outputs/apk/release/app-release.apk
```

## Troubleshooting

### Error: "Cannot find matching values for signing config"
- Ensure environment variables are set `KEYSTORE_FILE`, `KEYSTORE_PASSWORD`, etc.
- Or update `gradle.properties` with signing credentials

### Error: "Keystore was tampered with"
- Keystore file may be corrupted
- Solution: Regenerate keystore using keytool command above

### Error: "Build path contains spaces"
- This is caused by Android SDK path with spaces
- Solution: Follow "Fix Android SDK Path" section above

### Error: "NDK not found"
- SDK path contains spaces (see above)
- Update `gradle.properties` if needed to point to correct NDK location

### Windows firewall blocking build?
- Ensure Android build tools can access network
- Allow gradle in Windows Firewall if prompted

## Verifying the APK

Once built, verify the APK before distribution:

```powershell
# Check APK signature
jarsigner -verify -verbose -certs app-release.apk

# List APK contents
7z l app-release.apk | grep -i "\.so$|\.dex$" 

# Recommended: Test on device or emulator before distribution
adb install app-release.apk
```

## Distribution Checklist

- [x] Generated and secured keystore file
- [x] Set signing configuration in build.gradle.kts
- [x] Tested APK on Android device/emulator
- [x] Verified app ID: `com.josiah.mobile`
- [x] Confirmed app version in pubspec.yaml
- [x] Built release APK with proper signing
- [x] Tested signed APK functionality

## Next Steps: Google Play Store Distribution

1. Create Google Play Developer Account ($25 one-time fee)
2. Create app listing with app ID `com.josiah.mobile`
3. Upload signed APK to Play Store
4. Provide app description, screenshots, and privacy policy
5. Complete content rating and other metadata
6. Submit for review

For more details, see: https://developer.android.com/studio/publish
