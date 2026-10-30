# REST API Specification: Support Desk System

Base URL: `/api`

All protected endpoints require an `Authorization: Bearer <session_token>` header.

---

## 1. User & Staff Management Endpoints

### `GET /api/users/me`
- **Description**: Returns the authenticated user profile along with their synchronized local application role.
- **Access**: All authenticated users (`CUSTOMER`, `AGENT`, `ADMIN`).
- **Response `200 OK`**:
  ```json
  {
    "id": "uuid",
    "clerkId": "user_2...",
    "email": "user@example.com",
    "name": "Shivam Sharma",
    "role": "ADMIN",
    "createdAt": "2026-10-29T08:00:00.000Z"
  }
  ```

### `GET /api/agents`
- **Description**: Lists all users eligible for ticket assignment (`AGENT` or `ADMIN` roles).
- **Access**: Staff only (`AGENT`, `ADMIN`).
- **Response `200 OK`**:
  ```json
  [
    {
      "id": "uuid",
      "name": "Jane Support",
      "email": "jane@supportdesk.internal",
      "role": "AGENT"
    }
  ]
  ```

### `GET /api/users`
- **Description**: Lists all system users with search, role filters, and pagination.
- **Access**: `ADMIN` only.
- **Query Parameters**: `role` (optional), `search` (optional).
- **Response `200 OK`**:
  ```json
  [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@customer.com",
      "role": "CUSTOMER",
      "createdAt": "2026-10-29T08:00:00.000Z"
    }
  ]
  ```

### `PATCH /api/users/:id/role`
- **Description**: Promotes or changes a user's application role (`CUSTOMER`, `AGENT`, `ADMIN`).
- **Access**: `ADMIN` only.
- **Request Body**:
  ```json
  {
    "role": "AGENT"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "id": "uuid",
    "name": "Jane Support",
    "email": "jane@supportdesk.internal",
    "role": "AGENT",
    "updatedAt": "2026-10-29T08:15:00.000Z"
  }
  ```

---

## 2. Ticket Management Endpoints

### `GET /api/tickets`
- **Description**: Retrieves a list of tickets matching optional query parameters.
- **Access**:
  - `CUSTOMER`: Returns only tickets where `customerId === req.user.id`.
  - `AGENT`: Returns assigned tickets or all authorized support tickets.
  - `ADMIN`: Returns all tickets across the workspace.
- **Query Parameters**:
  - `search`: Matches subject, customer name, or email.
  - `status`: Filters by `OPEN`, `IN_PROGRESS`, `WAITING_ON_CUSTOMER`, `RESOLVED`.
  - `priority`: Filters by `LOW`, `MEDIUM`, `HIGH`, `URGENT`.
  - `assigneeId`: Filters by assigned agent UUID (`unassigned` or specific agent UUID).
  - `sortBy`: `updatedAt` (default) or `priority` or `createdAt`.
  - `sortOrder`: `asc` or `desc` (default).
  - `isOverdue`: `true` or `false` (filters by 24h overdue rule).
- **Response `200 OK`**:
  ```json
  {
    "tickets": [
      {
        "id": "uuid",
        "subject": "Cannot connect to VPN gateway",
        "description": "Getting error 504 on handshake",
        "status": "OPEN",
        "priority": "HIGH",
        "isOverdue": true,
        "customer": {
          "id": "uuid",
          "name": "Alice Customer",
          "email": "alice@customer.com"
        },
        "assignee": null,
        "createdAt": "2026-10-28T05:00:00.000Z",
        "updatedAt": "2026-10-28T05:00:00.000Z"
      }
    ],
    "total": 1
  }
  ```

### `POST /api/tickets`
- **Description**: Creates a new customer support ticket.
- **Access**: Authenticated users. Customers create tickets assigned to themselves.
- **Request Body**:
  ```json
  {
    "subject": "Billing issue on invoice #1029",
    "description": "Double charge on debit card for annual renewal.",
    "priority": "HIGH"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "id": "uuid",
    "subject": "Billing issue on invoice #1029",
    "description": "Double charge on debit card for annual renewal.",
    "status": "OPEN",
    "priority": "HIGH",
    "customerId": "uuid",
    "assigneeId": null,
    "createdAt": "2026-10-29T08:30:00.000Z",
    "updatedAt": "2026-10-29T08:30:00.000Z"
  }
  ```

