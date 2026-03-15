import api from './api';

export const marketService = {
  async getCryptoPrice(symbol: string) {
    const response = await api.get(`/market/crypto/${symbol}`);
    return response.data.data;
  },

  async getStockPrice(symbol: string) {
    const response = await api.get(`/market/stock/${symbol}`);
    return response.data.data;
  },

  async getDefiRates() {
    const response = await api.get('/market/defi/rates');
    return response.data.data;
  },

  async updatePortfolioPrices(investments: any[]) {
    const response = await api.post('/market/portfolio/update-prices', { investments });
    return response.data.data;
  },
};
