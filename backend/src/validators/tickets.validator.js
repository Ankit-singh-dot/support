import { z } from 'zod';

export const createTicketSchema = z.object({
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters').max(255),
  description: z.string().trim().min(5, 'Description must be at least 5 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

export const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'RESOLVED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().nullable().optional(),
  expectedAssigneeId: z.string().nullable().optional(),
  expectedUpdatedAt: z.string().optional(),
});

export const listTicketsQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'RESOLVED', 'ALL']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'ALL']).optional(),
  assigneeId: z.string().optional(),
  sortBy: z.enum(['updatedAt', 'priority', 'createdAt']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  isOverdue: z.enum(['true', 'false']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});
