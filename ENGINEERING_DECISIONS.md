# Engineering Decision Document - Smart Operations System

## 1. System Architecture

### Overall Structure
The system follows a **monorepo architecture** with clearly separated frontend and backend applications:

```
smart-os/
├── backend/          # Express.js + TypeScript API server
│   ├── src/
│   │   ├── config/        # Environment configuration
│   │   ├── controllers/   # Request handlers (thin, delegate to services)
│   │   ├── middleware/     # Auth, RBAC, validation, error handling
│   │   ├── routes/        # Route definitions with Swagger docs
│   │   ├── services/      # Business logic layer
│   │   ├── utils/         # Shared utilities (AppError, asyncHandler)
│   │   └── validators/    # Zod request validation schemas
│   └── prisma/            # Database schema and migrations
├── frontend/         # React + TypeScript + Vite SPA
│   └── src/
│       ├── api/           # Axios API client layer
│       ├── components/    # Shared UI components
│       ├── context/       # React Context (auth state)
│       ├── pages/         # Route-level page components
│       ├── types/         # TypeScript type definitions
│       └── utils/         # Formatting helpers
```

### How Components Interact
1. **Frontend** communicates with Backend exclusively via REST API calls through an Axios client with JWT interceptors
2. **Backend** follows a Controller → Service → Prisma pattern for clean separation of concerns
3. **Middleware chain**: Request → CORS → JSON Parser → Auth → RBAC → Validation → Controller → Error Handler
4. **Activity logging** is embedded in the service layer, automatically recording all mutations

### Key Architectural Patterns
- **Service Layer Pattern**: Controllers are thin; all business logic lives in services, making it testable and reusable
- **Middleware Pipeline**: Cross-cutting concerns (auth, validation, error handling) are isolated in composable middleware
- **Workflow Engine**: Task status transitions are governed by a dedicated WorkflowService with a defined state machine

---

## 2. Database Design

### Entities and Relationships

```
User (1) ──────── (N) Task (as creator)
User (1) ──────── (N) Task (as assignee)
User (1) ──────── (N) Comment
User (1) ──────── (N) ActivityLog
Task (1) ──────── (N) Comment
Task (1) ──────── (N) ActivityLog
```

**User**: Core identity entity. Stores auth credentials, role, and active status.
- Relationships: Creates tasks, is assigned tasks, writes comments, generates activity logs

**Task**: The central work unit. Has a defined status workflow and priority system.
- Status: TODO → IN_PROGRESS → IN_REVIEW → DONE (with CANCELLED as escape hatch)
- Priority: LOW | MEDIUM | HIGH | URGENT (with weighted scoring for workload analysis)

**Comment**: Collaboration thread on tasks. Cascade-deleted when task is removed.

**ActivityLog**: Immutable audit trail. Records every significant action with metadata (JSON).

### Indexing Strategy
- User: `email` (unique, auth lookups), `role` (RBAC filtering)
- Task: `status`, `priority`, `assigneeId`, `createdById`, `dueDate` (all for filtered queries)
- ActivityLog: `(entityType, entityId)` (entity-specific history), `userId`, `createdAt` (chronological queries)

---

## 3. Key Decisions

### Decision: SQLite over PostgreSQL for Development
**Why**: Zero-dependency setup. Anyone can clone and run without installing PostgreSQL. Prisma abstracts the database layer, so switching to PostgreSQL for production requires only changing the datasource in `schema.prisma`.

**Alternative considered**: PostgreSQL from the start. Rejected because it adds friction to evaluation/setup without providing benefits at this scale.

### Decision: Service Layer Pattern (not fat controllers)
**Why**: Business logic in services is testable without HTTP concerns. Controllers only handle request/response mapping. This pattern scales well as complexity grows.

**Alternative considered**: Direct Prisma calls in controllers. Rejected because it leads to code duplication and makes testing harder.

### Decision: Status Workflow Engine
**Why**: Prevents invalid state transitions (e.g., DONE → IN_PROGRESS without going through TODO). The workflow is defined as a state machine in `WorkflowService`, making it easy to modify and reason about.

**Alternative considered**: Free-form status updates. Rejected because it would allow data inconsistencies and break operational workflows.

### Decision: Zod for Validation (not Joi/class-validator)
**Why**: Zod provides TypeScript-native schema validation with inferred types. It integrates cleanly with the TypeScript-first approach of the project.

### Decision: TailwindCSS (not Material UI/Chakra)
**Why**: Utility-first CSS gives full control over the design without fighting component library opinions. Produces smaller bundles and allows rapid prototyping.

