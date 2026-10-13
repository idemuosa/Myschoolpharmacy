# Database Backups & Security Guide

This guide details how to configure **HTTPS/SSL for custom domains** and **automated PostgreSQL database backups** for the Josiah Pharmacy Management System.

---

## 🔒 1. How to Enable HTTPS / SSL on Custom Domains

### A. Managed Cloud Hosting (Render, Vercel, Cloudflare, AWS)
If you are deploying on platforms like Render, Vercel, or using Cloudflare:

1. **Add Custom Domain**: Go to your service dashboard (e.g., `pharmacy-frontend` or `pharmacy-api`), select **Settings** -> **Custom Domains**, and enter your domain (e.g., `app.yourpharmacy.com` or `api.yourpharmacy.com`).
2. **Configure DNS Records**: At your domain provider (Namecheap, GoDaddy, Cloudflare, etc.), create:
   - A **CNAME** record pointing your subdomain (`app` or `api`) to your service host (e.g., `pharmacy-frontend.onrender.com`).
3. **Automated SSL Certificate**: The platform automatically generates and renews a free **Let's Encrypt SSL/TLS Certificate**. Once DNS propagates (usually 2–10 mins), HTTPS is active.

### B. Django Security Settings (`backend/core/settings.py`)
Ensure Django enforces HTTPS transmission for session data and CSRF tokens by enabling these environment settings in production:

```env
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_SSL_REDIRECT=True
SECURE_PROXY_SSL_HEADER=HTTP_X_FORWARDED_PROTO,https
```

---

## 💾 2. How to Enable Automated PostgreSQL Database Backups

### Option A: Managed Cloud PostgreSQL (Render, Supabase, AWS RDS)
If you are using a managed database instance (such as Render PostgreSQL or AWS RDS):

- **Managed Automated Backups**: Managed database plans automatically take daily snapshots (or continuous point-in-time backups) every 24 hours and handle retention automatically without extra scripts.

### Option B: Self-Hosted PostgreSQL (Docker / VPS / Linux)
If running PostgreSQL on your own server or Docker container, set up an automated `cron` job using `pg_dump`:

1. **Create Backup Script (`/usr/local/bin/backup_db.sh`)**:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/pharmacy_db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

# Run pg_dump against your DATABASE_URL or database name
pg_dump "$DATABASE_URL" -F c -b -v -f "$BACKUP_DIR/pharmacy_db_$TIMESTAMP.dump"

# Delete backups older than 30 days
find "$BACKUP_DIR" -type f -name "*.dump" -mtime +30 -delete
```

2. **Schedule Daily Backups via Cron (`crontab -e`)**:
```cron
# Run backup every day at midnight (00:00)
0 0 * * * /bin/bash /usr/local/bin/backup_db.sh > /var/log/db_backup.log 2>&1
```

3. **Off-site Cloud Storage Backup (Optional & Recommended)**:
Append an AWS S3 or Google Cloud Storage sync command to your backup script to copy backups off-site:
```bash
aws s3 cp "$BACKUP_DIR/pharmacy_db_$TIMESTAMP.dump" s3://your-secure-pharmacy-backups/
```
