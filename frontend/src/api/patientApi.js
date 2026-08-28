import api from './axios';

export const patientApi = {
  getAll: async () => {
    const response = await api.get('/patient/getall');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/patient/get/${id}`);
    return response.data;
  },
  add: async (patientData) => {
    const response = await api.post('/patient/add', patientData);
    return response.data;
  },
  update: async (id, patientData) => {
    const response = await api.post(`/patient/update/${id}`, patientData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/patient/delete/${id}`);
    return response.data;
  }
};
