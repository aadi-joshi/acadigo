import api from './api';

export const getPPTs = async () => {
  const response = await api.get('/ppts');
  return response.data;
};

export const getAvailablePPTs = async () => {
  const response = await api.get('/ppts/available');
  return response.data;
};

export const getPPT = async (id) => {
  const response = await api.get(`/ppts/${id}`);
  return response.data;
};

export const createPPT = async (formData) => {
  const response = await api.post('/ppts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updatePPT = async (id, formData) => {
  const response = await api.put(`/ppts/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deletePPT = async (id) => {
  const response = await api.delete(`/ppts/${id}`);
  return response.data;
};
