import { prisma } from '../config/db.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

export async function getCurrentUser(user) {
  return prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      clerkId: true,
      email: true,
      name: true,
      role: true,
      company: true,
      phone: true,
      onboarded: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateProfile(identifier, { name, company, phone }) {
  const data = {
    onboarded: true,
  };
  // Security rule: Never allow role modification via public profile setup
  if (name && typeof name === 'string') data.name = name.trim();
  if (company !== undefined) data.company = company ? String(company).trim() : null;
  if (phone !== undefined) data.phone = phone ? String(phone).trim() : null;

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { id: identifier },
        { clerkId: identifier },
      ],
    },
  });

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data,
      select: {
        id: true,
        clerkId: true,
        name: true,
        email: true,
        role: true,
        company: true,
        phone: true,
        onboarded: true,
        updatedAt: true,
      },
    });
  }

  // Create record if not yet created
  return prisma.user.create({
    data: {
      clerkId: identifier,
      email: `${identifier}@customer.deskflow.io`,
      name: data.name || 'Customer',
      role: 'CUSTOMER',
      company: data.company,
      phone: data.phone,
      onboarded: true,
    },
    select: {
      id: true,
      clerkId: true,
      name: true,
      email: true,
      role: true,
      company: true,
      phone: true,
      onboarded: true,
      updatedAt: true,
    },
  });
}

export async function createAgent(data) {
  const { name, email, role = 'AGENT', phone, company, password } = data;

  const cleanEmail = email.toLowerCase().trim();
  const existing = await prisma.user.findFirst({
    where: { email: { equals: cleanEmail, mode: 'insensitive' } },
  });

  if (existing) {
    const error = new Error(`User with email "${cleanEmail}" already exists`);
    error.status = 409;
    throw error;
  }

  const baseId = cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '_');
  const clerkId = `user_staff_${baseId}_${Date.now()}`;
  const hashedPassword = password ? hashPassword(password) : hashPassword('Staff@123');

  return prisma.user.create({
    data: {
      clerkId,
      email: cleanEmail,
      name: name.trim(),
      role: role === 'ADMIN' ? 'ADMIN' : 'AGENT',
      password: hashedPassword,
      phone: phone ? String(phone).trim() : null,
      company: company ? String(company).trim() : 'DeskFlow Support',
      onboarded: true,
    },
    select: {
      id: true,
      clerkId: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      company: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function staffLogin({ identifier, password, requiredRole }) {
  if (!identifier) {
    const error = new Error('Email or username is required');
    error.status = 400;
    throw error;
  }

  const clean = String(identifier).trim().toLowerCase();

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: clean, mode: 'insensitive' } },
        { clerkId: { equals: clean, mode: 'insensitive' } },
      ],
    },
  });

  if (!user) {
    const error = new Error('No staff account found for this email');
    error.status = 404;
    throw error;
  }

  if (user.role === 'CUSTOMER') {
    const error = new Error('This account is registered as a customer. Please use the customer portal.');
    error.status = 403;
    throw error;
  }

  if (requiredRole && requiredRole === 'ADMIN' && user.role !== 'ADMIN') {
    const error = new Error('Access denied: Administrator privileges required.');
    error.status = 403;
    throw error;
  }

  // Password verification
  if (user.password && password) {
    const valid = verifyPassword(password, user.password);
    if (!valid) {
      const error = new Error('Invalid password for staff account.');
      error.status = 401;
      throw error;
    }
  } else if (!user.password && password) {
    // If user has no password set yet (e.g. initial seed user), save it now
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashPassword(password) },
    });
  }

  return {
    id: user.id,
    clerkId: user.clerkId,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    company: user.company,
  };
}

export async function listAgents() {
  return prisma.user.findMany({
    where: {
      role: { in: ['AGENT', 'ADMIN'] },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { name: 'asc' },
  });
}

export async function listUsers({ search, role }) {
  const where = {};
  if (role && ['CUSTOMER', 'AGENT', 'ADMIN'].includes(role)) {
    where.role = role;
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  return prisma.user.findMany({
    where,
    select: {
      id: true,
      clerkId: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          customerTickets: true,
          assignedTickets: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateUserRole(userId, newRole) {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existing) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  return prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    select: {
      id: true,
      clerkId: true,
      name: true,
      email: true,
      role: true,
      updatedAt: true,
    },
  });
}
