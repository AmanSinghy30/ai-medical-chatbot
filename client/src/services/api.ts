import axios, { AxiosInstance } from 'axios';

const API_BASE = '/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medisage_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const registerUser = (data: any) => api.post('/auth/register', data);
export const loginUser = (data: any) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (data: any) => api.put('/auth/profile', data);

// Chat
export const getChats = () => api.get('/chat');
export const getChatById = (id: string) => api.get(`/chat/${id}`);
export const createChat = (data: any) => api.post('/chat', data);
export const addMessage = (id: string, data: any) => api.post(`/chat/${id}/messages`, data);
export const deleteChat = (id: string) => api.delete(`/chat/${id}`);

// AI
export const generateAIResponse = (data: any) => api.post('/ai/generate', data);
export const analyzeSymptoms = (data: any) => api.post('/ai/analyze', data);
export const getRAGSources = (query: string) => api.get('/ai/rag', { params: { query } });
export const getDiseaseSpecialtyMap = () => api.get('/ai/specialty-map');

// Appointments
export const getAppointments = (params?: any) => api.get('/appointments', { params });
export const getAppointmentById = (id: string) => api.get(`/appointments/${id}`);
export const createAppointment = (data: any) => api.post('/appointments', data);
export const updateAppointment = (id: string, data: any) => api.put(`/appointments/${id}`, data);
export const cancelAppointment = (id: string) => api.delete(`/appointments/${id}`);
export const getDoctorAvailability = (doctorId: string, date: string) =>
  api.get('/appointments/availability', { params: { doctorId, date } });

// Reports
export const getReports = () => api.get('/reports');
export const getReportById = (id: string) => api.get(`/reports/${id}`);
export const createReport = (data: any) => api.post('/reports', data);
export const downloadReportPDF = (id: string) => api.get(`/reports/${id}/pdf`, { responseType: 'blob' });
export const finalizeReport = (id: string, data: any) => api.put(`/reports/${id}/finalize`, data);
export const deleteReport = (id: string) => api.delete(`/reports/${id}`);

// Doctors
export const getDoctors = (params?: any) => api.get('/doctors', { params });
export const getDoctorById = (id: string) => api.get(`/doctors/${id}`);
export const getSpecialties = () => api.get('/doctors/specialties');

// Medicines
export const getMedicines = (params?: any) => api.get('/medicines', { params });
export const getMedicineById = (id: string) => api.get(`/medicines/${id}`);

// Health Tips
export const getHealthTips = (params?: any) => api.get('/health-tips', { params });
export const getHealthTipById = (id: string) => api.get(`/health-tips/${id}`);
export const getHealthCategories = () => api.get('/health-tips/categories');

export default api;
