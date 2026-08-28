import api from './axios';

export const departmentApi = {
  getAll: async () => {
    const response = await api.get('/department/getall');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/department/get/${id}`);
    return response.data;
  },
  add: async (deptData) => {
    const response = await api.post('/department/add', deptData);
    return response.data;
  },
  update: async (id, deptData) => {
    const response = await api.post(`/department/update/${id}`, deptData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/department/delete/${id}`);
    return response.data;
  }
};
