import api from "./axios.js";

export const getProjects = () => api.get("/projects");


export const createProject = (data) =>
  api.post("/projects", data);
export const getProjectTasks = (projectId) =>
  api.get(`/projects/${projectId}/tasks`);
