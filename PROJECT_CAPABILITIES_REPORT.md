# 🏥 Josiah Pharmacy Management System - Project Capabilities Report

This document provides a comprehensive overview of your project's architecture, features, and capabilities.

## 🚀 1. Core Architecture
Your project is built using a **Professional 3-Tier Architecture**, designed for high availability and hybrid use (Local + Cloud).

*   **Backend (Brains):** Python Django with REST Framework & Channels.
*   **Real-time Engine:** Node.js with Socket.io (for instant notifications).
*   **Frontend (Face):** React.js with Vite & Tailwind CSS.
*   **Mobile:** Flutter-based Android APK for tablets and phones.
*   **Desktop:** Electron-based Windows `.exe` application.
*   **Database:** PostgreSQL (Cloud/Production) and SQLite/IndexedDB (Local/Offline).

---

## 💻 2. Windows Desktop App Features
*   **Native Installation:** Runs as a standalone `.exe` without needing a browser.
*   **Hardware Integration:** 
    *   **Handheld Scanners:** Direct input support for barcode scanning.
    *   **Thermal Printers:** Auto-printing receipts (80mm standard).
*   **Data Fortress:**
    *   **Automatic Backup:** Saves a JSON snapshot to your **Desktop at 5:00 PM daily**.
    *   **Crash Recovery:** Remembers your current cart even if the system loses power.
*   **Command Barcodes:** Allows "Hands-Free" operation (Finalize, Clear Cart, Cycle Payment).

---

## 🛒 3. Point of Sale (POS) Capabilities
*   **Dual Mode:** Dedicated interfaces for **Pharmacy** (Clinical) and **Supermarket** (Retail).
*   **Payment Versatility:** Supports **Cash**, **POS (Card)**, **Bank Transfer**, **Credit (Account)**, and **Split Payments**.
*   **Live Price Check:** Large visual overlays confirm the price instantly upon scanning.
*   **Allergy Alerts:** Automatically warns pharmacists if a patient is allergic to a scanned medication.
*   **End-of-Day:** One-click **Z-Report** generation for financial reconciliation.

---

## 📦 4. Inventory & Clinical Management
*   **Drug Vault:** Tracks dosage, generic names, forms, and categories.
*   **Batch Tracking:** Monitors expiry dates and alerts you 60 days before a medication expires.
*   **Low Stock Alerts:** Dashboard warnings when items hit reorder levels.
*   **Prescription Management:** 
    *   Digital upload and review workflow.
    *   **Digital Status Board:** Public-facing display showing "Ready for Pickup" orders.

---

## ☁️ 5. Cloud & Network Intelligence
*   **Hybrid Sync:** Sells offline when internet fails; syncs to the cloud when restored.
*   **Railway Hosting:** Fast, Docker-based deployment that never "sleeps."
*   **Real-time Sync:** If you sell an item on the Laptop, the stock updates on the Tablet instantly.
*   **Security:** Production-hardened with SSL redirects, CSRF protection, and secure session management.

---

## 📂 6. File Structure Key
*   `/backend`: Django API source code.
*   `/node_backend`: Socket.io server source code.
*   `/pharmacy`: React Frontend & Windows App source.
*   `/nginx`: Web gateway configuration.
*   `BuildWindowsApp.bat`: Your 1-click desktop app generator.
*   `COMMAND_BARCODES.html`: Your printable scanner control sheet.

---
**Status:** PRODUCTION READY ✅
**Version:** 1.1.0
**Author:** Josiah (Assisted by AI)
