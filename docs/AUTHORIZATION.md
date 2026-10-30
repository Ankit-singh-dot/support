# Authorization & Permissions Matrix: Support Desk System

The Support Desk System enforces a strict Multi-Tier Role-Based Access Control (RBAC) model across all resources.

---

## 1. Roles Hierarchy

```
       [ ADMIN ]  ─── Full operational control, role management & reassignments
           │
       [ AGENT ]  ─── Ticket investigation, resolution, internal notes & public replies
           │
     [ CUSTOMER ] ─── Ticket submission, tracking own tickets & public replies
```

---

## 2. Granular Permissions Matrix

| Resource / Action | Customer | Support Agent | Admin | Enforcement Mechanism |
|---|:---:|:---:|:---:|---|
| **View Own Tickets** | ✅ | ✅ | ✅ | Filter by `customerId = req.user.id` |
| **View All Tickets** | ❌ | ✅ | ✅ | Handled in `tickets.service.js` |
| **Create Ticket** | ✅ | ✅ | ✅ | Backend sets `customerId = req.user.id` |
| **Edit Ticket Subject/Description** | ❌ | ❌ | ❌ | Immutability protects audit integrity |
| **Change Status / Priority** | ❌ | ✅ | ✅ | Enforced in `tickets.controller.js` |
| **Assign / Reassign Agents** | ❌ | ⚠️ (Self-claim) | ✅ (Any agent) | Enforced in `tickets.service.js` |
| **View Public Replies** | ✅ (Own) | ✅ | ✅ | Enforced in `entries.service.js` |
| **Post Public Reply** | ✅ (Own) | ✅ | ✅ | Enforced in `entries.service.js` |
| **View Internal Notes** | ❌ (Strictly blocked) | ✅ | ✅ | `where: { type: 'PUBLIC_REPLY' }` when customer |
| **Post Internal Note** | ❌ (Forbidden) | ✅ | ✅ | Rejected with `403 Forbidden` if customer |
| **View Activity History** | ⚠️ (Public events only) | ✅ (Full audit) | ✅ (Full audit) | Filtered in `history.service.js` |
| **Change User Roles** | ❌ (Forbidden) | ❌ (Forbidden) | ✅ | Enforced in `users.routes.js` (`requireAdmin`) |
| **View Agent List** | ❌ | ✅ | ✅ | Enforced in `agents.routes.js` (`requireStaff`) |
| **View Global Dashboard Metrics** | ❌ | ⚠️ (Scope: Staff) | ✅ (Scope: Global) | Computed dynamically in `dashboard.service.js` |

---

## 3. Boundary & Privacy Guarantees

1. **Anti-Tampering Rule**:
   - The user cannot specify `role` or `customerId` in request payloads. The backend strictly resolves `req.user` from the cryptographically verified Clerk session token and PostgreSQL `User` table.
2. **Horizontal Privilege Escalation Prevention**:
   - A Customer attempting to access `/api/tickets/:id` or `/api/tickets/:id/entries` for a ticket where `customerId !== req.user.id` immediately receives `404 Not Found` or `403 Forbidden`.
3. **Data Leakage Prevention for Notes**:
   - `INTERNAL_NOTE` records are completely excluded at the database query level when querying entries for a customer user. No internal note data ever traverses the network to a customer client.
