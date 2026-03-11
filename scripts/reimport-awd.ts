import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // ลบ AWD Performance เก่า (ถ้ามี)
  await prisma.nevVariant.deleteMany({
    where: { slug: 'byd-sealion-7-awd-performance' }
  });
  console.log('✅ Deleted old AWD Performance');
}

main().finally(() => prisma.$disconnect());
