import app from './app.js';
import { env } from './config/env.js';

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Server] Support Desk Backend API listening on port ${PORT}`);
  console.log(`[Server] Environment: ${env.NODE_ENV}`);
  console.log(`[Server] Database URL configured: ${env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`);
});
