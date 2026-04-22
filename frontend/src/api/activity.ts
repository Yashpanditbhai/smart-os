import api from "./client";

export const activityApi = {
  getAll: (params?: Record<string, string>) =>
    api.get("/activity", { params }).then((r) => r.data.data),
};
