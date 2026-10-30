# Support Desk System — Freshdesk-Inspired Full-Stack Application

A reliable customer support ticket management application inspired by Freshdesk, built with **React**, **Vite**, **Tailwind CSS**, **Node.js**, **Express**, **PostgreSQL**, **Prisma ORM**, and **Clerk Authentication**.

---

## 1. Project Overview & Features

The system models a modern helpdesk platform with three user roles across two primary interface areas:

### A. Customer Support Portal (`/portal`)
- **Ticket Submission**: Submit new tickets with subject, description, and priority level.
- **My Tickets**: Live filterable list tracking status (`OPEN`, `IN_PROGRESS`, `WAITING_ON_CUSTOMER`, `RESOLVED`) and priority.
- **Interactive Conversation**: Real-time chronological discussion stream with support agents.
- **Customer Privacy Guarantee**: Customers strictly view only their own tickets and public replies. Internal notes and confidential staff reassignments are filtered out server-side.

### B. Internal Staff Workspace (`/staff` — Support Agent & Admin)
- **Freshdesk Two-Column Information Hierarchy**:
  - **Left / Main Column**: Submitter information card, original customer inquiry, chronological conversation timeline, and tabbed reply composer.
  - **Right Properties Panel**: Inline status update, priority selector, agent assignment selector, 24h SLA overdue breach warning, and activity history audit trail.
- **Tabbed Reply Composer**:
  - **Public Reply** (Clean blue accent): Sent directly to the customer.
  - **Internal Note** (Warm amber/yellow workspace with privacy warning header): Restricted exclusively to support team members.
- **24-Hour Overdue Rule**:
  - Calculated server-side via exact condition: `status !== 'RESOLVED' && createdAt < currentTime - 24 hours`.
  - Resolved tickets are strictly excluded from overdue status.
- **Admin Management**:
  - Live PostgreSQL dashboard metrics (Total, Open, In-Progress, Waiting on Customer, Resolved, Urgent, Overdue).
  - User and agent role management (`CUSTOMER`, `AGENT`, `ADMIN`) with instant database synchronization.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router 6, Tailwind CSS, Lucide Icons, Clerk React SDK, Centralized API Client |
| **Backend** | Node.js (v22+), Express.js (ES Modules), Clerk Express Middleware, Zod Validation, Prisma Client |
| **Database** | PostgreSQL 16 (persisted via embedded cluster or system host), Prisma Migrations |
| **Testing** | Node.js Test Runner, Supertest |

---

## 3. Project Architecture & Directory Layout

```
Support/
├── docs/
│   ├── ARCHITECTURE.md          # Request flow, RBAC, database relationships & lifecycle
│   ├── DATABASE_SCHEMA.md       # Prisma models, enums, indexes, cascade policies
│   ├── API.md                   # REST API documentation with sample payloads
│   ├── AUTHORIZATION.md         # Role permissions matrix & privacy boundaries
│   ├── DESIGN_SPEC.md           # Freshdesk design language & component hierarchy
│   ├── TESTING.md               # Automated test specifications & results
│   ├── IMPLEMENTATION_STATUS.md # Feature tracking checklist
│   └── DEVELOPMENT_LOG.md       # Chronological development & verification log
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Prisma schema (User, Ticket, TicketEntry, ActivityLog)
│   │   └── migrations/          # Version-controlled SQL migrations
│   ├── scripts/
│   │   ├── start-db.js          # Self-contained PostgreSQL daemon initializer
│   │   ├── seed.js              # Database seeder with realistic test personas & tickets
│   │   └── init-admin.js        # Admin provisioning script
│   ├── src/
│   │   ├── config/              # Prisma client & environment loader
│   │   ├── middleware/          # Clerk session sync, RBAC guards, Zod validator, error handler
│   │   ├── validators/          # Zod validation schemas
│   │   ├── services/            # Core business logic & Prisma transactions
│   │   ├── controllers/         # HTTP request/response handlers
│   │   ├── routes/              # Express API routers
│   │   ├── app.js               # Express application assembly
│   │   └── server.js            # Server listener on port 5000
│   └── tests/
│       └── api.test.js          # Automated integration test suite
├── frontend/
│   ├── src/
│   │   ├── api/client.js        # Centralized API client with auth interceptors
│   │   ├── context/AuthContext  # Auth context with Persona Switcher & Clerk support
│   │   ├── components/
│   │   │   ├── common/          # Badges, Buttons, Cards, Spinners, Empty states
│   │   │   ├── layout/          # CustomerLayout & StaffLayout
│   │   │   └── tickets/         # TicketList, TicketFilters, PropertiesPanel, ReplyComposer
│   │   ├── pages/
│   │   │   ├── customer/        # Customer Dashboard, My Tickets, Create Ticket, Details
│   │   │   └── staff/           # Staff Dashboard, All Tickets, Assigned, Details, Agent Admin
│   │   ├── App.jsx              # Application router
│   │   └── main.jsx             # React entrypoint
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
└── package.json                 # Unified npm workspace scripts
```

