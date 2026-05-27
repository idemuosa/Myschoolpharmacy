import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async :
        self.room_group_name = 'notifications'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            event_type = data.get('type', 'notification')
            payload = data.get('data', {})
            message = data.get('message', '')

            # Logic to match node_backend behavior
            if event_type == 'new_prescription_uploaded':
                event_type = 'alert_new_prescription'

            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'notification_message',
                    'event_type': event_type,
                    'message': message,
                    'data': payload
                }
            )
        except Exception as e:
            print(f"Error in receive: {e}")

    # Receive message from room group
    async def notification_message(self, event):
        # Send message to WebSocket
        # event['type'] is 'notification_message' (the handler name)
        # We look for 'event_type' for the client-side event name
        await self.send(text_data=json.dumps({
            'type': event.get('event_type', 'notification'),
            'message': event.get('message', ''),
            'data': event.get('data', {})
        }))
