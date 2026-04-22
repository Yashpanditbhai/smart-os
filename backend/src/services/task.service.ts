import { PrismaClient, Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError";
import { WorkflowService } from "./workflow.service";
import { ActivityService } from "./activity.service";

const prisma = new PrismaClient();
const workflow = new WorkflowService();
const activity = new ActivityService();

export class TaskService {
  async create(data: {
    title: string;
    description?: string;
    priority?: string;
    assigneeId?: string;
    dueDate?: string;
    createdById: string;
    createdByRole: string;
  }) {
    // Users can only assign tasks to themselves
    if (data.createdByRole === "USER" && data.assigneeId && data.assigneeId !== data.createdById) {
      throw new AppError("Users can only assign tasks to themselves", 403, "FORBIDDEN");
    }

    if (data.assigneeId) {
      const assignee = await prisma.user.findUnique({ where: { id: data.assigneeId } });
      if (!assignee || !assignee.isActive) {
        throw new AppError("Assignee not found", 404, "ASSIGNEE_NOT_FOUND");
      }
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: (data.priority as any) || "MEDIUM",
        assigneeId: data.assigneeId,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        createdById: data.createdById,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    await activity.log({
      action: "TASK_CREATED",
      entityType: "TASK",
      entityId: task.id,
      userId: data.createdById,
      taskId: task.id,
      metadata: { title: task.title, assigneeId: task.assigneeId },
    });

    return task;
  }

  async getAll(params: {
    status?: string;
    priority?: string;
    assigneeId?: string;
    search?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: string;
    userId: string;
    userRole: string;
  }) {
    const where: Prisma.TaskWhereInput = {};

    if (params.status) where.status = params.status;
    if (params.priority) where.priority = params.priority as any;
    if (params.assigneeId) where.assigneeId = params.assigneeId;

    // Users can only see tasks they created or are assigned to
    if (params.userRole === "USER") {
      where.OR = [{ createdById: params.userId }, { assigneeId: params.userId }];
    }

    if (params.search) {
      const searchFilter = {
        OR: [
          { title: { contains: params.search, mode: "insensitive" as const } },
          { description: { contains: params.search, mode: "insensitive" as const } },
        ],
      };
      if (where.OR) {
        where.AND = [{ OR: where.OR }, searchFilter];
        delete where.OR;
      } else {
        where.OR = searchFilter.OR;
      }
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          assignee: { select: { id: true, name: true, email: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { [params.sortBy]: params.sortOrder },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.task.count({ where }),
    ]);

    return { tasks, total, page: params.page, totalPages: Math.ceil(total / params.limit) };
  }

  async getById(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        comments: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { comments: true, activityLogs: true } },
      },
    });

    if (!task) {
      throw new AppError("Task not found", 404, "NOT_FOUND");
    }

    const availableTransitions = workflow.getAvailableTransitions(task.status);
    return { ...task, availableTransitions };
  }

  async update(
    taskId: string,
    data: { title?: string; description?: string; priority?: string; assigneeId?: string | null; dueDate?: string | null },
    userId: string,
    userRole: string
  ) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new AppError("Task not found", 404, "NOT_FOUND");

    // Users can only update their own tasks or tasks assigned to them
    if (userRole === "USER" && task.createdById !== userId && task.assigneeId !== userId) {
      throw new AppError("You can only update your own tasks", 403, "FORBIDDEN");
    }

    // Users can only assign/reassign tasks to themselves
    if (userRole === "USER" && data.assigneeId && data.assigneeId !== userId) {
      throw new AppError("Users can only assign tasks to themselves", 403, "FORBIDDEN");
    }

    if (data.assigneeId) {
      const assignee = await prisma.user.findUnique({ where: { id: data.assigneeId } });
      if (!assignee || !assignee.isActive) {
        throw new AppError("Assignee not found", 404, "ASSIGNEE_NOT_FOUND");
      }
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    await activity.log({
      action: "TASK_UPDATED",
      entityType: "TASK",
      entityId: taskId,
      userId,
      taskId,
      metadata: { changes: data },
    });

    return updated;
  }

  async updateStatus(taskId: string, newStatus: string, userId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new AppError("Task not found", 404, "NOT_FOUND");

    workflow.validateTransition(task.status, newStatus);

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    await activity.log({
      action: "TASK_STATUS_CHANGED",
      entityType: "TASK",
      entityId: taskId,
      userId,
      taskId,
      metadata: { from: task.status, to: newStatus },
    });

    return updated;
  }

  async delete(taskId: string, userId: string, userRole: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new AppError("Task not found", 404, "NOT_FOUND");

    if (userRole === "USER" && task.createdById !== userId) {
      throw new AppError("Only task creator or managers can delete tasks", 403, "FORBIDDEN");
    }

    await prisma.task.delete({ where: { id: taskId } });

    await activity.log({
      action: "TASK_DELETED",
      entityType: "TASK",
      entityId: taskId,
      userId,
      metadata: { title: task.title },
    });
  }

  async addComment(taskId: string, content: string, userId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new AppError("Task not found", 404, "NOT_FOUND");

    const comment = await prisma.comment.create({
      data: { content, taskId, userId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    await activity.log({
      action: "COMMENT_ADDED",
      entityType: "TASK",
      entityId: taskId,
      userId,
      taskId,
      metadata: { commentId: comment.id },
    });

    return comment;
  }

  async getComments(taskId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new AppError("Task not found", 404, "NOT_FOUND");

    return prisma.comment.findMany({
      where: { taskId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
  }
}
