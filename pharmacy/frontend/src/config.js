export const APP_VERSION = "1.1.0";

// Helper to get configuration from localStorage
const getStoredConfig = (key, defaultValue) => {
    try {
        return localStorage.getItem(`config_${key}`) || defaultValue;
    } catch (e) {
        return defaultValue;
    }
};

/**
 * Returns the Base API URL.
 * Priority:
 * 1. localStorage override (for Desktop app/Manual config)
 * 2. Environment Variable (Vite)
 * 3. Intelligent fallback based on window.location
 */
export const getBaseURL = () => {
    // 1. Check for manual override (Local Storage)
    const stored = getStoredConfig('api_url', '');
    if (stored) return stored.endsWith('/') ? stored : `${stored}/`;

    // 2. Check for Vite environment variables
    const envUrl = import.meta.env.VITE_API_URL || '';
    if (envUrl) return envUrl.endsWith('/') ? envUrl : `${envUrl}/`;

    // 3. Intelligent Fallback
    const { hostname, protocol, origin } = window.location;

    // Local Development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:8000/api/';
    }

    // Production (Self-hosted or Render with Nginx proxy)
    // If we're on a subdomain like 'app.example.com', the API might be on 'api.example.com'
    // but usually in this project, Nginx proxies /api/ to the backend.
    return `${origin}/api/`;
};

/**
 * Returns the WebSocket / Socket.io URL.
 */
export const getWSURL = () => {
    const stored = getStoredConfig('ws_url', '');
    if (stored) return stored;

    const envUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_WS_URL || '';
    if (envUrl) return envUrl;

    const { hostname, protocol, origin } = window.location;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `http://${hostname}:4000`;
    }

    // In production with Nginx proxying /socket.io/, we use the same origin
    return origin;
};
