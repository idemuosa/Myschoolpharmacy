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
