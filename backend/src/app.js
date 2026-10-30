import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { env } from './config/env.js';
import { syncUser } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

import usersRoutes from './routes/users.routes.js';
import agentsRoutes from './routes/agents.routes.js';
import ticketsRoutes from './routes/tickets.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

export const app = express();

// Middlewares
app.use(cors({
  origin: env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(express.json());

// Clerk middleware (handles Clerk JWT session tokens when Clerk secret key is present)
if (env.CLERK_SECRET_KEY) {
  app.use(clerkMiddleware({
    secretKey: env.CLERK_SECRET_KEY,
    publishableKey: env.CLERK_PUBLISHABLE_KEY,
  }));
} else {
  // Pass-through middleware in dev/mock test environments
  app.use((req, res, next) => next());
}

// User synchronization middleware for API requests
app.use('/api', syncUser);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'support-desk-api',
  });
});

// API Routes
app.use('/api/users', usersRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 Handler for unrecognized API paths
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
