import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PRIORITY_WEIGHTS: Record<string, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 4,
};

export class DashboardService {
  async getStats() {
    const [
      totalTasks,
      tasksByStatus,
      tasksByPriority,
      overdueTasks,
      recentActivity,
    ] = await Promise.all([
      prisma.task.count(),
      prisma.task.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.task.groupBy({ by: ["priority"], _count: { id: true } }),
      prisma.task.count({
        where: {
          dueDate: { lt: new Date() },
          status: { notIn: ["DONE", "CANCELLED"] },
        },
      }),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true } },
          task: { select: { id: true, title: true } },
        },
      }),
    ]);

    const statusMap = Object.fromEntries(
      tasksByStatus.map((s) => [s.status, s._count.id])
    );
    const priorityMap = Object.fromEntries(
      tasksByPriority.map((p) => [p.priority, p._count.id])
    );

    return {
      totalTasks,
      tasksByStatus: statusMap,
      tasksByPriority: priorityMap,
      overdueTasks,
      recentActivity,
    };
  }

  async getWorkload() {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        assignedTasks: {
          where: { status: { notIn: ["DONE", "CANCELLED"] } },
          select: { id: true, priority: true, status: true, dueDate: true, title: true },
        },
      },
    });

    const workload = users.map((user) => {
      const taskCount = user.assignedTasks.length;
      const loadScore = user.assignedTasks.reduce(
        (sum, task) => sum + PRIORITY_WEIGHTS[task.priority],
        0
      );
      const overdueCount = user.assignedTasks.filter(
        (t) => t.dueDate && t.dueDate < new Date()
      ).length;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        taskCount,
        loadScore,
        overdueCount,
        tasks: user.assignedTasks,
      };
    });

    // Calculate average load
    const totalLoad = workload.reduce((sum, u) => sum + u.loadScore, 0);
    const avgLoad = workload.length > 0 ? totalLoad / workload.length : 0;
    const overloadThreshold = avgLoad * 2;

    // Flag overloaded users and generate suggestions
    const enrichedWorkload = workload.map((u) => ({
      ...u,
      isOverloaded: u.loadScore > overloadThreshold && u.taskCount > 3,
      tasks: undefined, // Remove raw task data from summary
    }));

    // Generate reassignment suggestions
    const suggestions: Array<{
      taskId: string;
      taskTitle: string;
      fromUserId: string;
      fromUserName: string;
      toUserId: string;
      toUserName: string;
      reason: string;
    }> = [];

    const overloaded = workload.filter(
      (u) => u.loadScore > overloadThreshold && u.taskCount > 3
    );
    const underloaded = workload
      .filter((u) => u.loadScore < avgLoad)
      .sort((a, b) => a.loadScore - b.loadScore);

    for (const user of overloaded) {
      // Suggest moving lowest-priority active task to least-loaded user
      const movableTasks = user.tasks
        .filter((t) => t.status === "TODO")
        .sort((a, b) => PRIORITY_WEIGHTS[a.priority] - PRIORITY_WEIGHTS[b.priority]);

      for (const task of movableTasks.slice(0, 2)) {
        const target = underloaded.find((u) => u.id !== user.id);
        if (target) {
          suggestions.push({
            taskId: task.id,
            taskTitle: task.title,
            fromUserId: user.id,
            fromUserName: user.name,
            toUserId: target.id,
            toUserName: target.name,
            reason: `${user.name} has ${user.taskCount} tasks (load: ${user.loadScore}), ${target.name} has ${target.taskCount} tasks (load: ${target.loadScore})`,
          });
        }
      }
    }

    return {
      workload: enrichedWorkload.sort((a, b) => b.loadScore - a.loadScore),
      averageLoad: Math.round(avgLoad * 100) / 100,
      suggestions,
    };
  }
}
