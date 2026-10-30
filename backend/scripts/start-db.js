import { prisma } from '../src/config/db.js';

async function main() {
  console.log('[Database] Neon PostgreSQL is configured as the active primary database.');
  try {
    console.log('[Database] Checking connection to Neon...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('[Database] Neon PostgreSQL database is connected and ready!');
  } catch (err) {
    console.error('[Database] Error connecting to Neon database:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
