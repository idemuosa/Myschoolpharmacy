# Project Snapshot: Josiah Pharmacy POS (Enterprise Edition)
**Date Saved**: May 31, 2026
**Version**: 1.1.0

## 🚀 Unified Tech Stack
- **Frontend**: React 19 (Vite 7) - High-performance, sans-serif design.
- **Mobile**: Capacitor 8 - Native Android integration with camera scanning.
- **Desktop**: Electron 41 - Standalone Windows `.exe` with server configuration.
- **Backend**: Django 6 - Robust API with Role-Based Access Control (RBAC).
- **Real-time**: Django Channels + WebSockets - Instant stock and notification sync.
- **Database**: PostgreSQL 15 - Enterprise-grade relational storage.
- **Background Tasks**: Celery + Redis - Hourly stock audits and daily expiry checks.
- **Proxy/Web**: Nginx - Optimized for production traffic and thermal printing.

## ✨ Features Implemented
1.  **Clinical Core**: Batch & Lot tracking with **FEFO** (First Expiry, First Out) logic.
2.  **POS Terminals**: Dual-mode (Pharmacy & Supermarket) with real-time stock sync.
3.  **Financial Integrity**: Patient Debt management, Supplier Credit, and Revenue Analytics.
4.  **Procurement**: Supplier Hub and automated Purchase Orders with one-click receiving.
5.  **Operational Audit**: Physical Stocktake mode with Discrepancy Reporting.
6.  **Staff Management**: Digital Attendance (Clock-in/out) and granular activity logs.
7.  **Patient Loyalty**: Automated Refill Reminders via predictive pattern analysis.
8.  **Utilities**: Small-format Barcode Label Generator and Manual DB Backups.
9.  **Automated Security**: Daily database backups with a 7-day rolling retention policy.

## 🛠️ Build & Deployment Commands

### 💻 Windows App
1.  Double-click `BuildWindowsApp.bat`.
2.  Installer created in `pharmacy/dist_electron/`.

### 📱 Android App
1.  Run `.\build_apk.ps1` in PowerShell.
2.  APK created in `pharmacy/android/app/build/outputs/apk/release/`.

### 🌐 Web Server (Production)
1.  Run `docker-compose up --build`.
2.  Access at `http://localhost` (or your server IP).

## 📁 Critical File Map
- `.env.example`: Template for system environment variables.
- `docker-compose.yml`: Orchestration for all 7 microservices.
- `backend/api/models.py`: The master clinical and financial data schema.
- `pharmacy/frontend/src/config.js`: Centralized URL and environment management.
- `FINAL_BUILD_REPORT.md`: Detailed distribution instructions.

---
*System is currently stable and production-ready.*
