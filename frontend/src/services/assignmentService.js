import api from './api';

export const getAssignments = async (batchId) => {
  try {
    const params = batchId ? { batchId } : {};
    const response = await api.get('/assignments', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching assignments:', error);
    throw error;
  }
};

export const getAssignment = async (id) => {
  try {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching assignment details:', error);
    throw error;
  }
};

export const createAssignment = async (formData) => {
  try {
    const response = await api.post('/assignments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating assignment:', error);
    throw error;
  }
};

export const updateAssignment = async (id, formData) => {
  try {
    const response = await api.put(`/assignments/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating assignment:', error);
    throw error;
  }
};

export const deleteAssignment = async (id) => {
  try {
    const response = await api.delete(`/assignments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting assignment:', error);
    throw error;
  }
};

export const submitAssignment = async (assignmentId, formData) => {
  try {
    const response = await api.post(`/assignments/${assignmentId}/submit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting assignment:', error);
    throw error;
  }
};

export const getSubmissions = async (assignmentId) => {
  try {
    const response = await api.get(`/assignments/${assignmentId}/submissions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  }
};

export const gradeSubmission = async (submissionId, gradeData) => {
  try {
    const response = await api.put(`/submissions/${submissionId}/grade`, gradeData);
    return response.data;
  } catch (error) {
    console.error('Error grading submission:', error);
    throw error;
  }
};

export const logAssignmentView = async (assignmentId) => {
  try {
    const response = await api.post(`/logs/assignment/${assignmentId}/view`);
    return response.data;
  } catch (error) {
    console.error('Error logging assignment view:', error);
    // Don't throw - we don't want to break the app if logging fails
    return { success: false };
  }
};

export const logAssignmentDownload = async (assignmentId) => {
  try {
    const response = await api.post(`/logs/assignment/${assignmentId}/download`);
    return response.data;
  } catch (error) {
    console.error('Error logging assignment download:', error);
    // Don't throw - we don't want to break the app if logging fails
    return { success: false };
  }
};
