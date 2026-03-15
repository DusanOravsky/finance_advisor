import api from './api';

export const dashboardService = {
  async getOverview() {
    const response = await api.get('/dashboard/overview');
    return response.data.data;
  },

  async getStats() {
    const response = await api.get('/dashboard/stats');
    return response.data.data;
  },
};
