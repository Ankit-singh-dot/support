import { prisma } from '../config/db.js';
import { enrichTicket } from './tickets.service.js';

export async function getDashboardMetrics(currentUser) {
  const whereScope = {};

  if (currentUser.role === 'CUSTOMER') {
    whereScope.customerId = currentUser.id;
  } else if (currentUser.role === 'AGENT') {
    // Agents strictly view metrics and tickets assigned to them by Admin
    whereScope.assigneeId = currentUser.id;
  }

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    total,
    open,
    inProgress,
    waitingOnCustomer,
    resolved,
    lowPriority,
    mediumPriority,
    highPriority,
    urgent,
    overdue,
    recentTickets,
    ticketsTimeline,
  ] = await Promise.all([
    // Total tickets
    prisma.ticket.count({ where: whereScope }),

    // Open tickets
    prisma.ticket.count({
      where: { ...whereScope, status: 'OPEN' },
    }),

    // In-progress tickets
    prisma.ticket.count({
      where: { ...whereScope, status: 'IN_PROGRESS' },
    }),

    // Waiting on customer
    prisma.ticket.count({
      where: { ...whereScope, status: 'WAITING_ON_CUSTOMER' },
    }),

    // Resolved tickets
    prisma.ticket.count({
      where: { ...whereScope, status: 'RESOLVED' },
    }),

    // Low priority
    prisma.ticket.count({
      where: { ...whereScope, priority: 'LOW' },
    }),

    // Medium priority
    prisma.ticket.count({
      where: { ...whereScope, priority: 'MEDIUM' },
    }),

    // High priority
    prisma.ticket.count({
      where: { ...whereScope, priority: 'HIGH' },
    }),

    // Urgent tickets
    prisma.ticket.count({
      where: { ...whereScope, priority: 'URGENT' },
    }),

    // Overdue tickets rule: status !== RESOLVED && createdAt < currentTime - 24 hours
    prisma.ticket.count({
      where: {
        ...whereScope,
        status: { not: 'RESOLVED' },
        createdAt: { lt: twentyFourHoursAgo },
      },
    }),

    // Recent 5 tickets
    prisma.ticket.findMany({
      where: whereScope,
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    }),

    // All tickets with creation date for real-time ticket raised graphing
    prisma.ticket.findMany({
      where: whereScope,
      select: {
        id: true,
        createdAt: true,
        status: true,
        priority: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  // For Agents, also calculate their personally assigned active workload
  let myAssignedActiveCount = 0;
  if (currentUser.role === 'AGENT' || currentUser.role === 'ADMIN') {
    myAssignedActiveCount = await prisma.ticket.count({
      where: {
        assigneeId: currentUser.id,
        status: { not: 'RESOLVED' },
      },
    });
  }

  return {
    metrics: {
      total,
      open,
      inProgress,
      waitingOnCustomer,
      resolved,
      urgent,
      lowPriority,
      mediumPriority,
      highPriority,
      overdue,
      myAssignedActive: myAssignedActiveCount,
    },
    recentTickets: recentTickets.map(enrichTicket),
    ticketsTimeline,
    userRole: currentUser.role,
  };
}
