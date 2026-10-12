import API from './api';

export const dashboardService = {
  getEmployeeDashboard: async () => {
    const response = await API.get('/dashboard/employee');
    return response.data;
  },

  getDirectorDashboard: async () => {
    const response = await API.get('/dashboard/director');
    return response.data;
  },

  getAccountsDashboard: async () => {
    const response = await API.get('/dashboard/accounts');
    return response.data;
  },
};
