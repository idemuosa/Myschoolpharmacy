# Deployment & Environment Variable Guide

This guide provides an exact mapping of the environment variables shown in your Render dashboard screenshots, indicating which service each variable belongs to and how to fix the current misconfigurations.

---

## Direct Audit of Variables from Your Screenshots

### 1. Variables Currently in Node WebSocket Server ("pharmacy" - Screenshot 3)
In Screenshot 3, the following variables were placed on the Node.js socket server. Here is where each one **should** go:

| Variable in Screenshot 3 | Target Service | Action Required |
|---|---|---|
| `CORS_ALLOWED_ORIGINS` | **Django API (`pharmacy-api` / `pharmacy and store`)** | **MOVE to API.** Django uses this to allow requests from your frontend domain. |
| `CSRF_TRUSTED_ORIGINS` | **Django API (`pharmacy-api` / `pharmacy and store`)** | **MOVE to API.** Django needs this to validate POST/PUT CSRF tokens from your frontend. |
| `DATABASE_URL` | **Django API (`pharmacy-api` / `pharmacy and store`)** | **MOVE/KEEP on API.** Node socket server does not use PostgreSQL directly; Django API needs it. |
| `DB_PASS` | **Django API (`pharmacy-api` / `pharmacy and store`)** | **MOVE to API** (Optional if `DATABASE_URL` is already provided). |
| `DB_USER` | **Django API (`pharmacy-api` / `pharmacy and store`)** | **MOVE to API** (Optional if `DATABASE_URL` is already provided). |
| `DEBUG` | **Django API (`pharmacy-api` / `pharmacy and store`)** | **MOVE to API.** Controls Django's debug mode (`False` in production). |
| `NODE_ENV` | **Node WebSocket (`pharmacy-socket` / `pharmacy`)** | **KEEP on Socket.** Set to `production`. |
| `PORT` | **Node WebSocket (`pharmacy-socket` / `pharmacy`)** | **KEEP on Socket.** Render default is `10000`. |

---

### 2. Variables Currently in Django API ("pharmacy and store" - Screenshot 2)
In Screenshot 2, the Django API service has the following variables:

| Variable in Screenshot 2 | Status | Target Service & Recommended Value |
|---|---|---|
| `DATABASE_URL` | **CORRECT** | Belongs to **Django API**. Should be set to `postgres://...` from Render DB. |
| `DEBUG` | **CORRECT** | Belongs to **Django API**. Set to `False`. |
| `PYTHON_VERSION` | **CORRECT** | Belongs to **Django API**. Set to `3.12.0` (or `3.11`). |
| `SECRET_KEY` | **CORRECT** | Belongs to **Django API**. Django application secret key. |
| `APP_URL` | **CORRECT** | Belongs to **Django API** or **Frontend**. (e.g. `https://pharmacy-api-exn3.onrender.com`). |
| `CORS_ORIGIN` | **UPDATE** | Rename or complement with `CORS_ALLOWED_ORIGINS` (e.g. `https://pharmacy-frontend.onrender.com`). |

---

## Clean Environment Variable Lists for Render Dashboard

### A. Django API Service (`pharmacy-api` / `pharmacy and store`)
* **Environment / Runtime:** Python (or Docker with `backend/Dockerfile`)
* **Root Directory:** `backend`

Add these variables to **pharmacy and store**:
```env
PYTHON_VERSION=3.12.0
SECRET_KEY=<your-secret-key>
DEBUG=False
DATABASE_URL=postgres://...
ALLOWED_HOSTS=pharmacy-api-exn3.onrender.com,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://pharmacy-frontend.onrender.com
CSRF_TRUSTED_ORIGINS=https://pharmacy-frontend.onrender.com
CORS_ALLOW_ALL_ORIGINS=True
```

---

### B. Node.js WebSocket Service (`pharmacy-socket` / `pharmacy`)
* **Environment / Runtime:** Node (or Docker with `node_backend/Dockerfile`)
* **Root Directory:** `node_backend`

Add these variables to **pharmacy (socket)**:
```env
NODE_ENV=production
PORT=10000
```
*(Remove `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `DATABASE_URL`, `DB_PASS`, `DB_USER`, `DEBUG` from this service).*

---

### C. React Frontend (`pharmacy-frontend` / Vercel / Static Site)
* **Environment / Runtime:** Static Site / React
* **Root Directory:** `pharmacy`

Add these build-time variables:
```env
VITE_API_URL=https://pharmacy-api-exn3.onrender.com
VITE_SOCKET_URL=https://pharmacy-socket-kkpo.onrender.com
```

---

## 3. How the Build Error Was Fixed

### Error in Screenshot 1:
`error: failed to solve: failed to read dockerfile: open Dockerfile: no such file or directory`

### Cause & Solution:
* **Cause:** The service was configured on Render as a **Docker** service at the repository root, but there was no root `Dockerfile`.
* **Fix Applied:**
  1. Created `/Dockerfile` at root pointing to the Django API backend.
  2. Created `node_backend/Dockerfile` for the WebSocket service.
  3. Updated `render.yaml` with explicit `rootDir` and `dockerfilePath` for all services.
