#!/bin/sh

# Wait for database
echo "Waiting for postgres..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

# Apply migrations only if requested or if we are the main backend
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Applying database migrations..."
    python manage.py migrate
fi

# Collect static only if requested
if [ "$COLLECT_STATIC" = "true" ]; then
    echo "Collecting static files..."
    python manage.py collectstatic --noinput
fi

# Remove Celery Beat pid file if it exists
if [ -f "celerybeat.pid" ]; then
    echo "Removing old celerybeat.pid"
    rm celerybeat.pid
fi

# Start the command
echo "Executing: $@"
exec "$@"
