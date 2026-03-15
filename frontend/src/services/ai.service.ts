import api from './api';

export const aiService = {
  async chat(message: string) {
    const response = await api.post('/ai/chat', { message });
    return response.data.data;
  },

  async analyzePortfolio() {
    const response = await api.post('/ai/analyze-portfolio');
    return response.data.data;
  },

  async getChatHistory(limit = 50) {
    const response = await api.get(`/ai/chat/history?limit=${limit}`);
    return response.data.data;
  },

  async clearChatHistory() {
    await api.delete('/ai/chat/history');
  },
};
