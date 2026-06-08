# Guide: Building the Cloud Version of Pharmacy POS (Windows)

This guide explains how to transition from a local setup to a cloud-based setup for your Windows application.

---

## Phase 1: Deploy the Backend to the Cloud
Before your Windows app can work from anywhere, the backend must be online.

1.  **Deploy Backend:** Use a service like **Railway**, **Render**, or **DigitalOcean**.
2.  **Environment Variables:** In your cloud provider's dashboard, set the following variables (refer to `backend/.env.production.example`):
    *   `DATABASE_URL`: Your cloud PostgreSQL URL.
    *   `SECRET_KEY`: A long, unique random string.
    *   `DEBUG`: `False`
    *   `ALLOWED_HOSTS`: Your backend domain (e.g., `api.mypharmacy.com`).
    *   `CORS_ALLOWED_ORIGINS`: Set this to `*` initially or your frontend domain if applicable.
    *   `REDIS_URL`: Your cloud Redis URL (for tasks/notifications).

---

## Phase 2: Configure the Frontend
Now, tell the Windows app where to find your new cloud backend.

1.  Open the file: `pharmacy/.env.production`
2.  Update the URL to match your deployed backend:
    ```env
    VITE_API_URL=https://your-backend-domain.com/api/
    VITE_WS_URL=wss://your-backend-domain.com/ws/
    ```

---

## Phase 3: Build the Windows Installer (.exe)
Follow these steps on your local Windows machine to create the installer.

1.  **Open the Project Folder:** Navigate to the root folder `my pharmacy pos`.
2.  **Run the Build Script:** Double-click `BuildWindowsApp.bat`.
    *   This script will clean old files.
    *   It will install necessary dependencies.
    *   It will bundle the frontend using the cloud URLs.
    *   It will generate a Windows installer.
3.  **Locate the App:** Once finished, your installer (`.exe` or `.msi`) will be in:
    `pharmacy/dist_electron/`

---

## Phase 4: Post-Installation Management
If you ever change your backend server, you don't necessarily need to rebuild the app:

1.  Open the installed **Josiah Pharmacy POS** app on Windows.
2.  In the top menu, go to **File > Configure Server**.
3.  Enter the new **Backend API URL** and **WebSocket URL**.
4.  The app will reload and connect to the new server immediately.

---

## Key Benefits of this Cloud Setup:
*   **Centralized Data:** All pharmacy terminals share the same database.
*   **Security:** Data is backed up in the cloud, not just on one local PC.
*   **Accessibility:** You can run the app from any Windows PC with an internet connection.
