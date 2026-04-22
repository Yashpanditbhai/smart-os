import { Request, Response } from "express";
import { TaskService } from "../services/task.service";
import { taskQuerySchema } from "../validators/task.validator";
import { asyncHandler } from "../utils/asyncHandler";

const taskService = new TaskService();

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.create({
    ...req.body,
    createdById: req.user!.id,
    createdByRole: req.user!.role,
  });
  res.status(201).json({ success: true, data: task });
});

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const query = taskQuerySchema.parse(req.query);
  const result = await taskService.getAll({
    ...query,
    userId: req.user!.id,
    userRole: req.user!.role,
  });
  res.json({ success: true, data: result });
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.getById(req.params.id as string);
  res.json({ success: true, data: task });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.update(
    req.params.id as string,
    req.body,
    req.user!.id,
    req.user!.role
  );
  res.json({ success: true, data: task });
});

export const updateTaskStatus = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.updateStatus(
    req.params.id as string,
    req.body.status,
    req.user!.id
  );
  res.json({ success: true, data: task });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  await taskService.delete(req.params.id as string, req.user!.id, req.user!.role);
  res.json({ success: true, message: "Task deleted" });
});

export const addComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await taskService.addComment(
    req.params.id as string,
    req.body.content,
    req.user!.id
  );
  res.status(201).json({ success: true, data: comment });
});

export const getComments = asyncHandler(async (req: Request, res: Response) => {
  const comments = await taskService.getComments(req.params.id as string);
  res.json({ success: true, data: comments });
});
