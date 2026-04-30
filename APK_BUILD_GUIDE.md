# Pharmacy App - Android APK Release Build Guide

## Project Structure
- **Frontend**: React + Vite (in `pharmacy/`)
- **Mobile Framework**: Capacitor for Android
- **App ID**: `com.josiah.pharmacy`
- **Web Build Output**: `dist/`

## Prerequisites
Ensure you have installed:
- Node.js 18+
- Java Development Kit (JDK) 17+
- Android SDK (installed via Android Studio)
- Gradle (included with Android SDK)

## Build Steps

### Step 1: Install Dependencies (if not already done)
```bash
cd pharmacy
npm install
```

### Step 2: Build React Frontend
```bash
npm run build
```
This creates the optimized production build in the `dist/` directory.

### Step 3: Sync with Capacitor Android
```bash
npm run android:sync
```
This will:
- Copy the built web assets to the Android project
- Sync Capacitor plugins
- Update Android native code

### Step 4: Build Release APK
Navigate to the Android folder:
```bash
cd android
```

Build the release APK:
```bash
# Debug APK (for testing)
gradlew assembleDebug

# Release APK (for Google Play / Distribution)
gradlew assembleRelease
```

### Step 5: Sign the Release APK (Required for Distribution)
If `assembleRelease` prompts for keystore, follow these steps:

```bash
# Create a keystore (if you don't have one)
keytool -genkey -v -keystore pharmacy-release.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias pharmacy-key

# Sign the APK
jarsigner -verbose -sigalg MD5withRSA -digestalg SHA1 -keystore pharmacy-release.keystore app/build/outputs/apk/release/app-release-unsigned.apk pharmacy-key

# Align the APK for distribution
zipalign -v 4 app/build/outputs/apk/release/app-release-unsigned.apk ../app-release.apk
```

## Output Locations

### Debug APK
`android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (Unsigned)
`android/app/build/outputs/apk/release/app-release-unsigned.apk`

### Release APK (Signed & Aligned)
`app-release.apk` (in pharmacy root)

## Troubleshooting

### Issue: Build fails with "Cannot find firebase configuration"
**Solution**: The `google-services.json` is optional. The build will work without it.

### Issue: Build fails with "compileSdkVersion"
**Solution**: Update `variables.gradle` in the `android/` folder:
```gradle
ext {
  compileSdkVersion = 34
  targetSdkVersion = 34
  minSdkVersion = 21
  // etc...
}
```

### Issue: Java version mismatch
**Solution**: Set JAVA_HOME environment variable:
```bash
# Windows
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr

# Linux/Mac
export JAVA_HOME=/path/to/jdk
```

## Upload to Google Play
1. Create a developer account at https://play.google.com/console
2. Create a new app
3. Upload the signed APK under "Releases" > "Production"
4. Fill in the required information and submit for review

## Quick Build Command (All in One)
```bash
cd pharmacy && npm run build && npm run android:sync && cd android && gradlew assembleRelease
```

## Additional Resources
- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Android APK Signing Guide](https://developer.android.com/studio/publish/app-signing)
- [Google Play Console Guide](https://support.google.com/googleplay)