---

## 4. Trade-offs

### SQLite vs PostgreSQL
- **Gave up**: Full-text search, concurrent writes, JSON column type (using string instead)
- **Gained**: Zero-dependency setup, instant development start
- **Migration path**: Change one line in Prisma schema for production

### No Refresh Token
- **Gave up**: Short-lived access tokens with refresh rotation
- **Gained**: Simpler auth flow, fewer API calls
- **Rationale**: For an internal tool, a 7-day token expiry is acceptable. A refresh mechanism would be added for a production deployment.

### No Real-time Updates
- **Gave up**: WebSocket-based live updates
- **Gained**: Simpler architecture, no connection management
- **Rationale**: Polling or manual refresh is acceptable for an internal ops tool with moderate concurrency

### Metadata as JSON String (SQLite limitation)
- **Gave up**: Type-safe JSON queries on activity log metadata
- **Gained**: Database portability, simpler schema
- **Rationale**: Activity metadata is primarily for display/audit, not for complex queries

---

## 5. Scaling Strategy

### What Breaks First at 10,000+ Users

1. **SQLite**: Single-writer lock becomes a bottleneck. **Fix**: Migrate to PostgreSQL (1-line Prisma change).

2. **Activity Log Table**: Grows unbounded, slowing queries. **Fix**: Partition by month, add TTL-based archival, or move to a time-series store (e.g., TimescaleDB).

3. **N+1 Queries in Workload Dashboard**: Currently loads all users with all their tasks. **Fix**: Use raw SQL aggregation queries, add caching (Redis), compute workload scores asynchronously.

4. **Single Server**: No horizontal scaling. **Fix**: Containerize with Docker, deploy behind a load balancer. The stateless JWT auth makes this straightforward.

5. **Search Performance**: `LIKE` queries on title/description don't scale. **Fix**: Add Elasticsearch or PostgreSQL full-text search indexes.

### Scaling Roadmap
1. **Phase 1** (1K users): Migrate to PostgreSQL, add connection pooling
2. **Phase 2** (5K users): Add Redis caching for dashboard/workload, implement pagination cursors
3. **Phase 3** (10K+ users): Elasticsearch for search, background job queue for notifications, WebSocket for real-time

---

## 6. Future Improvements

### If I Had 2 More Days

1. **Notifications System**: Real-time and email notifications for task assignments, status changes, and approaching due dates. Would use a background job queue (Bull/BullMQ) with Redis.

2. **Task Templates**: Pre-defined task templates for common operations (onboarding, incident response, deployment checklist). Reduces repetitive task creation.

3. **Kanban Board View**: Drag-and-drop board interface in addition to the list view. Would use `react-beautiful-dnd` with optimistic updates.

4. **Comprehensive Testing**: Unit tests for services (Jest), integration tests for API endpoints (Supertest), and E2E tests (Playwright).

5. **Bulk Operations**: Select multiple tasks and bulk-update status, priority, or assignee. Important for managers handling large task sets.

6. **File Attachments**: Allow attaching files/screenshots to tasks using S3-compatible storage.

---

## 7. Invented Feature: Smart Workload Dashboard

### What It Is
A workload analysis system that calculates team member load scores based on active task count and priority weighting, identifies overloaded team members, and automatically suggests task reassignments to balance the workload.

### Why I Added It
The assignment scenario mentions "poor system structure as the product scales" and "lack of visibility into workflows." A task list alone doesn't solve the visibility problem — managers need to see the *distribution* of work, not just the list. The workload dashboard directly addresses:

- **The visibility gap**: At a glance, managers see who is overloaded and who has capacity
- **Proactive management**: Suggestions prevent burnout before it happens, rather than reacting after deadlines are missed
- **Data-driven decisions**: Weighted load scores (URGENT=4x, LOW=1x) give a more accurate picture than simple task counts

### How It Works
1. Calculates a **load score** per user: `sum(priority_weight)` across active tasks
2. Computes team **average load** as baseline
3. Flags users with load > 2x average AND > 3 tasks as **overloaded**
4. Generates **reassignment suggestions**: moves lowest-priority TODO tasks from overloaded users to underloaded users
5. Returns the full analysis via `GET /api/dashboard/workload` (Admin/Manager only)

### What Problem It Solves
In a fast-growing startup, work distribution naturally becomes uneven. Without visibility, some team members get overloaded while others have spare capacity. This feature turns implicit workload knowledge into explicit, actionable data — which is exactly what an "operations system" should do.
