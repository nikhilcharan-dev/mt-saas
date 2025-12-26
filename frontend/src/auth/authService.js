import api from "../api/api.js";

export const login = async (formData) => {
  const res = await api.post("/auth/login", formData);
  return res.data;
};
