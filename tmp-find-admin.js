require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const prisma = new PrismaClient({ adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })) });

(async () => {
  try {
    const user = await prisma.user.findUnique({ where: { email: 'admin@vistral.in' } });
    console.log('user', user ? { id: user.id, email: user.email, role: user.role, emailVerified: user.emailVerified } : null);
    const account = await prisma.account.findFirst({ where: { providerId: 'credential', accountId: 'admin@vistral.in' } });
    console.log('account', account ? { id: account.id, providerId: account.providerId, accountId: account.accountId, password: account.password ? 'hash exists' : 'none' } : null);
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
