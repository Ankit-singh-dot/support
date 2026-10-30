# System Architecture: Support Desk System

## 1. High-Level Architecture Overview

The Support Desk System is built on a modular client-server architecture inspired by Freshdesk's helpdesk paradigm:

```
[ Customer / Staff Browser ]
         │
         ├── React (Vite) + Tailwind CSS + Lucide Icons
         ├── Clerk React SDK (Auth state & JWT token)
         └── Centralized Axios/Fetch API Client
                  │  HTTP (REST + Authorization: Bearer <JWT>)
                  ▼
[ Express.js Backend Application ]
         ├── Clerk Express Middleware (JWT verification)
         ├── Local Identity Synchronization Middleware
         ├── Role-Based Access Control (RBAC) Guard
         ├── Zod Request Validators
         ├── Express Controllers & Business Services
         └── Prisma Client (ORM & Transactions)
                  │  PostgreSQL Wire Protocol
                  ▼
[ PostgreSQL Database ]
         ├── Users (Clerk Sync + Role)
         ├── Tickets (Status, Priority, Assignee)
         ├── TicketEntries (PUBLIC_REPLY, INTERNAL_NOTE)
         └── ActivityLogs (Audit trail of changes)
```

---

## 2. Request & Authentication Flow

1. **Authentication Token Issuance**:
   - The user authenticates through Clerk (email/password, OAuth).
   - Clerk issues an authenticated session token (`JWT`).
2. **API Request Dispatch**:
   - The frontend's centralized API client intercepts outgoing requests and attaches `Authorization: Bearer <token>`.
3. **Session Verification & User Sync**:
   - The backend's `clerkMiddleware` verifies the cryptographic signature of the token and extracts the `clerkId`.
   - The `syncUser` middleware checks if a record with `clerkId` exists in the local PostgreSQL `User` table:
     - If not found, a new local `User` record is created with default role `CUSTOMER`.
     - The local user record (`id`, `clerkId`, `email`, `name`, `role`) is attached to `req.user`.
4. **Role & Permission Validation**:
   - The endpoint guard checks `req.user.role`.
   - If an unauthorized role attempts access (e.g. customer requesting `/api/agents` or agent modifying role), the request is rejected with `403 Forbidden`.
5. **Business Logic & Persistence**:
   - Controllers delegate to modular Service classes.
   - For mutative operations affecting multiple records (e.g., ticket update + activity log creation), Prisma interactive transactions guarantee atomic consistency.

---

## 3. Database Relationships

- **User**:
  - `id` (UUID Primary Key)
  - `clerkId` (Unique string)
  - `email` (Unique string)
  - `name` (String)
  - `role` (`CUSTOMER` | `AGENT` | `ADMIN`)
  - One-to-Many with `Ticket` as `customer`
  - One-to-Many with `Ticket` as `assignee`
  - One-to-Many with `TicketEntry` as `author`
  - One-to-Many with `ActivityLog` as `actor`

- **Ticket**:
  - `id` (UUID Primary Key)
  - `subject` (String)
  - `description` (Text)
  - `status` (`OPEN` | `IN_PROGRESS` | `WAITING_ON_CUSTOMER` | `RESOLVED`)
  - `priority` (`LOW` | `MEDIUM` | `HIGH` | `URGENT`)
  - `customerId` (FK -> User.id)
  - `assigneeId` (Nullable FK -> User.id)
  - One-to-Many with `TicketEntry`
  - One-to-Many with `ActivityLog`

- **TicketEntry**:
  - `id` (UUID Primary Key)
  - `ticketId` (FK -> Ticket.id)
  - `authorId` (FK -> User.id)
  - `content` (Text)
  - `type` (`PUBLIC_REPLY` | `INTERNAL_NOTE`)
  - `createdAt` (Timestamp)

- **ActivityLog**:
  - `id` (UUID Primary Key)
  - `ticketId` (FK -> Ticket.id)
  - `actorId` (Nullable FK -> User.id)
  - `action` (String / Enum: `TICKET_CREATED`, `STATUS_CHANGED`, `PRIORITY_CHANGED`, `ASSIGNED`, `REASSIGNED`, `PUBLIC_REPLY_ADDED`, `INTERNAL_NOTE_ADDED`)
  - `oldValue` (Nullable string)
  - `newValue` (Nullable string)
  - `createdAt` (Timestamp)

---

## 4. Main Ticket Lifecycle & State Machine

```
               [Customer Submits Ticket]
                         │
                         ▼
                     [ OPEN ]
                         │
          ┌──────────────┴──────────────┐
          │ Admin assigns Agent         │ Customer/Agent replies
          ▼                             ▼
   [ IN_PROGRESS ] <─────────> [ WAITING_ON_CUSTOMER ]
          │                             │
          └──────────────┬──────────────┘
                         │ Agent resolves issue
                         ▼
                   [ RESOLVED ]
```

---

## 5. Activity Logging & Privacy Boundary

- **Internal Staff (Admin / Agent)**:
  - Can view all ticket entries (Public Replies + Internal Notes).
  - Can view all activity logs (ticket creation, status/priority changes, reassignments, internal note additions).
- **Customers**:
  - Restricted strictly to tickets where `customerId === req.user.id`.
  - Can view only `PUBLIC_REPLY` entries.
  - Can view only customer-safe activity logs (status updates, ticket creation, public agent replies). Internal notes and staff reassignments are filtered out server-side.
