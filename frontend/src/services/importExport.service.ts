import api from './api';

export const importExportService = {
  async importCSV(csvContent: string) {
    const response = await api.post('/import-export/csv', { csvContent });
    return response.data.data;
  },

  async importJSON(jsonData: any) {
    const response = await api.post('/import-export/json', jsonData);
    return response.data.data;
  },

  async exportCSV() {
    const response = await api.get('/import-export/csv', {
      responseType: 'blob',
    });
    return response.data;
  },

  async exportJSON() {
    const response = await api.get('/import-export/json');
    return response.data.data;
  },

  async getSampleCSV() {
    const response = await api.get('/import-export/template/csv', {
      responseType: 'blob',
    });
    return response.data;
  },

  async getSampleJSON() {
    const response = await api.get('/import-export/template/json');
    return response.data.data;
  },
};
