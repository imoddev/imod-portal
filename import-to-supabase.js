const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.deunlrpkfrinjsqdqvkk:hH%2FR24fxSmM%40xB%2B@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres'
    }
  },
  log: ['error', 'warn']
});

async function main() {
  console.log('📖 Reading data...');
  const data = JSON.parse(fs.readFileSync('data/nev-import.json', 'utf-8'));
  
  console.log(`📊 Data summary:`);
  console.log(`   Brands: ${data.brands.length}`);
  console.log(`   Models: ${data.models.length}`);
  console.log(`   Variants: ${data.variants.length}`);
  
  console.log('\n🚀 Starting import...\n');
  
  // Import brands
  console.log('1️⃣ Importing brands...');
  const brandMap = new Map();
  for (const brand of data.brands) {
    const created = await prisma.nevBrand.upsert({
      where: { slug: brand.slug },
      update: brand,
      create: brand,
    });
    brandMap.set(brand.slug, created.id);
  }
  console.log(`   ✅ ${brandMap.size} brands imported`);
  
  // Import models
  console.log('2️⃣ Importing models...');
  const modelMap = new Map();
  for (const model of data.models) {
    const brandId = brandMap.get(model.brandSlug);
    if (!brandId) continue;
    
    const { brandSlug, ...modelData } = model;
    const created = await prisma.nevModel.upsert({
      where: { slug: model.slug },
      update: { ...modelData, brandId },
      create: { ...modelData, brandId },
    });
    modelMap.set(model.slug, created.id);
  }
  console.log(`   ✅ ${modelMap.size} models imported`);
  
  // Import variants (in batches to avoid timeout)
  console.log('3️⃣ Importing variants...');
  const BATCH_SIZE = 50;
  let variantCount = 0;
  
  for (let i = 0; i < data.variants.length; i += BATCH_SIZE) {
    const batch = data.variants.slice(i, i + BATCH_SIZE);
    
    for (const variant of batch) {
      const modelId = modelMap.get(variant.modelSlug);
      if (!modelId) continue;
      
      const { modelSlug, ...variantData } = variant;
      await prisma.nevVariant.upsert({
        where: { slug: variant.slug },
        update: { ...variantData, modelId },
        create: { ...variantData, modelId },
      });
      variantCount++;
    }
    
    console.log(`   Progress: ${Math.min(i + BATCH_SIZE, data.variants.length)}/${data.variants.length}`);
  }
  
  console.log(`   ✅ ${variantCount} variants imported`);
  
  console.log('\n✅ Import completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
