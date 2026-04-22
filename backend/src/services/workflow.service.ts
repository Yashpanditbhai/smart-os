import { AppError } from "../utils/AppError";

type Status = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED";

const TRANSITIONS: Record<Status, Status[]> = {
  TODO: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["IN_REVIEW", "TODO", "CANCELLED"],
  IN_REVIEW: ["DONE", "IN_PROGRESS", "CANCELLED"],
  DONE: ["TODO"],
  CANCELLED: ["TODO"],
};

export class WorkflowService {
  validateTransition(from: string, to: string): void {
    const allowed = TRANSITIONS[from as Status];
    if (!allowed || !allowed.includes(to as Status)) {
      throw new AppError(
        `Invalid status transition: ${from} -> ${to}. Allowed: ${allowed?.join(", ") || "none"}`,
        400,
        "INVALID_TRANSITION"
      );
    }
  }

  getAvailableTransitions(status: string): string[] {
    return TRANSITIONS[status as Status] || [];
  }
}
