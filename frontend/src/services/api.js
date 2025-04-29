import axios from 'axios';
import store from '../redux/store';
import { logout } from '../redux/slices/authSlice';
import { showNotification } from '../redux/slices/notificationSlice';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    // Handle unauthorized errors (401)
    if (response?.status === 401) {
      store.dispatch(logout());
      store.dispatch(
        showNotification({
          type: 'error',
          title: 'Session Expired',
          message: 'Please log in again to continue.',
        })
      );
    }

    // Handle server errors (500)
    if (response?.status === 500) {
      store.dispatch(
        showNotification({
          type: 'error',
          title: 'Server Error',
          message: 'Something went wrong. Please try again later.',
        })
      );
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Transaction API
export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getStatistics: (params) => api.get('/transactions/statistics', { params }),
};

// Budget API
export const budgetAPI = {
  getAll: (params) => api.get('/budgets', { params }),
  getById: (id) => api.get(`/budgets/${id}`),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
  getStatistics: (params) => api.get('/budgets/statistics', { params }),
};

// Goal API
export const goalAPI = {
  getAll: (params) => api.get('/goals', { params }),
  getById: (id) => api.get(`/goals/${id}`),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
  updateProgress: (id, amount) => api.post(`/goals/${id}/progress`, { amount }),
  getStatistics: (params) => api.get('/goals/statistics', { params }),
};

// Notification API
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  archive: (id) => api.put(`/notifications/${id}/archive`),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Recurring Transaction API
export const recurringTransactionAPI = {
  getAll: (params) => api.get('/recurring-transactions', { params }),
  getById: (id) => api.get(`/recurring-transactions/${id}`),
  create: (data) => api.post('/recurring-transactions', data),
  update: (id, data) => api.put(`/recurring-transactions/${id}`, data),
  delete: (id) => api.delete(`/recurring-transactions/${id}`),
  process: (id) => api.post(`/recurring-transactions/${id}/process`),
  pause: (id) => api.put(`/recurring-transactions/${id}/pause`),
  resume: (id) => api.put(`/recurring-transactions/${id}/resume`),
  cancel: (id) => api.put(`/recurring-transactions/${id}/cancel`),
};

export default api;
