# Docker Deployment Instructions

This project has been migrated to a modern stack:
- **Frontend**: React (Vite)
- **Backend**: Django (Gunicorn/Uvicorn/ASGI)
- **Real-time**: Django Channels + Redis
- **Task Queue**: Celery + Redis
- **Database**: PostgreSQL
- **Proxy**: Nginx

## Prerequisites
- Docker and Docker Compose installed.

## Setup
1. Create a `.env` file in the root directory (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
2. Adjust the values in `.env` if necessary.

## Running the Application
Run the following command to build and start all services:
```bash
docker-compose up --build
```

The application will be available at:
- Frontend: `http://localhost`
- Backend API: `http://localhost/api/`
- Django Admin: `http://localhost/admin/`

## Web Deployment
To deploy this as a public web application:
1. Ensure your server has Docker and Docker Compose.
2. Update `ALLOWED_HOSTS` in your `.env` to your domain name.
3. Update `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` in `backend/core/settings.py` (or set via environment variables if configured).
4. Point your domain to the server IP. Nginx will handle the traffic.

## Windows Application
To generate a standalone Windows executable (.exe):
1. Run the `BuildWindowsApp.bat` script in the root directory.
2. The installer will be generated in `pharmacy/dist_electron`.
3. Once installed, use the **File -> Configure Server** menu inside the app to point to your hosted API.

## Services
- **db**: PostgreSQL database.
- **redis**: Used for Channels layer and Celery broker.
- **backend**: Django application running with ASGI support.
- **celery_worker**: Background worker for long-running tasks.
- **frontend**: React application served via Nginx.
- **nginx**: Main entry point that routes traffic to frontend and backend.

## Real-time Features
- WebSocket endpoint: `ws://localhost/ws/notifications/`
- Used for instant notifications (e.g., new prescriptions, low stock alerts).

## Background Tasks
- Celery is configured to handle background tasks.
- Example tasks are in `backend/api/tasks.py`.
