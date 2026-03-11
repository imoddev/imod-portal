const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.deunlrpkfrinjsqdqvkk:hH%2FR24fxSmM%40xB%2B@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres'
    }
  }
});

async function main() {
  const brands = await prisma.nevBrand.count();
  const models = await prisma.nevModel.count();
  const variants = await prisma.nevVariant.count();
  
  console.log('📊 Supabase Data:');
  console.log(`   Brands: ${brands}`);
  console.log(`   Models: ${models}`);
  console.log(`   Variants: ${variants}`);
}

main().finally(() => prisma.$disconnect());
