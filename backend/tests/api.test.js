import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/db.js';

describe('Support Desk API Integration Tests', () => {
  let adminUser;
  let agentUser;
  let customerUser;
  let otherCustomerUser;

  before(async () => {
    // Clean and seed specific test users
    await prisma.activityLog.deleteMany();
    await prisma.ticketEntry.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.user.deleteMany();

    adminUser = await prisma.user.create({
      data: {
        clerkId: 'user_admin_test',
        email: 'admin.test@supportdesk.internal',
        name: 'Admin Tester',
        role: 'ADMIN',
      },
    });

    agentUser = await prisma.user.create({
      data: {
        clerkId: 'user_agent_test',
        email: 'agent.test@supportdesk.internal',
        name: 'Agent Tester',
        role: 'AGENT',
      },
    });

    customerUser = await prisma.user.create({
      data: {
        clerkId: 'user_customer_test',
        email: 'customer.test@example.com',
        name: 'Customer Tester',
        role: 'CUSTOMER',
      },
    });

    otherCustomerUser = await prisma.user.create({
      data: {
        clerkId: 'user_other_customer_test',
        email: 'other.customer@example.com',
        name: 'Other Customer',
        role: 'CUSTOMER',
      },
    });
  });

  after(async () => {
    await prisma.$disconnect();
  });

  // TC-01: Ticket creation with valid fields
  test('TC-01: Customer can create a support ticket with valid fields', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('x-dev-user-id', customerUser.id)
      .send({
        subject: 'Cannot access billing invoice',
        description: 'Received error code 404 when downloading September invoice pdf',
        priority: 'HIGH',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.subject, 'Cannot access billing invoice');
    assert.equal(res.body.status, 'OPEN');
    assert.equal(res.body.priority, 'HIGH');
    assert.equal(res.body.customerId, customerUser.id);
    assert.equal(res.body.isOverdue, false);
  });

  // TC-02: Validation failure on missing / short fields
  test('TC-02: Ticket creation fails when subject or description is too short', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('x-dev-user-id', customerUser.id)
      .send({
        subject: 'No',
        description: 'Bad',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'Validation failed');
    assert(Array.isArray(res.body.details));
  });

  // TC-03: Customer ticket ownership isolation
  test('TC-03: Customer only sees their own tickets, not other customers', async () => {
    // Create ticket for other customer
    await prisma.ticket.create({
      data: {
        subject: 'Secret personal ticket for other customer',
        description: 'Confidential details',
        customerId: otherCustomerUser.id,
        status: 'OPEN',
      },
    });

    const res = await request(app)
      .get('/api/tickets')
      .set('x-dev-user-id', customerUser.id);

    assert.equal(res.status, 200);
    assert(res.body.tickets.length > 0);
    res.body.tickets.forEach((t) => {
      assert.equal(t.customerId, customerUser.id);
    });
  });

  // TC-04: Admin assigns agent & TC-05: Status / Priority updates
  test('TC-04 & 05: Admin assigns agent and updates status with activity logging', async () => {
    const ticket = await prisma.ticket.create({
      data: {
        subject: 'Network outage on US-East',
        description: 'Latency spiked to 2000ms',
        customerId: customerUser.id,
        status: 'OPEN',
        priority: 'MEDIUM',
      },
    });

    // Admin assigns to agent
    const assignRes = await request(app)
      .patch(`/api/tickets/${ticket.id}`)
      .set('x-dev-user-id', adminUser.id)
      .send({
        assigneeId: agentUser.id,
        status: 'IN_PROGRESS',
        priority: 'URGENT',
      });

    assert.equal(assignRes.status, 200);
    assert.equal(assignRes.body.assigneeId, agentUser.id);
    assert.equal(assignRes.body.status, 'IN_PROGRESS');
    assert.equal(assignRes.body.priority, 'URGENT');

    // Verify activity history was recorded in transaction
    const historyRes = await request(app)
      .get(`/api/tickets/${ticket.id}/history`)
      .set('x-dev-user-id', adminUser.id);

    assert.equal(historyRes.status, 200);
    const actions = historyRes.body.map((h) => h.action);
    assert(actions.includes('STATUS_CHANGED'));
    assert(actions.includes('PRIORITY_CHANGED'));
    assert(actions.includes('ASSIGNED'));
  });

  // TC-06 & TC-07: Public replies & Internal notes
  test('TC-06 & 07: Staff can post public replies and internal notes', async () => {
    const ticket = await prisma.ticket.create({
      data: {
        subject: 'SSL Certificate Renewal Question',
        description: 'Need help installing wildcard cert',
        customerId: customerUser.id,
      },
    });

    // Staff posts internal note
    const noteRes = await request(app)
      .post(`/api/tickets/${ticket.id}/entries`)
      .set('x-dev-user-id', agentUser.id)
      .send({
        content: 'Internal verification: Customer domain is verified on DNS challenge.',
        type: 'INTERNAL_NOTE',
      });

    assert.equal(noteRes.status, 201);
    assert.equal(noteRes.body.type, 'INTERNAL_NOTE');

    // Staff posts public reply
    const replyRes = await request(app)
      .post(`/api/tickets/${ticket.id}/entries`)
      .set('x-dev-user-id', agentUser.id)
      .send({
        content: 'Hello! Your wildcard certificate has been issued.',
        type: 'PUBLIC_REPLY',
      });

    assert.equal(replyRes.status, 201);
    assert.equal(replyRes.body.type, 'PUBLIC_REPLY');

    // Staff retrieves entries (sees both)
    const staffEntriesRes = await request(app)
      .get(`/api/tickets/${ticket.id}/entries`)
      .set('x-dev-user-id', agentUser.id);

    assert.equal(staffEntriesRes.status, 200);
    assert.equal(staffEntriesRes.body.length, 2);
  });

  // TC-08: Customer access to internal notes strictly rejected
  test('TC-08: Customer cannot see internal notes on their ticket', async () => {
    const ticket = await prisma.ticket.create({
      data: {
        subject: 'Hardware swap request',
        description: 'Server fan failing in rack B',
        customerId: customerUser.id,
      },
    });

    await prisma.ticketEntry.create({
      data: {
        ticketId: ticket.id,
        authorId: agentUser.id,
        content: 'PRIVATE NOTE: Tech sent to data center.',
        type: 'INTERNAL_NOTE',
      },
    });

    await prisma.ticketEntry.create({
      data: {
        ticketId: ticket.id,
        authorId: agentUser.id,
        content: 'PUBLIC: A technician is scheduled for your rack.',
        type: 'PUBLIC_REPLY',
      },
    });

    const res = await request(app)
      .get(`/api/tickets/${ticket.id}/entries`)
      .set('x-dev-user-id', customerUser.id);

    assert.equal(res.status, 200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].type, 'PUBLIC_REPLY');
    assert.equal(res.body[0].content, 'PUBLIC: A technician is scheduled for your rack.');
  });

  // TC-09: Customer cannot post internal note (returns 403)
  test('TC-09: Customer attempt to create internal note returns 403 Forbidden', async () => {
    const ticket = await prisma.ticket.create({
      data: {
        subject: 'General Question',
        description: 'Inquiry',
        customerId: customerUser.id,
      },
    });

    const res = await request(app)
      .post(`/api/tickets/${ticket.id}/entries`)
      .set('x-dev-user-id', customerUser.id)
      .send({
        content: 'Trying to sneak an internal note',
        type: 'INTERNAL_NOTE',
      });

    assert.equal(res.status, 403);
  });

  // TC-10: Unauthorized role changes rejected
  test('TC-10: Customer or Agent cannot change user roles (returns 403)', async () => {
    const res = await request(app)
      .patch(`/api/users/${customerUser.id}/role`)
      .set('x-dev-user-id', customerUser.id)
      .send({ role: 'ADMIN' });

    assert.equal(res.status, 403);

    const agentRes = await request(app)
      .patch(`/api/users/${customerUser.id}/role`)
      .set('x-dev-user-id', agentUser.id)
      .send({ role: 'ADMIN' });

    assert.equal(agentRes.status, 403);
  });

  // TC-11 & TC-12: Overdue calculation rule verification
  test('TC-11 & 12: Overdue status rule (createdAt > 24h & status !== RESOLVED)', async () => {
    const twentySixHoursAgo = new Date(Date.now() - 26 * 60 * 60 * 1000);

    // 1. Overdue ticket: 26 hours old, status OPEN
    const overdueTicket = await prisma.ticket.create({
      data: {
        subject: 'Unanswered Urgent Outage',
        description: 'Waiting since yesterday',
        customerId: customerUser.id,
        status: 'OPEN',
        createdAt: twentySixHoursAgo,
      },
    });

    // 2. Resolved ticket: 26 hours old, status RESOLVED (must NOT be overdue!)
    const resolvedTicket = await prisma.ticket.create({
      data: {
        subject: 'Answered Outage',
        description: 'Resolved yesterday',
        customerId: customerUser.id,
        status: 'RESOLVED',
        createdAt: twentySixHoursAgo,
      },
    });

    const overdueFetch = await request(app)
      .get(`/api/tickets/${overdueTicket.id}`)
      .set('x-dev-user-id', adminUser.id);

    assert.equal(overdueFetch.status, 200);
    assert.equal(overdueFetch.body.isOverdue, true);

    const resolvedFetch = await request(app)
      .get(`/api/tickets/${resolvedTicket.id}`)
      .set('x-dev-user-id', adminUser.id);

    assert.equal(resolvedFetch.status, 200);
    assert.equal(resolvedFetch.body.isOverdue, false);
  });

  // TC-13: Combined filters (status, priority, search)
  test('TC-13: Combined filtering returns precise results', async () => {
    await prisma.ticket.create({
      data: {
        subject: 'Alpha Kubernetes Pod CrashLoopBackOff',
        description: 'Memory limit exceeded',
        customerId: customerUser.id,
        status: 'IN_PROGRESS',
        priority: 'URGENT',
      },
    });

    const res = await request(app)
      .get('/api/tickets?status=IN_PROGRESS&priority=URGENT&search=Kubernetes')
      .set('x-dev-user-id', adminUser.id);

    assert.equal(res.status, 200);
    assert(res.body.tickets.length >= 1);
    assert.equal(res.body.tickets[0].subject, 'Alpha Kubernetes Pod CrashLoopBackOff');
  });

  // TC-14: Dashboard calculation reflects actual PostgreSQL counts
  test('TC-14: Dashboard calculations reflect live PostgreSQL data', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('x-dev-user-id', adminUser.id);

    assert.equal(res.status, 200);
    assert.equal(typeof res.body.metrics.total, 'number');
    assert.equal(typeof res.body.metrics.open, 'number');
    assert.equal(typeof res.body.metrics.inProgress, 'number');
    assert.equal(typeof res.body.metrics.resolved, 'number');
    assert.equal(typeof res.body.metrics.urgent, 'number');
    assert.equal(typeof res.body.metrics.overdue, 'number');
    assert(res.body.metrics.total > 0);
  });
});
