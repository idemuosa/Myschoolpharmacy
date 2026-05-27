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
