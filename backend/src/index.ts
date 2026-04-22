import express from "express";
import cors from "cors";
import path from "path";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { config } from "./config";
import { errorHandler } from "./middleware/error.middleware";
import { autoSeed } from "./services/seed.service";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import activityRoutes from "./routes/activity.routes";
import userRoutes from "./routes/user.routes";

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? true : config.frontendUrl,
  credentials: true,
}));
app.use(express.json());

// Swagger
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Smart Operations System API",
      version: "1.0.0",
      description: "Internal operations management system with task tracking, RBAC, and workload analytics",
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
});
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve frontend in production
const frontendPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendPath));
app.get("*", (_req, res, next) => {
  if (_req.path.startsWith("/api")) return next();
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Error handler (must be last)
app.use(errorHandler);

const server = app.listen(config.port, async () => {
  console.log(`Server running on http://localhost:${config.port}`);
  console.log(`Swagger docs: http://localhost:${config.port}/api/docs`);
  await autoSeed().catch((e) => console.error("Auto-seed failed:", e));
});

// Graceful shutdown on Ctrl+C
process.on("SIGINT", () => {
  console.log("\nShutting down...");
  server.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});

export default app;
