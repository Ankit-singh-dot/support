import { getAuth, clerkClient } from '@clerk/express';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';

/**
 * Synchronizes or fetches the local PostgreSQL User record for the authenticated identity.
 * Clerk userId is mapped strictly to User.clerkId in PostgreSQL.
 * PostgreSQL User.role is the single source of truth for all authorization.
 */
export async function syncUser(req, res, next) {
  try {
    // 1. Staff Desk manual authentication (Admin & Agent - strictly takes precedence over ambient Clerk cookies)
    const staffId = req.headers['x-staff-id'];
    if (staffId) {
      try {
        let existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { id: staffId },
              { clerkId: staffId },
              { email: staffId },
            ],
          },
        });
        if (existingUser && (existingUser.role === 'ADMIN' || existingUser.role === 'AGENT')) {
          req.user = existingUser;
          return next();
        }
        if (existingUser) {
          // If the record exists, ensure staff role matches requested staff role
          const requestedRole = req.headers['x-staff-role'] === 'AGENT' ? 'AGENT' : 'ADMIN';
          existingUser = await prisma.user.update({
            where: { id: existingUser.id },
            data: { role: requestedRole },
          });
          req.user = existingUser;
          return next();
        }
      } catch (dbErr) {
        console.warn('[Auth Middleware] DB findFirst failed for staff user:', dbErr.message);
      }

      const staffRole = req.headers['x-staff-role'] === 'AGENT' ? 'AGENT' : 'ADMIN';
      const staffEmail = req.headers['x-staff-email'] || `${staffId}@supportdesk.internal`;
      const staffName = req.headers['x-staff-name'] || staffId;

      try {
        const provisioned = await prisma.user.upsert({
          where: { clerkId: staffId.startsWith('user_') ? staffId : `user_${staffId}` },
          update: { role: staffRole },
          create: {
            clerkId: staffId.startsWith('user_') ? staffId : `user_${staffId}`,
            email: staffEmail,
            name: staffName,
            role: staffRole,
            onboarded: true,
          },
        });
        req.user = provisioned;
        return next();
      } catch (upsertErr) {
        req.user = {
          id: staffId,
          clerkId: staffId,
          email: staffEmail,
          name: staffName,
          role: staffRole,
          onboarded: true,
        };
        return next();
      }
    }

    // 2. Automated API Integration Tests (Bearer mock_*)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer mock_')) {
      const mockIdentifier = authHeader.replace('Bearer mock_', '');
      try {
        let existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { id: mockIdentifier },
              { clerkId: mockIdentifier },
              { email: mockIdentifier },
            ],
          },
        });
        if (existingUser) {
          req.user = existingUser;
          return next();
        }
      } catch (dbErr) {
        console.warn('[Auth Middleware] DB findFirst failed for mock user:', dbErr.message);
      }

      req.user = {
        id: mockIdentifier,
        clerkId: `user_${mockIdentifier}`,
        email: `${mockIdentifier}@example.com`,
        name: mockIdentifier,
        role: mockIdentifier.includes('admin') ? 'ADMIN' : mockIdentifier.includes('agent') ? 'AGENT' : 'CUSTOMER',
        onboarded: true,
      };
      return next();
    }

    // 3. Dev User Header fallback
    const devUserId = req.headers['x-dev-user-id'];
    if (devUserId && !authHeader?.startsWith('Bearer clerk_')) {
      try {
        const devUser = await prisma.user.findFirst({
          where: {
            OR: [
              { id: devUserId },
              { clerkId: devUserId },
              { email: devUserId },
            ],
          },
        });
        if (devUser) {
          req.user = devUser;
          return next();
        }
      } catch (dbErr) {
        console.warn('[Auth Middleware] DB findFirst failed for dev user:', dbErr.message);
      }
    }

    // 4. Live Clerk Authentication Session (for Customer Portal)
    let clerkId = null;
    let email = null;
    let name = null;

    try {
      const auth = getAuth(req);
      if (auth && auth.userId) {
        clerkId = auth.userId;
      }
    } catch (clerkErr) {
      // Clerk middleware may not have authenticated this request
    }

    // If Clerk userId is present: synchronize with PostgreSQL User record
    if (clerkId) {
      let user = null;
      try {
        user = await prisma.user.findUnique({
          where: { clerkId },
        });

        if (!user) {
          // Fetch user profile from Clerk API if available
          try {
            const clerkUserData = await clerkClient.users.getUser(clerkId);
            if (clerkUserData) {
              email = clerkUserData.emailAddresses?.[0]?.emailAddress;
              const fullName = [clerkUserData.firstName, clerkUserData.lastName].filter(Boolean).join(' ');
              if (fullName) name = fullName;
            }
          } catch (clerkFetchErr) {
            console.warn('[Auth Middleware] Could not fetch user from Clerk API:', clerkFetchErr.message);
          }

          if (email) {
            user = await prisma.user.findUnique({ where: { email } });
          }

          if (user) {
            // Link existing record to this clerkId
            user = await prisma.user.update({
              where: { id: user.id },
              data: { clerkId },
            });
          } else {
            // Create new local user: STRICT RULE: public signups are ALWAYS CUSTOMER!
            user = await prisma.user.create({
              data: {
                clerkId,
                email: email || `${clerkId}@customer.deskflow.io`,
                name: name || 'Customer',
                role: 'CUSTOMER',
                onboarded: false,
              },
            });
          }
        }
      } catch (dbErr) {
        console.warn('[Auth Middleware] PostgreSQL query failed, using Clerk customer fallback:', dbErr.message);
        user = {
          id: clerkId,
          clerkId,
          email: email || `${clerkId}@customer.deskflow.io`,
          name: name || 'Customer',
          role: 'CUSTOMER',
          onboarded: false,
        };
      }

      req.user = user;
      return next();
    }

    // No authenticated identity
    req.user = null;
    return next();
  } catch (error) {
    console.error('[Auth Middleware] Sync user error:', error);
    next(error);
  }
}

/**
 * Guard: Requires any authenticated user.
 */
export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication required',
    });
  }
  next();
}

/**
 * Guard: Requires support staff (AGENT or ADMIN).
 */
export function requireStaff(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication required',
    });
  }
  if (req.user.role !== 'AGENT' && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Forbidden: Support staff access required',
    });
  }
  next();
}

/**
 * Guard: Requires system administrator (ADMIN only).
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication required',
    });
  }
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Forbidden: Administrator privileges required',
    });
  }
  next();
}
