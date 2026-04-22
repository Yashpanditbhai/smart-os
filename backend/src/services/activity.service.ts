import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ActivityService {
  async log(params: {
    action: string;
    entityType: string;
    entityId: string;
    userId: string;
    taskId?: string;
    metadata?: Record<string, any>;
  }) {
    return prisma.activityLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        userId: params.userId,
        taskId: params.taskId,
        metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
      },
    });
  }

  async getByEntity(entityType: string, entityId: string, limit = 50) {
    return prisma.activityLog.findMany({
      where: { entityType, entityId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async getAll(params: { page: number; limit: number; userId?: string }) {
    const where = params.userId ? { userId: params.userId } : {};
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          task: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return { logs, total, page: params.page, totalPages: Math.ceil(total / params.limit) };
  }
}
