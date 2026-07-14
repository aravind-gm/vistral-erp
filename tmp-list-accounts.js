require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const prisma = new PrismaClient({ adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })) });

(async () => {
  try {
    const user = await prisma.user.findUnique({ where: { email: 'admin@vistral.in' } });
    console.log('user', user ? { id: user.id, email: user.email } : null);
    if (!user) return;
    const accounts = await prisma.account.findMany({ where: { userId: user.id } });
    console.log('accounts for user', accounts.length);
    console.log(accounts.map(a => ({ id: a.id, providerId: a.providerId, accountId: a.accountId, password: a.password ? 'hash exists' : 'none' })));
    const total = await prisma.account.count();
    console.log('total accounts', total);
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
