import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.orderCallback.deleteMany();
  console.log('Deleted callbacks');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
