import api from './api';

const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('estate_elite_token', response.data.token);
      localStorage.setItem('estate_elite_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (username, email, password, phone) => {
    const response = await api.post('/auth/register', { username, email, password, phone });
    if (response.data.token) {
      localStorage.setItem('estate_elite_token', response.data.token);
      localStorage.setItem('estate_elite_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('estate_elite_token');
    localStorage.removeItem('estate_elite_user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('estate_elite_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

export default authService;
