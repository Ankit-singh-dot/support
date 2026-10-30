import * as usersService from '../services/users.service.js';

export async function listAgents(req, res, next) {
  try {
    const agents = await usersService.listAgents();
    res.json(agents);
  } catch (err) {
    next(err);
  }
}

export async function createAgent(req, res, next) {
  try {
    const agent = await usersService.createAgent(req.body);
    res.status(201).json(agent);
  } catch (err) {
    next(err);
  }
}
