import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function autoSeed() {
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log("Database already has data, skipping seed.");
    return;
  }

  console.log("Empty database detected, seeding...");

  const password = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.create({
    data: { email: "admin@smartos.com", name: "Admin User", password, role: "ADMIN" },
  });

  const manager = await prisma.user.create({
    data: { email: "manager@smartos.com", name: "Sarah Manager", password, role: "MANAGER" },
  });

  const user1 = await prisma.user.create({
    data: { email: "alice@smartos.com", name: "Alice Developer", password, role: "USER" },
  });

  const user2 = await prisma.user.create({
    data: { email: "bob@smartos.com", name: "Bob Designer", password, role: "USER" },
  });

  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: "Set up CI/CD pipeline",
        description: "Configure GitHub Actions for automated testing and deployment",
        status: "IN_PROGRESS", priority: "HIGH",
        createdById: manager.id, assigneeId: user1.id,
        dueDate: new Date("2026-04-28"),
      },
    }),
    prisma.task.create({
      data: {
        title: "Design landing page mockups",
        description: "Create wireframes and high-fidelity mockups for the new landing page",
        status: "TODO", priority: "MEDIUM",
        createdById: manager.id, assigneeId: user2.id,
        dueDate: new Date("2026-04-30"),
      },
    }),
    prisma.task.create({
      data: {
        title: "Fix authentication token refresh bug",
        description: "Users are being logged out unexpectedly when their token expires",
        status: "TODO", priority: "URGENT",
        createdById: admin.id, assigneeId: user1.id,
        dueDate: new Date("2026-04-24"),
      },
    }),
    prisma.task.create({
      data: {
        title: "Write API documentation",
        description: "Document all REST endpoints with request/response examples",
        status: "IN_REVIEW", priority: "MEDIUM",
        createdById: user1.id, assigneeId: user1.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Database optimization review",
        description: "Review slow queries and add missing indexes",
        status: "TODO", priority: "HIGH",
        createdById: admin.id, assigneeId: manager.id,
        dueDate: new Date("2026-05-01"),
      },
    }),
    prisma.task.create({
      data: {
        title: "Implement dark mode",
        description: "Add dark mode toggle to the frontend application",
        status: "TODO", priority: "LOW",
        createdById: user2.id, assigneeId: user2.id,
      },
    }),
  ]);

  await prisma.comment.createMany({
    data: [
      { taskId: tasks[0].id, userId: user1.id, content: "Started working on this. Using GitHub Actions with Docker." },
      { taskId: tasks[0].id, userId: manager.id, content: "Make sure to include staging environment as well." },
      { taskId: tasks[2].id, userId: admin.id, content: "This is critical - several users have reported this issue." },
      { taskId: tasks[2].id, userId: user1.id, content: "Found the issue - the refresh token endpoint was not being called correctly." },
    ],
  });

  await prisma.activityLog.createMany({
    data: [
      { action: "TASK_CREATED", entityType: "TASK", entityId: tasks[0].id, userId: manager.id, taskId: tasks[0].id },
      { action: "TASK_STATUS_CHANGED", entityType: "TASK", entityId: tasks[0].id, userId: user1.id, taskId: tasks[0].id, metadata: JSON.stringify({ from: "TODO", to: "IN_PROGRESS" }) },
      { action: "TASK_CREATED", entityType: "TASK", entityId: tasks[2].id, userId: admin.id, taskId: tasks[2].id },
      { action: "COMMENT_ADDED", entityType: "TASK", entityId: tasks[2].id, userId: admin.id, taskId: tasks[2].id },
    ],
  });

  console.log("Seed completed! Accounts (password: password123):");
  console.log("  Admin:   admin@smartos.com");
  console.log("  Manager: manager@smartos.com");
  console.log("  User:    alice@smartos.com / bob@smartos.com");
}
