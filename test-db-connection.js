const { PrismaClient } = require('@prisma/client');

const connectionString = 'postgresql://postgres.deunlrpkfrinjsqdqvkk:hH%2FR24fxSmM%40xB%2B@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

const prisma = new PrismaClient({
  datasourceUrl: connectionString
});

async function test() {
  try {
    const result = await prisma.$queryRaw`SELECT COUNT(*) as total FROM "NevVariant"`;
    console.log('✅ SUCCESS! Total variants:', result[0].total);
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

test();
