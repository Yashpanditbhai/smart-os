import { Router } from "express";
import {
  createTask, getTasks, getTask, updateTask,
  updateTaskStatus, deleteTask, addComment, getComments,
} from "../controllers/task.controller";
import { getTaskActivity } from "../controllers/activity.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createTaskSchema, updateTaskSchema,
  updateStatusSchema, createCommentSchema,
} from "../validators/task.validator";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: List tasks with filtering, search, and pagination
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [TODO, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT] }
 *       - in: query
 *         name: assigneeId
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [createdAt, updatedAt, dueDate, priority], default: createdAt }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200: { description: Paginated task list }
 */
router.get("/", getTasks);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a new task
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT] }
 *               assigneeId: { type: string, format: uuid }
 *               dueDate: { type: string, format: date-time }
 *     responses:
 *       201: { description: Task created }
 */
router.post("/", validate(createTaskSchema), createTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get task by ID with comments and activity
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Task details }
 *       404: { description: Task not found }
 */
router.get("/:id", getTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     tags: [Tasks]
 *     summary: Update task details
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Task updated }
 */
router.put("/:id", validate(updateTaskSchema), updateTask);

/**
 * @swagger
 * /api/tasks/{id}/status:
 *   patch:
 *     tags: [Tasks]
 *     summary: Transition task status (with workflow validation)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [TODO, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED] }
 *     responses:
 *       200: { description: Status updated }
 *       400: { description: Invalid transition }
 */
router.patch("/:id/status", validate(updateStatusSchema), updateTaskStatus);

router.delete("/:id", deleteTask);

/**
 * @swagger
 * /api/tasks/{id}/comments:
 *   post:
 *     tags: [Tasks]
 *     summary: Add a comment to a task
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Comment added }
 */
router.post("/:id/comments", validate(createCommentSchema), addComment);
router.get("/:id/comments", getComments);

/**
 * @swagger
 * /api/tasks/{id}/activity:
 *   get:
 *     tags: [Tasks]
 *     summary: Get activity log for a task
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Activity logs }
 */
router.get("/:id/activity", getTaskActivity);

export default router;
