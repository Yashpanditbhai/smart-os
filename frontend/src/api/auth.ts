import api from "./client";

export const authApi = {
  signup: (data: { email: string; password: string; name: string }) =>
    api.post("/auth/signup", data).then((r) => r.data.data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data).then((r) => r.data.data),

  getMe: () => api.get("/auth/me").then((r) => r.data.data),
};
