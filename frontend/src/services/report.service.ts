import api from './api';

export const reportService = {
  async getMonthlyReport(year?: number, month?: number) {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());

    const response = await api.get(`/reports/monthly?${params}`);
    return response.data.data;
  },

  async getQuarterlyReport(year?: number, quarter?: number) {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (quarter) params.append('quarter', quarter.toString());

    const response = await api.get(`/reports/quarterly?${params}`);
    return response.data.data;
  },

  async getYearlyReport(year?: number) {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());

    const response = await api.get(`/reports/yearly?${params}`);
    return response.data.data;
  },

  async getTaxReport(year?: number) {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());

    const response = await api.get(`/reports/tax?${params}`);
    return response.data.data;
  },
};