---

## 4. Quickstart & Installation

### Prerequisites
- Node.js `v18.0.0` or later (`v22` recommended)
- npm `v9+`

### Step 1: Install Dependencies
From the repository root:
```bash
# Backend dependencies
npm --prefix backend install

# Frontend dependencies
npm --prefix frontend install
```

### Step 2: Database Initialization (Zero-Config PostgreSQL)
The application includes a self-contained PostgreSQL instance powered by `embedded-postgres`. No system-level PostgreSQL setup or administrator rights are required:
```bash
# Start PostgreSQL background server daemon (runs on localhost:5432)
npm run db:start
```

Apply migrations and seed sample records:
```bash
# Push schema or apply migrations
npx --prefix backend prisma db push --schema backend/prisma/schema.prisma

# Seed users and scenario tickets
npm run db:seed
```

### Step 3: Start the Backend & Frontend

In Terminal 1 (Backend API):
```bash
npm run backend:dev
```
*API will run on `http://localhost:5000`.*

In Terminal 2 (Frontend Client):
```bash
npm run frontend:dev
```
*Open your browser at `http://localhost:5173`.*

---

## 5. Pre-Configured Test Personas & Role Switcher

To allow seamless evaluation without requiring immediate third-party Clerk API keys, the application includes a **Test Persona Switcher Toolbar** at the very top of the interface:

| Persona Name | Email | Application Role | Capabilities |
|---|---|:---:|---|
| **System Admin** | `admin@supportdesk.internal` | `ADMIN` | Full access: View all tickets, assign agents, promote roles, view global metrics |
| **Jane Agent** | `jane.support@supportdesk.internal` | `AGENT` | Staff access: View queues, post internal notes & public replies, resolve tickets |
| **Alice Cooper** | `alice@example.com` | `CUSTOMER` | Customer access: Submit tickets, view own tickets, respond with public replies |
| **Bob Vance** | `bob@example.com` | `CUSTOMER` | Customer access: Distinct customer account to verify horizontal data isolation |

Simply click any persona in the top bar to switch identities instantaneously.

### Using Real Clerk Credentials (Optional)
To use live Clerk authentication instead of the demo persona switcher:
1. In `backend/.env`:
   ```env
   CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."
   ```
