import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sfc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const endpoints = {
  login: (payload) => api.post("/auth/login", payload),
  register: (payload) => api.post("/auth/register", payload),
  me: () => api.get("/auth/me"),
  categories: () => api.get("/categories"),
  createCategory: (payload) => api.post("/categories", payload),
  foods: (params) => api.get("/food-items", { params }),
  createFood: (payload) => api.post("/food-items", payload),
  createOrder: (payload) => api.post("/orders", payload),
  orders: () => api.get("/orders"),
  updateOrder: (id, payload) => api.patch(`/orders/${id}/status`, payload),
  reserve: (payload) => api.post("/reservations", payload),
  reservations: () => api.get("/reservations"),
  updateReservation: (id, payload) => api.patch(`/reservations/${id}`, payload),
  customers: () => api.get("/users"),
  analytics: () => api.get("/analytics/summary")
};
