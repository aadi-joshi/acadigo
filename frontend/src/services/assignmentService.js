import api from './api';

export const getAssignments = async (batchId) => {
  const response = await api.get('/assignments', { params: { batchId } });
  return response.data;
};

export const getAssignment = async (id) => {
  const response = await api.get(`/assignments/${id}`);
  return response.data;
};

export const createAssignment = async (formData) => {
  const response = await api.post('/assignments', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateAssignment = async (id, assignmentData) => {
  const response = await api.put(`/assignments/${id}`, assignmentData);
  return response.data;
};

export const deleteAssignment = async (id) => {
  const response = await api.delete(`/assignments/${id}`);
  return response.data;
};

export const submitAssignment = async (assignmentId, formData) => {
  const response = await api.post(`/assignments/${assignmentId}/submit`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getSubmissions = async (assignmentId) => {
  const response = await api.get(`/assignments/${assignmentId}/submissions`);
  return response.data;
};

export const getStudentSubmissions = async () => {
  const response = await api.get('/submissions/my-submissions');
  return response.data;
};

export const gradeSubmission = async (submissionId, data) => {
  const response = await api.post(`/submissions/${submissionId}/grade`, data);
  return response.data;
};
