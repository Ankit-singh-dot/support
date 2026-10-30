import { z } from 'zod';

export const createEntrySchema = z.object({
  content: z.string().trim().min(1, 'Content cannot be empty'),
  type: z.enum(['PUBLIC_REPLY', 'INTERNAL_NOTE']).default('PUBLIC_REPLY'),
});
