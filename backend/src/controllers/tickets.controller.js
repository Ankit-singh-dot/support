import * as ticketsService from '../services/tickets.service.js';

export async function createTicket(req, res, next) {
  try {
    const ticket = await ticketsService.createTicket(req.body, req.user);
    return res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
}

export async function listTickets(req, res, next) {
  try {
    const result = await ticketsService.listTickets(req.query, req.user);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getTicketById(req, res, next) {
  try {
    const ticket = await ticketsService.getTicketById(req.params.id, req.user);
    return res.json(ticket);
  } catch (err) {
    next(err);
  }
}

export async function updateTicket(req, res, next) {
  try {
    const ticket = await ticketsService.updateTicket(req.params.id, req.body, req.user);
    return res.json(ticket);
  } catch (err) {
    next(err);
  }
}
