# Testing Strategy & Test Execution: Support Desk System

This document outlines automated test specifications, execution commands, and test verification matrices for the Support Desk System.

---

## 1. Test Suite Coverage

| Test ID | Category | Description | Target Component |
|---|---|---|---|
| `TC-01` | Ticket CRUD | Customer creates a ticket with valid subject, description, priority | `tickets.service.js` |
| `TC-02` | Validation | Ticket creation fails when subject or description is empty | `tickets.validator.js` |
| `TC-03` | Authorization | Customer cannot view or list other customers' tickets | `tickets.service.js` |
| `TC-04` | Assignment | Admin assigns ticket to an authorized support agent | `tickets.service.js` |
| `TC-05` | Assignment Audit | Ticket assignment creates an `ASSIGNED` activity log record | `ActivityLog` |
| `TC-06` | Status Mutation | Agent updates ticket status to `IN_PROGRESS` and `RESOLVED` | `tickets.service.js` |
| `TC-07` | Entries | Customer posts a public reply | `entries.service.js` |
| `TC-08` | Privacy | Customer cannot read `INTERNAL_NOTE` entries | `entries.service.js` |
| `TC-09` | Privacy | Customer cannot post an `INTERNAL_NOTE` (returns 403) | `entries.service.js` |
| `TC-10` | Entries | Support staff posts an internal note and public reply | `entries.service.js` |
| `TC-11` | Overdue Rule | Ticket older than 24h with status `OPEN` is marked `isOverdue: true` | `tickets.service.js` |
| `TC-12` | Overdue Rule | Ticket older than 24h with status `RESOLVED` is NOT overdue | `tickets.service.js` |
| `TC-13` | Filters & Search | Combined filtering by status, priority, and text search | `tickets.service.js` |
| `TC-14` | Dashboard | Metrics aggregate actual database counts for each status | `dashboard.service.js` |
| `TC-15` | RBAC | Non-admin user cannot change user roles (returns 403) | `users.controller.js` |

---

## 2. Test Execution Commands

- **Backend Integration Tests**:
  ```bash
  cd backend && npm test
  ```
- **Type/Lint/Build Checks**:
  ```bash
  cd frontend && npm run build
  ```

---

## 3. Results Log

### Automated Test Suite Execution (Node Test Runner + Supertest)
Command: `node --test backend/tests/api.test.js`
Date: October 29, 2026

```
TAP version 13
# Subtest: Support Desk API Integration Tests
    # Subtest: TC-01: Customer can create a support ticket with valid fields
    ok 1 - TC-01: Customer can create a support ticket with valid fields
    # Subtest: TC-02: Ticket creation fails when subject or description is too short
    ok 2 - TC-02: Ticket creation fails when subject or description is too short
    # Subtest: TC-03: Customer only sees their own tickets, not other customers
    ok 3 - TC-03: Customer only sees their own tickets, not other customers
    # Subtest: TC-04 & 05: Admin assigns agent and updates status with activity logging
    ok 4 - TC-04 & 05: Admin assigns agent and updates status with activity logging
    # Subtest: TC-06 & 07: Staff can post public replies and internal notes
    ok 5 - TC-06 & 07: Staff can post public replies and internal notes
    # Subtest: TC-08: Customer cannot see internal notes on their ticket
    ok 6 - TC-08: Customer cannot see internal notes on their ticket
    # Subtest: TC-09: Customer attempt to create internal note returns 403 Forbidden
    ok 7 - TC-09: Customer attempt to create internal note returns 403 Forbidden
    # Subtest: TC-10: Customer or Agent cannot change user roles (returns 403)
    ok 8 - TC-10: Customer or Agent cannot change user roles (returns 403)
    # Subtest: TC-11 & 12: Overdue status rule (createdAt > 24h & status !== RESOLVED)
    ok 9 - TC-11 & 12: Overdue status rule (createdAt > 24h & status !== RESOLVED)
    # Subtest: TC-13: Combined filtering returns precise results
    ok 10 - TC-13: Combined filtering returns precise results
    # Subtest: TC-14: Dashboard calculations reflect live PostgreSQL data
    ok 11 - TC-14: Dashboard calculations reflect live PostgreSQL data
    1..11
ok 1 - Support Desk API Integration Tests
1..1
# tests 11
# suites 1
# pass 11
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

All 11 automated integration tests passed with 100% success rate. The overdue calculation logic, customer privacy boundaries for internal notes, and transactional activity history logging have been verified against real PostgreSQL records.

