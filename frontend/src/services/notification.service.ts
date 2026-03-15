import api from './api';

export const notificationService = {
  async getNotifications(limit = 50) {
    const response = await api.get(`/notifications?limit=${limit}`);
    return response.data.data;
  },

  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data.data.count;
  },

  async markAsRead(id: string) {
    await api.put(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    await api.put('/notifications/read-all');
  },

  async deleteNotification(id: string) {
    await api.delete(`/notifications/${id}`);
  },

  async generateNotifications() {
    const response = await api.post('/notifications/generate');
    return response.data.data;
  },
};
