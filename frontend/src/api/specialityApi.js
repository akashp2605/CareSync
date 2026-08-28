import api from './axios';

export const specialityApi = {
  getAll: async () => {
    const response = await api.get('/speciality/getall');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/speciality/get/${id}`);
    return response.data;
  },
  add: async (specialityData) => {
    const response = await api.post('/speciality/add', specialityData);
    return response.data;
  },
  update: async (id, specialityData) => {
    const response = await api.post(`/speciality/update/${id}`, specialityData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/speciality/delete/${id}`);
    return response.data;
  }
};
