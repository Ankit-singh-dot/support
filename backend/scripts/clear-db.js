import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('[ClearDB] Clearing all ticket and conversation entries from database...');

  // 1. Delete all activity logs
  const deletedLogs = await prisma.activityLog.deleteMany();
  console.log(`[ClearDB] Deleted ${deletedLogs.count} activity logs.`);

  // 2. Delete all ticket entries (replies and notes)
  const deletedEntries = await prisma.ticketEntry.deleteMany();
  console.log(`[ClearDB] Deleted ${deletedEntries.count} ticket entries.`);

  // 3. Delete all tickets
  const deletedTickets = await prisma.ticket.deleteMany();
  console.log(`[ClearDB] Deleted ${deletedTickets.count} tickets.`);

  // 4. Clean sample seed customers (Alice & Bob) while preserving Admin and real Agent accounts
  const deletedDummies = await prisma.user.deleteMany({
    where: {
      email: { in: ['alice@example.com', 'bob@example.com'] },
    },
  });
  console.log(`[ClearDB] Removed ${deletedDummies.count} sample seed customer accounts.`);

  console.log('----------------------------------------------------');
  console.log('Database successfully reset to a clean slate!');
  console.log('Tables, schema, Neon connection, and staff logins remain intact.');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('[ClearDB] Error clearing database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

