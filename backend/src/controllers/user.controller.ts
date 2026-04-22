import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

const prisma = new PrismaClient();

export const getUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { name: "asc" },
  });
  res.json({ success: true, data: users });
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.body;
  if (!["ADMIN", "MANAGER", "USER"].includes(role)) {
    throw new AppError("Invalid role", 400, "INVALID_ROLE");
  }

  const user = await prisma.user.update({
    where: { id: req.params.id as string },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });

  res.json({ success: true, data: user });
});
