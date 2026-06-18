import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    return api.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  getMe: () => api.get('/auth/me'),
};

export const ticketAPI = {
  list: (params) => api.get('/tickets', { params }),
  get: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post('/tickets', data),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  delete: (id) => api.delete(`/tickets/${id}`),
  predict: (data) => api.post('/tickets/predict', data),
  addComment: (id, comment) => api.post(`/tickets/${id}/comments`, { comment }),
  exportCSV: () => api.get('/tickets/export/csv', { responseType: 'blob' }),
  exportExcel: () => api.get('/tickets/export/excel', { responseType: 'blob' }),
};

export const dashboardAPI = {
  user: () => api.get('/dashboard/user'),
  admin: () => api.get('/dashboard/admin'),
};

export const analyticsAPI = {
  get: () => api.get('/analytics'),
  activityLogs: () => api.get('/activity-logs'),
  users: () => api.get('/users'),
};

export default api;
