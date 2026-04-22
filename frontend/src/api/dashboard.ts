import api from "./client";

export const dashboardApi = {
  getStats: () => api.get("/dashboard/stats").then((r) => r.data.data),
  getWorkload: () => api.get("/dashboard/workload").then((r) => r.data.data),
};
