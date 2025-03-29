import api from './api';

export const getPPTs = async (batchId) => {
  try {
    const params = batchId ? { batchId } : {};
    const response = await api.get('/ppts', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching PPTs:', error);
    throw error;
  }
};

export const getPPT = async (id) => {
  try {
    const response = await api.get(`/ppts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching PPT details:', error);
    throw error;
  }
};

export const uploadPPT = async (formData) => {
  try {
    const response = await api.post('/ppts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading PPT:', error);
    throw error;
  }
};

export const updatePPT = async (id, pptData) => {
  try {
    const response = await api.put(`/ppts/${id}`, pptData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating PPT:', error);
    throw error;
  }
};

export const deletePPT = async (id) => {
  try {
    const response = await api.delete(`/ppts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting PPT:', error);
    throw error;
  }
};

export const logPPTView = async (pptId) => {
  try {
    const response = await api.post(`/logs/ppt/${pptId}/view`);
    return response.data;
  } catch (error) {
    console.error('Error logging PPT view:', error);
    // Don't throw - we don't want to break the app if logging fails
    return { success: false };
  }
};

export const logPPTDownload = async (pptId) => {
  try {
    const response = await api.post(`/logs/ppt/${pptId}/download`);
    return response.data;
  } catch (error) {
    console.error('Error logging PPT download:', error);
    // Don't throw - we don't want to break the app if logging fails
    return { success: false };
  }
};
