# Database Schema Documentation: Support Desk System

This document specifies the PostgreSQL relational schema managed via Prisma ORM for the Support Desk System.

---

## 1. Enums

### `Role`
- `CUSTOMER`: Default role for all public signups. Can create and view own tickets and public replies.
- `AGENT`: Support team member. Can view assigned/authorized tickets, post public replies & internal notes, change status/priority, and resolve tickets.
- `ADMIN`: Support manager. Unrestricted access to all tickets, ticket assignment, metrics, and role management.

### `TicketStatus`
- `OPEN`: Newly created ticket pending review or agent assignment.
- `IN_PROGRESS`: Ticket is being actively investigated by an assigned agent.
- `WAITING_ON_CUSTOMER`: Agent requested more information; awaiting customer response.
- `RESOLVED`: Issue has been addressed and completed.

### `TicketPriority`
- `LOW`
- `MEDIUM`
- `HIGH`
- `URGENT`

### `EntryType`
- `PUBLIC_REPLY`: Visible to both customer and internal staff.
- `INTERNAL_NOTE`: Private collaboration note; strictly restricted to `AGENT` and `ADMIN`.

---

## 2. Models & Fields

### Model: `User`
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | String (UUID) | `@id @default(uuid())` | Primary key |
| `clerkId` | String | `@unique` | Identity provider identifier from Clerk |
| `email` | String | `@unique` | User email address |
| `name` | String | | Display name of the user |
| `role` | `Role` | `@default(CUSTOMER)` | Application authorization role |
| `createdAt` | DateTime | `@default(now())` | Account creation timestamp |
| `updatedAt` | DateTime | `@updatedAt` | Last profile update timestamp |

**Relations**:
- `customerTickets`: `Ticket[]` (`@relation("CustomerTickets")`)
- `assignedTickets`: `Ticket[]` (`@relation("AssignedTickets")`)
- `entries`: `TicketEntry[]`
- `activities`: `ActivityLog[]`

---

### Model: `Ticket`
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | String (UUID) | `@id @default(uuid())` | Primary key |
| `subject` | String | | Summary of the issue |
| `description` | String (Text) | | Detailed explanation submitted by customer |
| `status` | `TicketStatus` | `@default(OPEN)` | Current lifecycle state |
| `priority` | `TicketPriority` | `@default(MEDIUM)` | Urgency level |
| `customerId` | String | FK -> User.id | Submitting customer |
| `assigneeId` | String? | FK -> User.id (Nullable) | Assigned support agent |
| `createdAt` | DateTime | `@default(now())` | Submission timestamp |
| `updatedAt` | DateTime | `@updatedAt` | Last modification timestamp |

**Indexes**:
- `@@index([customerId])`
- `@@index([assigneeId])`
- `@@index([status])`
- `@@index([priority])`
- `@@index([createdAt])`
- `@@index([updatedAt])`

**Relations**:
- `customer`: `User` via `customerId` (onDelete: Cascade)
- `assignee`: `User?` via `assigneeId` (onDelete: SetNull)
- `entries`: `TicketEntry[]`
- `activities`: `ActivityLog[]`

---

### Model: `TicketEntry`
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | String (UUID) | `@id @default(uuid())` | Primary key |
| `ticketId` | String | FK -> Ticket.id | Associated ticket |
| `authorId` | String | FK -> User.id | Message author |
| `content` | String (Text) | | Message text |
| `type` | `EntryType` | | Public reply or internal note |
| `createdAt` | DateTime | `@default(now())` | Timestamp of entry |

**Indexes**:
- `@@index([ticketId, createdAt])`

**Relations**:
- `ticket`: `Ticket` via `ticketId` (onDelete: Cascade)
- `author`: `User` via `authorId` (onDelete: Cascade)

---

### Model: `ActivityLog`
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | String (UUID) | `@id @default(uuid())` | Primary key |
| `ticketId` | String | FK -> Ticket.id | Associated ticket |
| `actorId` | String? | FK -> User.id (Nullable) | User triggering the change |
| `action` | String | | Change event (e.g. `STATUS_CHANGED`) |
| `oldValue` | String? | | Value prior to mutation |
| `newValue` | String? | | Value following mutation |
| `createdAt` | DateTime | `@default(now())` | Timestamp of event |

**Indexes**:
- `@@index([ticketId, createdAt])`

**Relations**:
- `ticket`: `Ticket` via `ticketId` (onDelete: Cascade)
- `actor`: `User?` via `actorId` (onDelete: SetNull)

---

## 3. Deletion & Integrity Policies

1. **User Deletion**:
   - If a customer is deleted, their associated tickets and logs are removed (`Cascade`).
   - If an agent is deleted, their assigned tickets have `assigneeId` reset to `null` (`SetNull`), preserving tickets and conversation records intact.
2. **Ticket Deletion**:
   - Ticket entries and activity logs cascade on ticket deletion (`Cascade`).
3. **Overdue Calculation Query Logic**:
   - In PostgreSQL / Prisma:
     ```prisma
     where: {
       status: { not: "RESOLVED" },
       createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
     }
     ```
