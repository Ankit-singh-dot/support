import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Seeding database...');

  // Clean existing data
  await prisma.activityLog.deleteMany();
  await prisma.ticketEntry.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const admin = await prisma.user.create({
    data: {
      clerkId: 'user_admin_seed',
      email: 'admin@supportdesk.internal',
      name: 'System Admin',
      role: 'ADMIN',
    },
  });

  const agent = await prisma.user.create({
    data: {
      clerkId: 'user_agent_seed',
      email: 'jane.support@supportdesk.internal',
      name: 'Jane Agent',
      role: 'AGENT',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      clerkId: 'user_alice_seed',
      email: 'alice@example.com',
      name: 'Alice Cooper',
      role: 'CUSTOMER',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      clerkId: 'user_bob_seed',
      email: 'bob@example.com',
      name: 'Bob Vance',
      role: 'CUSTOMER',
    },
  });

  console.log(`[Seed] Created 4 users (1 Admin, 1 Agent, 2 Customers).`);

  const now = new Date();
  const thirtyHoursAgo = new Date(now.getTime() - 30 * 60 * 60 * 1000);
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  // Ticket 1: Active In Progress ticket with entries and activity
  const ticket1 = await prisma.ticket.create({
    data: {
      subject: 'SSO Login fails with SAML response 403',
      description: 'Our enterprise SAML integration stopped authenticating users this morning. Getting code 403.',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      customerId: customer1.id,
      assigneeId: agent.id,
      createdAt: twoHoursAgo,
      updatedAt: now,
    },
  });

  await prisma.ticketEntry.create({
    data: {
      ticketId: ticket1.id,
      authorId: customer1.id,
      content: 'Here is the SAML response payload showing the expired certificate assertion.',
      type: 'PUBLIC_REPLY',
      createdAt: new Date(twoHoursAgo.getTime() + 10 * 60 * 1000),
    },
  });

  await prisma.ticketEntry.create({
    data: {
      ticketId: ticket1.id,
      authorId: agent.id,
      content: 'Checking internal certificate store. The IdP signing cert expired at midnight UTC.',
      type: 'INTERNAL_NOTE',
      createdAt: new Date(twoHoursAgo.getTime() + 25 * 60 * 1000),
    },
  });

  await prisma.ticketEntry.create({
    data: {
      ticketId: ticket1.id,
      authorId: agent.id,
      content: 'Hello Alice, we identified an expired IdP cert assertion and are refreshing the trusted keys now.',
      type: 'PUBLIC_REPLY',
      createdAt: new Date(twoHoursAgo.getTime() + 35 * 60 * 1000),
    },
  });

  await prisma.activityLog.createMany({
    data: [
      {
        ticketId: ticket1.id,
        actorId: customer1.id,
        action: 'TICKET_CREATED',
        newValue: 'OPEN',
        createdAt: twoHoursAgo,
      },
      {
        ticketId: ticket1.id,
        actorId: admin.id,
        action: 'ASSIGNED',
        oldValue: 'Unassigned',
        newValue: agent.name,
        createdAt: new Date(twoHoursAgo.getTime() + 15 * 60 * 1000),
      },
      {
        ticketId: ticket1.id,
        actorId: agent.id,
        action: 'STATUS_CHANGED',
        oldValue: 'OPEN',
        newValue: 'IN_PROGRESS',
        createdAt: new Date(twoHoursAgo.getTime() + 20 * 60 * 1000),
      },
    ],
  });

  // Ticket 2: Overdue ticket (created 30 hours ago, OPEN, unassigned)
  const ticket2 = await prisma.ticket.create({
    data: {
      subject: 'Invoice billing mismatch for Q3 licenses',
      description: 'We were billed for 50 seat licenses instead of the agreed 40 seat enterprise tier.',
      status: 'OPEN',
      priority: 'HIGH',
      customerId: customer1.id,
      assigneeId: null,
      createdAt: thirtyHoursAgo,
      updatedAt: thirtyHoursAgo,
    },
  });

  await prisma.activityLog.create({
    data: {
      ticketId: ticket2.id,
      actorId: customer1.id,
      action: 'TICKET_CREATED',
      newValue: 'OPEN',
      createdAt: thirtyHoursAgo,
    },
  });

  // Ticket 3: Resolved ticket (created 48 hours ago, must NOT be overdue)
  const ticket3 = await prisma.ticket.create({
    data: {
      subject: 'Request for webhook secret reset',
      description: 'Need our production webhook signing secret regenerated after security rotation.',
      status: 'RESOLVED',
      priority: 'MEDIUM',
      customerId: customer2.id,
      assigneeId: agent.id,
      createdAt: fortyEightHoursAgo,
      updatedAt: new Date(fortyEightHoursAgo.getTime() + 4 * 60 * 60 * 1000),
    },
  });

  await prisma.ticketEntry.create({
    data: {
      ticketId: ticket3.id,
      authorId: agent.id,
      content: 'Your webhook secret has been reissued. Check your secure dashboard credentials tab.',
      type: 'PUBLIC_REPLY',
      createdAt: new Date(fortyEightHoursAgo.getTime() + 3 * 60 * 60 * 1000),
    },
  });

  await prisma.activityLog.createMany({
    data: [
      {
        ticketId: ticket3.id,
        actorId: customer2.id,
        action: 'TICKET_CREATED',
        newValue: 'OPEN',
        createdAt: fortyEightHoursAgo,
      },
      {
        ticketId: ticket3.id,
        actorId: agent.id,
        action: 'STATUS_CHANGED',
        oldValue: 'IN_PROGRESS',
        newValue: 'RESOLVED',
        createdAt: new Date(fortyEightHoursAgo.getTime() + 4 * 60 * 60 * 1000),
      },
    ],
  });

  // Ticket 4: Waiting on Customer ticket
  const ticket4 = await prisma.ticket.create({
    data: {
      subject: 'Intermittent latency on REST API queries',
      description: 'Certain GET queries on /api/items are taking over 3 seconds.',
      status: 'WAITING_ON_CUSTOMER',
      priority: 'LOW',
      customerId: customer2.id,
      assigneeId: agent.id,
      createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
    },
  });

  console.log('[Seed] Sample tickets created:');
  console.log(` - Ticket 1: ${ticket1.id} (IN_PROGRESS, URGENT)`);
  console.log(` - Ticket 2: ${ticket2.id} (OPEN, Overdue > 24h)`);
  console.log(` - Ticket 3: ${ticket3.id} (RESOLVED, > 48h, not overdue)`);
  console.log(` - Ticket 4: ${ticket4.id} (WAITING_ON_CUSTOMER)`);
  console.log('[Seed] Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('[Seed] Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
