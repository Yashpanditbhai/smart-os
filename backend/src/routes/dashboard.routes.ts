import { Router } from "express";
import { getStats, getWorkload } from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard statistics
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dashboard stats }
 */
router.get("/stats", getStats);

/**
 * @swagger
 * /api/dashboard/workload:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get team workload analysis with reassignment suggestions
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Workload data with suggestions }
 */
router.get("/workload", authorize("ADMIN", "MANAGER"), getWorkload);

export default router;
