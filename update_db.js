const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDb() {
  const result = await prisma.user.updateMany({
    where: {
      role: 'faculty'
    },
    data: {
      role: 'admin'
    }
  });
  console.log(`Updated ${result.count} users in database from faculty to admin.`);
}

updateDb()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
