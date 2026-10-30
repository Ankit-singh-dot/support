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
const allowedOrigins = (env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    if (
      allowedOrigins.length === 0 ||
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.endsWith('.netlify.app') ||
      cleanOrigin.endsWith('.vercel.app') ||
      cleanOrigin.includes('localhost')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json());

// Root endpoint for deployment verification
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Support Desk Backend API is running',
    health: '/api/health',
    version: '1.0.0',
  });
});

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
