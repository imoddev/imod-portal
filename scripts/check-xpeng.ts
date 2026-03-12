import { config } from 'dotenv';
config({ path: '.env.local', override: true });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ 
  datasourceUrl: 'postgresql://postgres.deunlrpkfrinjsqdqvkk:hH%2FR24fxSmM%40xB%2B@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true' 
});

async function main() {
  const variants = await prisma.nevVariant.findMany({
    where: { 
      model: { 
        slug: { contains: 'xpeng' }
      }
    },
    include: { model: true },
    orderBy: [
      { model: { name: 'asc' } },
      { name: 'asc' }
    ]
  });
  
  console.log('\n✅ XPeng Data in Database:\n');
  variants.forEach(v => {
    const range = v.rangeKm || 'N/A';
    const battery = v.batteryKwh || 'N/A';
    const power = v.motorKw || 'N/A';
    const price = v.priceBaht ? `${(v.priceBaht / 1000000).toFixed(2)}M` : 'TBA';
    console.log(`${v.model.name} ${v.name}:`);
    console.log(`  📏 Range: ${range} km | 🔋 Battery: ${battery} kWh`);
    console.log(`  ⚡ Power: ${power} kW | 💰 Price: ${price} THB\n`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
