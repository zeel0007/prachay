import API from './api';

export const voucherService = {
  getVouchers: async (params = {}) => {
    const response = await API.get('/vouchers', { params });
    return response.data;
  },

  getVoucherById: async (id) => {
    const response = await API.get(`/vouchers/${id}`);
    return response.data;
  },

  createVoucher: async (voucherData) => {
    const response = await API.post('/vouchers', voucherData);
    return response.data;
  },

  updateVoucher: async (id, voucherData) => {
    const response = await API.patch(`/vouchers/${id}`, voucherData);
    return response.data;
  },

  deleteVoucher: async (id) => {
    const response = await API.delete(`/vouchers/${id}`);
    return response.data;
  },

  uploadEmployeeSignature: async (id, formData) => {
    const response = await API.post(`/vouchers/${id}/employee-signature`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadDirectorSignature: async (id, formData) => {
    const response = await API.post(`/vouchers/${id}/director-signature`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  submitVoucher: async (id, data = {}) => {
    const response = await API.post(`/vouchers/${id}/submit`, data);
    return response.data;
  },

  approveVoucher: async (id, data = {}) => {
    const response = await API.post(`/vouchers/${id}/approve`, data);
    return response.data;
  },

  rejectVoucher: async (id, data) => {
    const response = await API.post(`/vouchers/${id}/reject`, data);
    return response.data;
  },
};
