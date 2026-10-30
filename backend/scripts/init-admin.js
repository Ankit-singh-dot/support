import { prisma } from '../src/config/db.js';

async function main() {
  const email = process.argv[2] || 'admin@supportdesk.internal';
  const name = process.argv[3] || 'System Admin';

  console.log(`[Init Admin] Ensuring admin user exists for ${email}...`);

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN' },
    create: {
      clerkId: `user_admin_${Date.now()}`,
      email,
      name,
      role: 'ADMIN',
    },
  });

  console.log(`[Init Admin] Successfully provisioned admin:`);
  console.log(` - ID: ${user.id}`);
  console.log(` - Email: ${user.email}`);
  console.log(` - Role: ${user.role}`);
}

main()
  .catch((e) => {
    console.error('[Init Admin] Error provisioning admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
