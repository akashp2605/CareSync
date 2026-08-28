import api from './axios';

export const appointmentApi = {
  getAll: async () => {
    const response = await api.get('/appointment/getall');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/appointment/get/${id}`);
    return response.data;
  },
  add: async (appointmentData) => {
    const response = await api.post('/appointment/add', appointmentData);
    return response.data;
  },
  update: async (id, appointmentData) => {
    const response = await api.post(`/appointment/update/${id}`, appointmentData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/appointment/delete/${id}`);
    return response.data;
  }
};
