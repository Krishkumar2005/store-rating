import api from "./axios";

// Auth
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updatePassword: (data) => api.patch("/auth/update-password", data),
};

// Admin
export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getUsers: (params) => api.get("/admin/users", { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post("/admin/users", data),
  getStores: (params) => api.get("/admin/stores", { params }),
  createStore: (data) => api.post("/admin/stores", data),
};

// Stores (normal user)
export const storeAPI = {
  getStores: (params) => api.get("/stores", { params }),
  submitRating: (storeId, data) => api.post(`/stores/${storeId}/ratings`, data),
};

// Owner
export const ownerAPI = {
  getDashboard: () => api.get("/owner/dashboard"),
};