### `GET /api/tickets/:id`
- **Description**: Retrieves full details of a specific ticket.
- **Access**:
  - `CUSTOMER`: Allowed only if ticket belongs to the user.
  - `AGENT` / `ADMIN`: Allowed.
- **Response `200 OK`**:
  ```json
  {
    "id": "uuid",
    "subject": "Billing issue on invoice #1029",
    "description": "Double charge on debit card for annual renewal.",
    "status": "OPEN",
    "priority": "HIGH",
    "isOverdue": false,
    "customer": { "id": "uuid", "name": "Alice Customer", "email": "alice@customer.com" },
    "assignee": { "id": "uuid", "name": "Bob Agent", "email": "bob@supportdesk.internal" },
    "createdAt": "2026-10-29T08:30:00.000Z",
    "updatedAt": "2026-10-29T08:30:00.000Z"
  }
  ```

### `PATCH /api/tickets/:id`
- **Description**: Updates ticket status, priority, or assignee.
- **Access**:
  - `CUSTOMER`: Cannot update status, priority, or assignee directly.
  - `AGENT`: Can update status, priority; can assign to self.
  - `ADMIN`: Full update privileges (status, priority, assignee).
- **Request Body**:
  ```json
  {
    "status": "IN_PROGRESS",
    "priority": "URGENT",
    "assigneeId": "uuid-agent-id"
  }
  ```
- **Response `200 OK`**: Updated ticket object.

---

## 3. Conversation & Ticket Entries

### `GET /api/tickets/:id/entries`
- **Description**: Returns chronological conversation messages for a ticket.
- **Access**:
  - `CUSTOMER`: Returns only entries where `type === 'PUBLIC_REPLY'`. Internal notes are strictly excluded.
  - `AGENT` / `ADMIN`: Returns all entries (`PUBLIC_REPLY` and `INTERNAL_NOTE`).
- **Response `200 OK`**:
  ```json
  [
    {
      "id": "uuid",
      "ticketId": "uuid",
      "author": { "id": "uuid", "name": "Alice Customer", "role": "CUSTOMER" },
      "content": "Here is the invoice receipt.",
      "type": "PUBLIC_REPLY",
      "createdAt": "2026-10-29T08:35:00.000Z"
    }
  ]
  ```

### `POST /api/tickets/:id/entries`
- **Description**: Adds a public reply or internal note.
- **Access**:
  - `CUSTOMER`: Allowed for `PUBLIC_REPLY` only on own ticket.
  - `AGENT` / `ADMIN`: Allowed for both `PUBLIC_REPLY` and `INTERNAL_NOTE`.
- **Request Body**:
  ```json
  {
    "content": "Investigating with billing team.",
    "type": "INTERNAL_NOTE"
  }
  ```
- **Response `201 Created`**: Created entry record.

---

## 4. Activity History

### `GET /api/tickets/:id/history`
- **Description**: Retrieves audit activity log for a ticket.
- **Access**:
  - `CUSTOMER`: Returns only customer-safe actions (e.g. status changes, public replies). Internal staff reassignments and internal note notifications are filtered out.
  - `AGENT` / `ADMIN`: Returns complete activity history.
- **Response `200 OK`**:
  ```json
  [
    {
      "id": "uuid",
      "ticketId": "uuid",
      "action": "STATUS_CHANGED",
      "oldValue": "OPEN",
      "newValue": "IN_PROGRESS",
      "actor": { "id": "uuid", "name": "Bob Agent" },
      "createdAt": "2026-10-29T08:40:00.000Z"
    }
  ]
  ```

---

## 5. Dashboard Metrics

### `GET /api/dashboard`
- **Description**: Returns aggregated real-time metrics computed directly from PostgreSQL.
- **Access**: Authenticated users (metrics scoped by role):
  - `ADMIN`: Global workspace metrics.
  - `AGENT`: Authorized / assigned metrics.
  - `CUSTOMER`: Personal ticket metrics.
- **Response `200 OK`**:
  ```json
  {
    "total": 42,
    "open": 12,
    "inProgress": 15,
    "waitingOnCustomer": 5,
    "resolved": 10,
    "urgent": 4,
    "overdue": 3,
    "recentTickets": [ ... ]
  }
  ```
