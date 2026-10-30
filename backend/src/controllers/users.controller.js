import * as usersService from '../services/users.service.js';

export async function getMe(req, res, next) {
  try {
    if (req.user?.id) {
      const user = await usersService.getCurrentUser(req.user);
      if (user) return res.json(user);
    }
    res.json(req.user || {
      id: 'user_fallback',
      name: 'User',
      email: 'user@example.com',
      role: 'CUSTOMER',
      onboarded: false,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, company, phone } = req.body;
    const userId = req.user?.id || req.user?.clerkId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User session required' });
    }

    const updated = await usersService.updateProfile(userId, {
      name,
      company,
      phone,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req, res, next) {
  try {
    const { search, role } = req.query;
    const users = await usersService.listUsers({ search, role });
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const updated = await usersService.updateUserRole(id, role);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function staffLogin(req, res, next) {
  try {
    const { identifier, email, password, requiredRole } = req.body;
    const user = await usersService.staffLogin({
      identifier: identifier || email,
      password,
      requiredRole,
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
}
