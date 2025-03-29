import api from './api';

export const getPPTs = async (batchId) => {
  const response = await api.get('/ppts', { params: { batchId } });
  return response.data;
};

export const getPPT = async (id) => {
  const response = await api.get(`/ppts/${id}`);
  return response.data;
};

export const uploadPPT = async (formData) => {
  const response = await api.post('/ppts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updatePPT = async (id, pptData) => {
  const response = await api.put(`/ppts/${id}`, pptData, {
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

export const logPPTView = async (pptId) => {
  const response = await api.post(`/logs/ppt/${pptId}/view`);
  return response.data;
};

export const logPPTDownload = async (pptId) => {
  const response = await api.post(`/logs/ppt/${pptId}/download`);
  return response.data;
};
