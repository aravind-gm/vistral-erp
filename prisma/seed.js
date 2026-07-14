const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString })),
});

async function main() {
  const { hashPassword } = await import("@better-auth/utils/password");
  const adminPassword = await hashPassword("Admin@1234");

  await prisma.company.upsert({
    where: { gstin: "33AAAAA0000A1Z5" },
    update: {},
    create: {
      name: "Vistral Textiles",
      legalName: "Vistral Textiles Private Limited",
      gstin: "33AAAAA0000A1Z5",
      pan: "AAAAA0000A",
      addressLine1: "123 Industrial Estate",
      city: "Tiruppur",
      state: "Tamil Nadu",
      pincode: "641601",
      country: "India",
      phone: "+91-421-1234567",
      email: "info@vistral.in",
      createdBy: "system",
      updatedBy: "system",
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@vistral.in" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@vistral.in",
      emailVerified: true,
      role: "OWNER",
      phone: "+91-9999999999",
      isActive: true,
      createdBy: "system",
      updatedBy: "system",
    },
  });

  const existingAccount = await prisma.account.findFirst({
    where: {
      userId: adminUser.id,
      providerId: "credential",
      accountId: adminUser.email,
    },
  });

  if (!existingAccount) {
    await prisma.account.create({
      data: {
        userId: adminUser.id,
        providerId: "credential",
        accountId: adminUser.email,
        password: adminPassword,
      },
    });
  } else if (!existingAccount.password) {
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: { password: adminPassword },
    });
  }

  console.log("Seed data inserted successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
