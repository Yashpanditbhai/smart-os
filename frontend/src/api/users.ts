import api from "./client";

export const usersApi = {
  getAll: () => api.get("/users").then((r) => r.data.data),
  updateRole: (id: string, role: string) =>
    api.patch(`/users/${id}/role`, { role }).then((r) => r.data.data),
};
