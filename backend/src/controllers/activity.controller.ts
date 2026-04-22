import { Request, Response } from "express";
import { ActivityService } from "../services/activity.service";
import { asyncHandler } from "../utils/asyncHandler";

const activityService = new ActivityService();

export const getActivityLogs = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const userId = req.query.userId as string | undefined;

  const result = await activityService.getAll({ page, limit, userId });
  res.json({ success: true, data: result });
});

export const getTaskActivity = asyncHandler(async (req: Request, res: Response) => {
  const logs = await activityService.getByEntity("TASK", req.params.id as string);
  res.json({ success: true, data: logs });
});
