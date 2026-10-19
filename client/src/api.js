import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const api = axios.create({
  baseURL: API_URL ? `${API_URL}/api` : '/api',
});

export const imageSrc = (src) =>
  src?.startsWith('/') && API_URL ? `${API_URL}${src}` : src;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fnm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errMsg = (e) => e?.response?.data?.error || e?.message || 'Something went wrong';
