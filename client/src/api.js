import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

export const getPresentations = () => API.get('/presentations');
export const getPresentation = (id) => API.get(`/presentations/${id}`);
export const uploadPresentation = (formData, onProgress) =>
  API.post('/presentations/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
  });
export const deletePresentation = (id) => API.delete(`/presentations/${id}`);