2. In `frontend/.env`:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
   ```
3. Restart both servers. Clerk will verify session tokens, and the backend middleware will automatically synchronize each newly registered identity to PostgreSQL with role `CUSTOMER`.

---

## 6. Admin Provisioning

To promote any registered user or create a dedicated initial admin:
```bash
node backend/scripts/init-admin.js "admin@supportdesk.internal" "System Admin"
```

---

## 7. Complete 12-Step Workflow Demonstration (Interview Guide)

Follow this step-by-step walkthrough to demonstrate the full business workflow:

1. **Step 1 — Customer Signs In**:
   - In the top bar, select **Alice (CUSTOMER)**.
   - The interface opens to the **Customer Portal** (`/portal/dashboard`).
2. **Step 2 — Customer Submits Ticket**:
   - Click **Submit Ticket** (`/portal/tickets/new`).
   - Enter Subject: *"Payment gateway rejecting webhook callbacks"*, Priority: *Urgent*, and Description: *"Webhooks are returning HTTP 500 on checkout"*.
   - Click **Submit Ticket**.
3. **Step 3 — Backend Persistence**:
   - The ticket is validated with Zod, saved to PostgreSQL with status `OPEN`, and an initial `TICKET_CREATED` activity log is generated in a Prisma transaction.
4. **Step 4 — Customer View**:
   - Alice is redirected to the ticket conversation page (`/portal/tickets/:id`). Alice sees only public communications.
5. **Step 5 — Admin Reviews Queue**:
   - In the top bar, click **Admin (ADMIN)** and switch to the **Staff Workspace** (`/staff/dashboard`).
   - The new ticket appears in the Helpdesk queue with status `OPEN` and priority `Urgent`.
6. **Step 6 — Admin Assigns Agent**:
   - Click the ticket to open the Freshdesk two-column workspace (`/staff/tickets/:id`).
   - In the right-side **Properties Panel**, select Assignee: **Jane Agent**.
   - Click **Save Changes**. The backend records an `ASSIGNED` activity log.
7. **Step 7 — Agent Investigates & Updates Status**:
   - In the top bar, click **Jane (AGENT)**. Go to **Assigned to Me** (`/staff/assigned`).
   - Open the ticket. In the Properties Panel, change Status to **In Progress**.
   - Click **Save Changes**. An `IN_PROGRESS` audit event is recorded.
8. **Step 8 — Agent Posts Private Internal Note**:
   - In the reply composer, click the **Internal Note** tab.
   - The composer changes to a warm amber workspace with a confidentiality banner.
   - Enter: *"Checked payment service logs. Webhook signature secret needs rotation."*
   - Click **Add Internal Note**.
9. **Step 9 — Agent Sends Public Reply to Customer**:
   - Click the **Public Reply** tab.
   - Enter: *"Hello Alice, we have identified the webhook assertion error and are updating the certificate now."*
   - Click **Send Reply**.
10. **Step 10 — Privacy Boundary Verification**:
    - Switch the top bar back to **Alice (CUSTOMER)**.
    - Refresh Alice's view: Alice sees the agent's public message, but **never sees the internal note**. The backend strictly filtered out internal entries.
11. **Step 11 — Ticket Resolution**:
    - Switch back to **Jane (AGENT)**.
    - In the Properties Panel, change Status to **Resolved**. Click **Save Changes**.
12. **Step 12 — Overdue Rule & Audit Verification**:
    - Open the **Activity History** accordion in the right panel to observe the complete timestamped audit trail (`TICKET_CREATED`, `ASSIGNED`, `STATUS_CHANGED`, `INTERNAL_NOTE_ADDED`, `PUBLIC_REPLY_ADDED`, `RESOLVED`).
    - Observe the Overdue metric: resolved tickets never count as overdue!

---

## 8. Automated Testing

Run the automated integration test suite:
```bash
npm run test
```

### Verified Test Cases:
- `TC-01`: Customer ticket creation with valid fields.
- `TC-02`: Required-field validation (rejects invalid/short inputs).
- `TC-03`: Customer ticket ownership isolation (cannot see other customers' tickets).
- `TC-04 & 05`: Admin agent assignment and status updates with atomic transactional activity logs.
- `TC-06 & 07`: Support staff public replies and internal notes.
- `TC-08`: Customer access to internal notes is strictly filtered out.
- `TC-09`: Customer attempt to create internal notes is rejected with `403 Forbidden`.
- `TC-10`: Unauthorized role change attempts rejected with `403 Forbidden`.
- `TC-11 & 12`: Overdue business rule verification (`createdAt > 24h` and `status !== RESOLVED`), confirming resolved tickets are never overdue.
- `TC-13`: Combined filtering by status, priority, and text search.
- `TC-14`: Live PostgreSQL dashboard metrics aggregation.

---

## 9. Troubleshooting & FAQ

- **Database Connection Error (`P1001`)**:
  - Run `npm run db:start` to ensure the embedded PostgreSQL server daemon is active on port 5432.
- **Port 5432 in Use**:
  - Set `DB_PORT=5433` in `backend/.env` and re-run `node backend/scripts/start-db.js`.
- **Resetting Test Database**:
  - Run `npm run db:seed` at any time to restore the default sample users and scenario tickets.
# support
