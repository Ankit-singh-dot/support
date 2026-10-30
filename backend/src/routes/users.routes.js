import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { updateRoleSchema } from '../validators/users.validator.js';

const router = Router();

router.post('/staff-login', usersController.staffLogin);
router.get('/me', requireAuth, usersController.getMe);
router.patch('/profile', requireAuth, usersController.updateProfile);
router.get('/', requireAdmin, usersController.listUsers);
router.patch('/:id/role', requireAdmin, validate(updateRoleSchema, 'body'), usersController.updateUserRole);

export default router;
