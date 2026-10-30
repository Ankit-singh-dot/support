import { z } from 'zod';

export const updateRoleSchema = z.object({
  role: z.enum(['CUSTOMER', 'AGENT', 'ADMIN'], {
    errorMap: () => ({ message: 'Role must be CUSTOMER, AGENT, or ADMIN' }),
  }),
});

export const createAgentSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address'),
  role: z.enum(['AGENT', 'ADMIN']).default('AGENT'),
  password: z.string().min(4, 'Password must be at least 4 characters').optional(),
  phone: z.string().trim().optional().nullable(),
  company: z.string().trim().optional().nullable(),
});
