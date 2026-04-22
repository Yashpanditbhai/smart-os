import api from "./client";

export const tasksApi = {
  getAll: (params?: Record<string, string>) =>
    api.get("/tasks", { params }).then((r) => r.data.data),

  getById: (id: string) =>
    api.get(`/tasks/${id}`).then((r) => r.data.data),

  create: (data: { title: string; description?: string; priority?: string; assigneeId?: string; dueDate?: string }) =>
    api.post("/tasks", data).then((r) => r.data.data),

  update: (id: string, data: Record<string, any>) =>
    api.put(`/tasks/${id}`, data).then((r) => r.data.data),

  updateStatus: (id: string, status: string) =>
    api.patch(`/tasks/${id}/status`, { status }).then((r) => r.data.data),

  delete: (id: string) =>
    api.delete(`/tasks/${id}`).then((r) => r.data),

  addComment: (id: string, content: string) =>
    api.post(`/tasks/${id}/comments`, { content }).then((r) => r.data.data),

  getComments: (id: string) =>
    api.get(`/tasks/${id}/comments`).then((r) => r.data.data),

  getActivity: (id: string) =>
    api.get(`/tasks/${id}/activity`).then((r) => r.data.data),
};
