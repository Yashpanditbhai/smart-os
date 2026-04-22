import { Router } from "express";
import { getUsers, updateUserRole } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List all users (Admin/Manager only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User list }
 */
router.get("/", authorize("ADMIN", "MANAGER"), getUsers);

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     tags: [Users]
 *     summary: Update user role (Admin only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Role updated }
 */
router.patch("/:id/role", authorize("ADMIN"), updateUserRole);

export default router;
