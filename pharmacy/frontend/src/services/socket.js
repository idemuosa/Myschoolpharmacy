import { io } from 'socket.io-client';
import { getWSURL } from '../config';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = {}; // { eventType: Set(callbacks) }
    this.allListeners = new Set();
  }

  connect() {
    if (this.socket && this.socket.connected) {
        return;
    }

    const url = getWSURL();
    console.log('Connecting to Socket.io:', url);

    // Socket.io handles reconnection and protocol upgrades automatically
    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket.io Connected. ID:', this.socket.id);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.io Connection Error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket.io Disconnected:', reason);
    });

    // Handle generic messages or specific events if needed
    // In Socket.io, we usually listen for specific named events
    // But to keep compatibility with the existing subscription model:
    this.socket.onAny((eventName, ...args) => {
      const data = args[0];

      // Notify specific type listeners
      if (this.listeners[eventName]) {
        this.listeners[eventName].forEach(callback => callback(data));
      }

      // Notify global listeners
      this.allListeners.forEach(callback => callback({ type: eventName, data }));
    });
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
    // compatibility with old send({type, data}) format
    if (this.socket && this.socket.connected) {
      if (data.type && data.data) {
        this.socket.emit(data.type, data.data);
      } else {
        this.socket.emit('message', data);
      }
    } else {
        console.warn('Socket not connected. Message not sent:', data);
    }
  }

  emit(event, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    }
  }
}

export const socketService = new WebSocketService();

// Backward compatibility export
export const socket = {
  on: (event, callback) => socketService.subscribe(event, callback),
  off: (event, callback) => socketService.unsubscribe(event, callback),
  emit: (event, data) => socketService.emit(event, data),
  connect: () => socketService.connect()
};

