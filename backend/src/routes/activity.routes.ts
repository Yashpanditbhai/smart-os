import { Router } from "express";
import { getActivityLogs } from "../controllers/activity.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/activity:
 *   get:
 *     tags: [Activity]
 *     summary: Get all activity logs (Admin/Manager only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated activity logs }
 */
router.get("/", authorize("ADMIN", "MANAGER"), getActivityLogs);

export default router;
