import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8080/api';
export const WS_BASE_URL = 'http://localhost:8080/ws';

const api = axios.create({
  baseURL: API_BASE_URL,
});

let logoutHandler = null;

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('jira_auth');
    if (raw && !config.url.includes('/auth/')) {
      const parsed = JSON.parse(raw);
      const token = parsed?.token || parsed?.accessToken || parsed?.jwt;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (e) {
    console.error('Erreur lecture token:', e);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/auth/')) {
      if (logoutHandler) logoutHandler();
    }
    return Promise.reject(error);
  }
);

export const setupInterceptors = (_getToken, onUnauthorized) => {
  logoutHandler = onUnauthorized;
  return () => {
    logoutHandler = null;
  };
};

export default api;