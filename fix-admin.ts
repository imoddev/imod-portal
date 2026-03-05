import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    where: {
      email: {
        in: ['admin@modmedia.asia', 'attapon.tom@gmail.com']
      }
    },
    data: {
      role: 'admin'
    }
  });
  
  console.log('Updated:', result.count, 'users');
  
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ['admin@modmedia.asia', 'attapon.tom@gmail.com']
      }
    },
    select: { email: true, role: true }
  });
  
  console.log('Users:', users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
