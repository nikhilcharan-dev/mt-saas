import api from "./api.js";

export const getTasks = (projectId) =>
  api.get(`/projects/${projectId}/tasks`);

export const createTask = (projectId, data) =>
  api.post(`/projects/${projectId}/tasks`, data);
