# Josiah Pharmacy POS - Multi-Platform Distribution Guide

## 1. Windows Application (.exe)
**Goal**: Create an installer for pharmacy computers.
- **Action**: Double-click `BuildWindowsApp.bat` in the root folder.
- **Output**: `pharmacy/dist_electron/JosiahPharmacyPOS_Setup.exe`
- **Config**: Once installed, use the **File -> Configure Server** menu to point to your cloud or local API.

## 2. Web Application (Public URL)
**Goal**: Access the POS via a browser from anywhere.
- **Action**: Run `docker-compose up --build` on your server.
- **Security**: Ensure your `.env` has a strong `SECRET_KEY`.
- **URL**: Your server's IP address (e.g., `http://192.168.1.100` or `https://your-domain.com`).

## 3. Android Application (APK)
**Goal**: Run the POS on tablets or mobile phones with barcode scanning.
- **Action**: Run the `build_apk.ps1` PowerShell script.
- **Requirements**: You must have Android Studio and a Java JDK installed.
- **Output**: `pharmacy/android/app/build/outputs/apk/release/app-release.apk`
- **Scanner**: The camera scanner is built-in; just tap the "Camera" icon in the POS.

## 4. Database Integrity
**Action**: After building, always ensure your production database is migrated:
`docker-compose exec backend python manage.py migrate`

---
*System Version: 1.1.0 (Enterprise)*
*Stack: React, Django, PostgreSQL, Redis, Celery, Docker*
