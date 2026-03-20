import axios from 'axios';

const getBaseURL = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';
  return url.endsWith('/') ? url : `${url}/`;
};

const api = axios.create({
  baseURL: getBaseURL(),
});

// Helper to check if a token is valid (not empty or string "null"/"undefined")
const isValidToken = (token) => {
  return token && token !== 'null' && token !== 'undefined' && token !== '';
};

// Interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (isValidToken(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Ensure no stale or "null" header is sent
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthorized responses and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 (Unauthorized) or 403 (Forbidden) if it might be auth related
    // We check !originalRequest._retry to avoid infinite loops
    if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
      
      // Don't try to refresh if we're already on the login page
      if (window.location.pathname.includes('/login')) {
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (isValidToken(refreshToken)) {
        try {
          console.log("Attempting token refresh...");
          const response = await axios.post(`${getBaseURL()}token/refresh/`, {
            refresh: refreshToken,
          });
          
          const newAccessToken = response.data.access;
          localStorage.setItem('access_token', newAccessToken);
          
          console.log("Token refresh successful.");
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error("Refresh token failed or expired", refreshError);
          // Clear all auth data and redirect
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('username');
          window.location.href = '/login';
        }
      } else {
        // No refresh token available, redirect to login
        console.warn("No refresh token found. Redirecting to login.");
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
