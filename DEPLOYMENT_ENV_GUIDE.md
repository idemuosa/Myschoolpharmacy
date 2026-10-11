# Deployment & Environment Variable Guide

This guide explains how environment variables are separated between the **Django API Backend**, **Node.js Socket Server**, and **React Frontend**, as well as how build errors on Render were resolved.

---

## 1. Environment Variable Configuration

### A. Django API Service (`pharmacy-api` or `pharmacy and store`)
**Service Type:** Python Web Service (or Docker using `backend/Dockerfile`)
**Root Directory:** `backend`

**Required Environment Variables:**
| Key | Example / Value | Description |
|---|---|---|
| `PYTHON_VERSION` | `3.12.0` | Python runtime version |
| `SECRET_KEY` | `<django_secret_key>` | Secret key for Django application security |
| `DEBUG` | `False` | Turn off Django debug mode in production |
| `DATABASE_URL` | `postgres://user:pass@host:5432/dbname` | Database connection string (from Render PostgreSQL database) |
| `ALLOWED_HOSTS` | `pharmacy-api-exn3.onrender.com,localhost,127.0.0.1` | Allowed host headers |
| `CORS_ALLOWED_ORIGINS` | `https://pharmacy-frontend.onrender.com` | Allowed CORS origins (your frontend URL) |
| `CSRF_TRUSTED_ORIGINS` | `https://pharmacy-frontend.onrender.com` | Trusted CSRF origins for web forms/POST requests |
| `CORS_ALLOW_ALL_ORIGINS` | `True` or `False` | Set `True` if allowing requests from all clients/mobile apps |
| `SECURE_SSL_REDIRECT` | `False` | SSL termination is handled automatically by Render |
| `SESSION_COOKIE_SECURE` | `True` | Transmit session cookies over HTTPS only |
| `CSRF_COOKIE_SECURE` | `True` | Transmit CSRF cookies over HTTPS only |

---

### B. Node.js WebSocket Service (`pharmacy-socket` or `pharmacy`)
**Service Type:** Node.js Web Service (or Docker using `node_backend/Dockerfile`)
**Root Directory:** `node_backend`

**Required Environment Variables:**
| Key | Example / Value | Description |
|---|---|---|
| `PORT` | `10000` | Port for the WebSocket server (Render default: 10000) |
| `NODE_ENV` | `production` | Node environment |

*Note: Remove Django-specific variables (such as `CSRF_TRUSTED_ORIGINS`, `DATABASE_URL`, `DB_PASS`, `DB_USER`) from the Node service as they are only needed by the Django API.*

---

### C. React Static Frontend (`pharmacy-frontend` or Vercel)
**Service Type:** Static Site / React Frontend
**Root Directory:** `pharmacy`

**Required Environment Variables (Built into bundle during build time):**
| Key | Example / Value | Description |
|---|---|---|
| `VITE_API_URL` | `https://pharmacy-api-exn3.onrender.com` | Full URL to the Django REST API backend |
| `VITE_SOCKET_URL` | `https://pharmacy-socket-kkpo.onrender.com` | Full URL to the Node WebSocket server |

---

## 2. Docker Build Error Fix Summary

### Issue:
`error: failed to solve: failed to read dockerfile: open Dockerfile: no such file or directory`

### Solution:
1. **Root `Dockerfile` Created:** Added a root `Dockerfile` that builds and launches the Django API backend when Render or Docker Cloud builds from the repository root.
2. **Sub-directory Dockerfiles Verified:** Configured `backend/Dockerfile`, `node_backend/Dockerfile`, and `pharmacy/Dockerfile`.
3. **`render.yaml` Updated:** Configured `rootDir` and `dockerfilePath` for all services in `render.yaml`.
