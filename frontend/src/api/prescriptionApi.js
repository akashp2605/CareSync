import api from './axios';

export const prescriptionApi = {
  getAll: async () => {
    const response = await api.get('/prescription/getall');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/prescription/get/${id}`);
    return response.data;
  },
  add: async (prescriptionData) => {
    // Note: The backend property is Dosage, but standard JSON serialization
    // might expect lowercase 'dosage' or uppercase 'Dosage' based on jackson rules.
    // We will normalize the casing to match the Java property 'Dosage' just in case.
    const response = await api.post('/prescription/add', prescriptionData);
    return response.data;
  },
  update: async (id, prescriptionData) => {
    const response = await api.post(`/prescription/update/${id}`, prescriptionData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/prescription/delete/${id}`);
    return response.data;
  }
};
