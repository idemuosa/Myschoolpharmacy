from celery import shared_task
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.models import F

@shared_task
def send_notification_task(message, event_type='notification'):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'notifications',
        {
            'type': 'notification_message',
            'event_type': event_type,
            'message': message,
            'data': {}
        }
    )
    return f"Notification sent: {message}"

@shared_task
def broadcast_stock_update(item_ids, item_type='drug'):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'notifications',
        {
            'type': 'notification_message',
            'event_type': 'stock_updated',
            'message': f"Stock updated for {len(item_ids)} {item_type}s",
            'data': {
                'ids': item_ids,
                'type': item_type
            }
        }
    )
    return f"Stock update broadcasted for {len(item_ids)} items"

@shared_task
def check_expired_drugs():
    from .models import Drug, Product
    from django.utils import timezone
    from datetime import timedelta

    today = timezone.now().date()
    soon = today + timedelta(days=60) # 2 months

    expiring_soon = []

    for drug in Drug.objects.filter(expiry_date__lte=soon, expiry_date__gte=today):
        expiring_soon.append(f"{drug.name} (Exp: {drug.expiry_date})")

    if expiring_soon:
        message = f"Expiring Soon: {', '.join(expiring_soon)}"
        send_notification_task.delay(message, event_type='expiry_alert')

    return f"Checked expiry for {len(expiring_soon)} items"

@shared_task
def check_stock_levels():
    from .models import Drug, Product
    low_stock_items = []

    for drug in Drug.objects.filter(stock__lte=F('reorder_level')):
        low_stock_items.append(drug.name)

    for product in Product.objects.filter(stock__lte=F('reorder_level')):
        low_stock_items.append(product.name)

    if low_stock_items:
        message = f"Low stock alert for: {', '.join(low_stock_items)}"
        send_notification_task.delay(message, event_type='low_stock_alert')

    return f"Checked stock for {len(low_stock_items)} low items"

@shared_task
def automate_database_backup():
    import os
    import subprocess
    import datetime

    backup_dir = "/backups"
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)

    filename = f"auto_backup_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"
    filepath = os.path.join(backup_dir, filename)

    db_name = os.environ.get('POSTGRES_DB', 'pharmacy_db')
    db_user = os.environ.get('POSTGRES_USER', 'pharmacy_user')
    db_host = 'db'
    db_password = os.environ.get('POSTGRES_PASSWORD', 'pharmacy_password')

    os.environ['PGPASSWORD'] = db_password

    try:
        process = subprocess.Popen(
            ['pg_dump', '-h', db_host, '-U', db_user, db_name],
            stdout=open(filepath, 'wb'),
            stderr=subprocess.PIPE
        )
        stdout, stderr = process.communicate()

        if process.returncode == 0:
            # Here you would typically upload filepath to S3/Cloud Storage
            # For now, we store it in the persistent volume
            message = f"System: Automated database backup successful: {filename}"
            send_notification_task.delay(message, event_type='backup_status')

            # Retention: Delete backups older than 7 days
            now = datetime.datetime.now()
            for f in os.listdir(backup_dir):
                f_path = os.path.join(backup_dir, f)
                if os.stat(f_path).st_mtime < (now - datetime.timedelta(days=7)).timestamp():
                    os.remove(f_path)

            return f"Backup successful: {filename}"
        else:
            return f"Backup failed: {stderr.decode()}"

    except Exception as e:
        return f"Error during backup: {str(e)}"
