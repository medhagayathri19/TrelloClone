import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://trelloclone-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const taskService = {
  // Fetch all tasks with optional filters
  getTasks: async (params = {}) => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  // Get a single task
  getTaskById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Create a new task
  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  // Update existing task details or status
  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  // Batch reorder tasks (drag & drop)
  reorderTasks: async (updates) => {
    const response = await api.put('/tasks/batch/reorder', { updates });
    return response.data;
  },

  // Delete a task
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  // Reset demo tasks
  resetDemoTasks: async () => {
    const response = await api.post('/tasks/manage/reset');
    return response.data;
  },

  // Clear all tasks
  clearAllTasks: async () => {
    const response = await api.delete('/tasks/manage/clear');
    return response.data;
  },
};

export default api;

