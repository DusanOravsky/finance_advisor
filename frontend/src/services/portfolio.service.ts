import api from './api';

export const portfolioService = {
  async getInvestments() {
    const response = await api.get('/portfolio');
    return response.data.data;
  },

  async getPortfolioSummary() {
    const response = await api.get('/portfolio/summary');
    return response.data.data;
  },

  async createInvestment(data: any) {
    const response = await api.post('/portfolio', data);
    return response.data.data;
  },

  async updateInvestment(id: string, data: any) {
    const response = await api.put(`/portfolio/${id}`, data);
    return response.data.data;
  },

  async deleteInvestment(id: string) {
    await api.delete(`/portfolio/${id}`);
  },
};
