import api from './api';

export const insuranceService = {
  async getInsurances() {
    const response = await api.get('/insurance');
    return response.data.data;
  },

  async getInsurance(id: string) {
    const response = await api.get(`/insurance/${id}`);
    return response.data.data;
  },

  async createInsurance(data: any) {
    const response = await api.post('/insurance', data);
    return response.data.data;
  },

  async updateInsurance(id: string, data: any) {
    const response = await api.put(`/insurance/${id}`, data);
    return response.data.data;
  },

  async deleteInsurance(id: string) {
    await api.delete(`/insurance/${id}`);
  },

  async getUpcomingRenewals(days = 90) {
    const response = await api.get(`/insurance/renewals?days=${days}`);
    return response.data.data;
  },

  async compareInsurance(type: string) {
    const response = await api.get(`/insurance/compare/${type}`);
    return response.data.data;
  },

  async getStats() {
    const response = await api.get('/insurance/stats');
    return response.data.data;
  },

  async scrapeBestOffers(type: string, userProfile: any = {}) {
    const params = new URLSearchParams(userProfile).toString();
    const response = await api.get(`/insurance/scrape/${type}?${params}`);
    return response.data.data;
  },

  async analyzeInsurance(id: string) {
    const response = await api.get(`/insurance/${id}/analyze`);
    return response.data.data;
  },

  async sendReminderEmail(id: string) {
    const response = await api.post(`/insurance/${id}/send-reminder`);
    return response.data;
  },
};
