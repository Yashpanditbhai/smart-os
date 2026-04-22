import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service";
import { asyncHandler } from "../utils/asyncHandler";

const dashboardService = new DashboardService();

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await dashboardService.getStats();
  res.json({ success: true, data: stats });
});

export const getWorkload = asyncHandler(async (_req: Request, res: Response) => {
  const workload = await dashboardService.getWorkload();
  res.json({ success: true, data: workload });
});
