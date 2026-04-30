import axios from 'axios';

const api = axios.create({
    baseURL: `http://${window.location.hostname}:5000/api`,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const auth = {
    login: (credentials: any) => api.post('/auth/login', credentials),
    register: (data: any) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
};

export const technicians = {
    getAll: () => api.get('/technicians'),
    getAvailableProfiles: () => api.get('/technicians/available-profiles'),
    create: (data: any) => api.post('/technicians', data),
    update: (id: string, data: any) => api.put(`/technicians/${id}`, data),
    delete: (id: string) => api.delete(`/technicians/${id}`),
};

export const panels = {
    getAll: () => api.get('/panels'),
    create: (data: any) => api.post('/panels', data),
    update: (id: string, data: any) => api.put(`/panels/${id}`, data),
    delete: (id: string) => api.delete(`/panels/${id}`),
    getImageList: (category: string) => api.get(`/panels/images-list/${category}`),
};

export const interventions = {
    getAll: () => api.get('/interventions'),
    create: (data: any) => api.post('/interventions', data),
    update: (id: string, data: any) => api.put(`/interventions/${id}`, data),
};

export const dashboard = {
    getStats: () => api.get('/dashboard/stats'),
};

export const commands = {
    getAll: () => api.get('/commands'),
    create: (data: any) => api.post('/commands', data),
};

export default api;
