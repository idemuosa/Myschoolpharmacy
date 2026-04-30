#!/bin/bash
# build_apk_gradle.sh - Build APK using Gradle directly

cd "$(dirname "$0")/pharmacy/mobile/android"

echo "===== Building APK with Gradle ====="

# Set Android environment
export ANDROID_HOME="$HOME/AppData/Local/Android/Sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"

# Set signing environment
export KEYSTORE_FILE="$(pwd)/app/pharmacy-release.keystore"
export KEY_ALIAS="pharmacy-key"

if [ -z "$KEYSTORE_PASSWORD" ]; then
    read -sp "Enter keystore password: " KEYSTORE_PASSWORD
    export KEYSTORE_PASSWORD
fi

export KEY_PASSWORD="$KEYSTORE_PASSWORD"

# Build using gradlew
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo "✓ APK built successfully!"
    cp "app/build/outputs/apk/release/app-release.apk" "../../app-release.apk"
    echo "APK copied to: ../../app-release.apk"
else
    echo "✗ Build failed"
    exit 1
fi
