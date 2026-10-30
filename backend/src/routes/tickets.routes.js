import { Router } from 'express';
import * as ticketsController from '../controllers/tickets.controller.js';
import * as entriesController from '../controllers/entries.controller.js';
import { requireAuth, requireStaff } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  createTicketSchema,
  updateTicketSchema,
  listTicketsQuerySchema,
} from '../validators/tickets.validator.js';
import { createEntrySchema } from '../validators/entries.validator.js';

const router = Router();

// Ticket CRUD & Listing
router.get('/', requireAuth, validate(listTicketsQuerySchema, 'query'), ticketsController.listTickets);
router.post('/', requireAuth, validate(createTicketSchema, 'body'), ticketsController.createTicket);
router.get('/:id', requireAuth, ticketsController.getTicketById);
router.patch('/:id', requireStaff, validate(updateTicketSchema, 'body'), ticketsController.updateTicket);

// Ticket Entries (Conversation & Notes)
router.get('/:id/entries', requireAuth, entriesController.listEntries);
router.post('/:id/entries', requireAuth, validate(createEntrySchema, 'body'), entriesController.createEntry);

// Ticket Activity History
router.get('/:id/history', requireAuth, entriesController.getTicketHistory);

export default router;
