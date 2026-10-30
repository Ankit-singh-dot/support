import * as ticketsService from '../services/tickets.service.js';

export async function listEntries(req, res, next) {
  try {
    const entries = await ticketsService.listEntries(req.params.id, req.user);
    res.json(entries);
  } catch (err) {
    next(err);
  }
}

export async function createEntry(req, res, next) {
  try {
    const entry = await ticketsService.createEntry(req.params.id, req.body, req.user);
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
}

export async function getTicketHistory(req, res, next) {
  try {
    const history = await ticketsService.getTicketHistory(req.params.id, req.user);
    res.json(history);
  } catch (err) {
    next(err);
  }
}
