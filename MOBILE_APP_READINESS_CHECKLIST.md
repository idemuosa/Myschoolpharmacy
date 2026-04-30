# Mobile App Readiness Checklist

## Code Quality Checks

### 1. Dart/Flutter Code Analysis
```bash
cd pharmacy/mobile

# Analyze code for issues
flutter analyze

# Format code
dart format lib/

# Check for unused imports
dart analyze --fatal-warnings
```

### 2. Build Configuration Verification
- [x] App ID: `com.josiah.mobile` (app/build.gradle.kts)
- [x] Min SDK: 21 (Flutter default)
- [x] Target SDK: 34
- [x] Compile SDK: 34
- [x] Java version: 17
- [x] Kotlin version: Latest
- [x] Build Tools: 34.0.0

### 3. Required Files & Permissions
Check `AndroidManifest.xml` for required permissions:
```xml
<!-- Network access for API calls -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- Storage access if needed -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### 4. Dependencies Verification
Current Flutter dependencies in `pubspec.yaml`:
- ✅ flutter (SDK)
- ✅ cupertino_icons (UI)
- ✅ dio (HTTP client for API calls)
- ✅ provider (State management)
- ✅ intl (Internationalization)

**Note**: Verify all packages are compatible with your Flutter version (3.11.3)

## Pre-Build Checks

### 1. Flutter Doctor Status
Run `flutter doctor` in `pharmacy/mobile` directory:

**Critical Issues to Fix**:
- ❌ Android SDK path with spaces (MUST FIX)
- ❌ Visual Studio incomplete (not needed for mobile)
- ❌ Flutter/Dart not in PATH (can work around)

### 2. Android SDK Configuration
Current Status: ⚠️ PATH CONTAINS SPACES
```
Current: C:\Users\sagacious wizzy\AppData\Local\Android\Sdk
Problem: NDK tools cannot handle spaces
Solution: Move to C:\Android\Sdk (no spaces)
```

### 3. Java Development Kit
- Minimum: JDK 11
- Recommended: JDK 17 (configured in build.gradle.kts)
- Verify: `java -version`

## Build Process

### Option 1: PowerShell Script (Recommended)
```powershell
# Run from project root
.\build_apk.ps1

# With parameters
.\build_apk.ps1 -KeystorePassword "mypassword" -CreateKeystore

# Or use the automated build that includes Windows build
.\build_dist.ps1
```

### Option 2: Batch Script
```batch
# Windows Command Prompt
cd C:\Users\sagacious wizzy\Desktop\PharmcyEHR
build_apk.bat
```

### Option 3: Manual Flutter Command
```bash
cd pharmacy/mobile

# Set environment variables (PowerShell)
$env:KEYSTORE_FILE = "android/app/pharmacy-release.keystore"
$env:KEYSTORE_PASSWORD = "your-password"
$env:KEY_ALIAS = "pharmacy-key"
$env:KEY_PASSWORD = "your-password"

# Build
..\..\flutter\bin\flutter.bat build apk --release
```

## Post-Build Verification

### 1. APK File Integrity
```powershell
# Check if APK was created
ls -Path "app-release.apk" | Select-Object Length

# Verify signature
jarsigner -verify -verbose -certs app-release.apk

# Extract and inspect APK structure
7z l app-release.apk | head -50
```

### 2. App Package Contents
Verify APK contains:
- ✓ AndroidManifest.xml
- ✓ classes.dex (compiled Dart code)
- ✓ lib/ directory with native libraries
- ✓ res/ directory with resources
- ✓ assets/ directory with app assets

### 3. Install and Test
```powershell
# Install on connected device or emulator
adb install app-release.apk

# Or upgrade if already installed
adb install -r app-release.apk

# Launch app
adb shell am start -n com.josiah.mobile/com.josiah.mobile.MainActivity

# View logs
adb logcat | findstr "josiah|flutter"

# Uninstall
adb uninstall com.josiah.mobile
```

## Testing Scenarios

- [ ] **API Connectivity**: Can app connect to backend?
- [ ] **Authentication**: Login flow works?
- [ ] **Data Display**: Drug list, expenses display correctly?
- [ ] **User Actions**: Add/edit/delete operations work?
- [ ] **Network Issues**: App handles offline gracefully?
- [ ] **Performance**: App responsive on low-end devices?
- [ ] **Memory**: No crashes after extended use?
- [ ] **Permissions**: All required permissions handled?

## Troubleshooting During Build

### Error: "Cannot find ANDROID_HOME"
**Fix**: Set environment variable
```powershell
$env:ANDROID_HOME = "C:\Android\Sdk"
```

### Error: "Android SDK location contains spaces"
**Fix**: Move SDK to path without spaces
1. Copy `C:\Users\...\AppData\Local\Android\Sdk` to `C:\Android\Sdk`
2. Update environment variables
3. Retry build

### Error: "No signing config found"
**Fix**: Create keystore file and set environment variables
```powershell
keytool -genkey -v -keystore app-keystore.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias app-key
```

### Error: "Build fails with NDK error"
**Fix**: Usually caused by SDK path with spaces - see above

### Error: "Gradle sync failed"
**Fix**: Clean and rebuild
```bash
flutter clean
flutter pub get
flutter build apk --release
```

## Security Checklist

- [ ] Keystore file created and stored securely
- [ ] Keystore password stored in secure credential manager
- [ ] Keystore file NOT committed to version control
- [ ] `pharmacy-release.keystore` added to `.gitignore`
- [ ] Environment variables used instead of hardcoding credentials
- [ ] API endpoints use HTTPS
- [ ] Sensitive data not logged
- [ ] Obfuscation enabled (`isMinifyEnabled = true`)

## Distribution Preparation

### For Google Play Store:
1. Create Google Play Developer Account ($25)
2. Create App Listing with app ID `com.josiah.mobile`
3. Upload signed APK
4. Add App Description, Screenshots, Privacy Policy
5. Complete content rating questionnaire
6. Test on multiple devices before publishing

### For Direct Distribution:
1. Host APK on secure server
2. Provide download link to users
3. Users manually install via Settings > Security > Allow unknown sources
4. Or use MDM solution for enterprise distribution

## Files Created/Modified

- **build.gradle.kts** - Updated signing configuration
- **gradle.properties** - Added configuration comments
- **build_apk.ps1** - PowerShell build script
- **build_apk.bat** - Batch build script  
- **MOBILE_APK_RELEASE_SETUP.md** - Detailed setup guide
- **MOBILE_APP_READINESS_CHECKLIST.md** - This file

## Quick Start Command

```powershell
# PowerShell - from project root
$env:KEYSTORE_PASSWORD = Read-Host "Enter keystore password" -AsSecureString
.\build_apk.ps1 -KeystorePassword $env:KEYSTORE_PASSWORD
```

## Next Steps

1. **Immediate**: Fix Android SDK path (move to path without spaces)
2. **Today**: Create release keystore and build first APK
3. **This Week**: Test on multiple Android devices
4. **Before Release**: Code review, security audit, performance testing
5. **Distribution**: Set up Google Play Console or distribution method
