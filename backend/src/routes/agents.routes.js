import { Router } from 'express';
import * as agentsController from '../controllers/agents.controller.js';
import { requireStaff, requireAdmin } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createAgentSchema } from '../validators/users.validator.js';

const router = Router();

router.get('/', requireStaff, agentsController.listAgents);
router.post('/', requireAdmin, validate(createAgentSchema, 'body'), agentsController.createAgent);

export default router;
