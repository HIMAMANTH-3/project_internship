// src/api/client.js — Axios API client
import axios from 'axios';

// Determine API URL based on environment
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (import.meta.env.PROD) {
    // In production, use relative URL (same origin)
    return '';
  }
  
  // Development: use localhost:5000
  return 'http://localhost:5000';
};

const BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const message = error.response.data?.error || 'An error occurred.';
      return Promise.reject(new Error(message));
    } else if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. The AI is taking too long — please try again.'));
    } else if (!error.response) {
      return Promise.reject(new Error('Cannot connect to server. Please ensure the backend is running.'));
    }
    return Promise.reject(error);
  }
);

// API methods
export const generateRecommendation = (data) => api.post('/api/generate', data);
export const submitFeedback = (data) => api.post('/api/feedback', data);
export const getHistory = (params) => api.get('/api/history', { params });
export const getHistoryItem = (id) => api.get(`/api/history/${id}`);
export const deleteHistoryItem = (id) => api.delete(`/api/history/${id}`);
export const updateRating = (id, rating) => api.patch(`/api/history/${id}/rating`, { rating });
export const getTemplates = () => api.get('/api/templates');
export const createTemplate = (data) => api.post('/api/templates', data);
export const getAnalytics = () => api.get('/api/admin/analytics');
export const getQualityAnalytics = () => api.get('/api/analytics/quality');
export const checkHealth = () => api.get('/api/health');

export default api;
