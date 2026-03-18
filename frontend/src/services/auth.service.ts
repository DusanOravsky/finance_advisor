import api from './api';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterData) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data: LoginData) {
    const response = await api.post('/auth/login', data);
    const { accessToken, refreshToken, user } = response.data.data;

    // Ulož tokeny
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    return { user, accessToken, refreshToken };
  },

  async logout() {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },

  async updateProfile(data: Partial<RegisterData>) {
    const response = await api.put('/auth/profile', data);
    return response.data.data;
  },

  async updateSettings(data: any) {
    const response = await api.put('/auth/settings', data);
    return response.data.data;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },
};
