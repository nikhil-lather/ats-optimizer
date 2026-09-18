import axios from "axios";

const API = axios.create({
  baseURL: "/api",
});

// 🔐 Automatically attach token to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// 🔑 Auth
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");

// 📄 Resume
export const analyzeResume = (formData) =>
  API.post("/resume/analyze", formData);
export const analyzeResumeAsGuest = (formData) =>
  API.post("/resume/guest-analyze", formData);
export const getHistory = () => API.get("/resume/history");
export const getOne = (id) => API.get(`/resume/${id}`);
export const deleteResume = (id) => API.delete(`/resume/${id}`);
export const generateCoverLetter = (data) =>
  API.post("/resume/cover-letter", data);
export const generateGuestCoverLetter = (data) =>
  API.post("/resume/guest-cover-letter", data);

export default API;
