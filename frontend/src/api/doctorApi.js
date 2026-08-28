import api from './axios';

export const doctorApi = {
  getAll: async () => {
    const response = await api.get('/doctor/getall');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/doctor/get/${id}`);
    return response.data;
  },
  add: async (doctorData) => {
    const response = await api.post('/doctor/add', doctorData);
    return response.data;
  },
  update: async (id, doctorData) => {
    const response = await api.post(`/doctor/update/${id}`, doctorData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/doctor/delete/${id}`);
    return response.data;
  }
};
