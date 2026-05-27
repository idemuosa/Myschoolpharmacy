// Updated to use standard WebSockets for Django Channels
const getWSURL = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  // If in development and accessed via localhost:3000, we might need to point to localhost:8000
  // But with Nginx proxy, it should just be /ws/
  const url = import.meta.env.VITE_WS_URL || '/ws/notifications/';

  if (url.startsWith('ws')) {
    return url;
  }

  const baseUrl = `${protocol}//${host}`;
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = {}; // { eventType: Set(callbacks) }
    this.allListeners = new Set();
  }

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
        return;
    }

    const url = getWSURL();
    console.log('Connecting to WebSocket:', url);

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket Connected');
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const type = data.type || 'message';

        // Notify specific type listeners
        if (this.listeners[type]) {
          this.listeners[type].forEach(callback => callback(data.data || data.message || data));
        }

        // Notify global listeners
        this.allListeners.forEach(callback => callback(data));
      } catch (e) {
        console.error('Error parsing WebSocket message', e);
      }
    };

    this.socket.onclose = (e) => {
      console.log('WebSocket Disconnected, retrying in 3s...', e.reason);
      this.socket = null;
      setTimeout(() => this.connect(), 3000);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };
  }

  subscribe(event, callback) {
    if (typeof event === 'function') {
      this.allListeners.add(event);
      return () => this.allListeners.delete(event);
    }

    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event].add(callback);
    return () => this.listeners[event].delete(callback);
  }

  unsubscribe(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].delete(callback);
    }
    this.allListeners.delete(callback);
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
        console.warn('WebSocket not open. Message not sent:', data);
    }
  }
}

export const socketService = new WebSocketService();

// Backward compatibility export
export const socket = {
  on: (event, callback) => socketService.subscribe(event, callback),
  off: (event, callback) => socketService.unsubscribe(event, callback),
  emit: (event, data) => socketService.send({ type: event, data }),
  connect: () => socketService.connect()
};
