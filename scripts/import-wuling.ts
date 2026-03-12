import { config } from 'dotenv';
config({ path: '.env.local', override: true });
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const connectionString = 'postgresql://postgres.deunlrpkfrinjsqdqvkk:hH%2FR24fxSmM%40xB%2B@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const prisma = new PrismaClient({ datasourceUrl: connectionString });

interface VehicleData {
  brand: string;
  model: string;
  year: number;
  variants: Array<{
    name: string;
    price: number | null;
    specifications: {
      multimediaConvenience: any;
      safetySystems: any;
      interiorEquipment: any;
      exteriorEquipment: any;
      evEnergyFeatures: any;
      batteryDetails: any;
      suspension: any;
      brakeSystem: any;
      wheelsTires: any;
      powertrainPerformance: any;
      dimensionsWeight: any;
    };
  }>;
  metadata: {
    source: string;
    extractedDate: string;
    contact: any;
    notes: string;
  };
}

async function importWuling() {
  try {
    console.log('🚀 Starting Wuling Binguo EV import...');

    // Read merged.json
    const jsonPath = '/Users/imodteam/Desktop/NEV-Database/Upload/2026-02-21 Wuling Brochure/merged.json';
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const data: VehicleData = JSON.parse(rawData);

    console.log(`📊 Found ${data.variants.length} variants for ${data.brand} ${data.model}`);

    // Check if brand exists
    let brand = await prisma.nevBrand.findFirst({
      where: { name: data.brand }
    });

    if (!brand) {
      console.log(`✨ Creating new brand: ${data.brand}`);
      brand = await prisma.nevBrand.create({
        data: {
          name: data.brand,
          nameTh: 'วูลิ่ง',
          slug: data.brand.toLowerCase(),
          logoUrl: null,
          country: 'China',
          website: data.metadata.contact.website || null,
          isActive: true
        }
      });
    }

    console.log(`✅ Brand: ${brand.name} (ID: ${brand.id})`);

    // Check if model exists
    let model = await prisma.nevModel.findFirst({
      where: {
        brandId: brand.id,
        name: data.model
      }
    });

    if (!model) {
      console.log(`✨ Creating new model: ${data.model}`);
      model = await prisma.nevModel.create({
        data: {
          brandId: brand.id,
          name: data.model,
          nameTh: 'บิงโกะ อีวี',
          slug: `${data.brand.toLowerCase()}-${data.model.toLowerCase().replace(/\s+/g, '-')}`,
          year: data.year,
          bodyType: 'Hatchback',
          segment: 'A',
          seats: 5,
          powertrain: 'BEV',
          assembly: 'CBU',
          madeIn: 'China',
          overview: 'รถยนต์ไฟฟ้าขนาดเล็ก City Car จาก Wuling',
          isActive: true,
          isNewModel: true
        }
      });
    }

    console.log(`✅ Model: ${model.name} (ID: ${model.id})`);

    // Import each variant
    for (const variant of data.variants) {
      console.log(`\n📦 Processing variant: ${variant.name}...`);

      const specs = variant.specifications;

      // Check if variant already exists
      const existingVariant = await prisma.nevVariant.findFirst({
        where: {
          modelId: model.id,
          name: variant.name
        }
      });

      if (existingVariant) {
        console.log(`⚠️  Variant ${variant.name} already exists, updating...`);
        
        await prisma.nevVariant.update({
          where: { id: existingVariant.id },
          data: {
            priceBaht: variant.price,
            batteryKwh: specs.batteryDetails.capacity ? parseFloat(specs.batteryDetails.capacity) : null,
            rangeKm: specs.batteryDetails.rangeCLTC ? parseInt(specs.batteryDetails.rangeCLTC) : null,
            rangeStandard: 'CLTC',
            motorKw: specs.powertrainPerformance.maxPower ? parseFloat(specs.powertrainPerformance.maxPower) : null,
            torqueNm: specs.powertrainPerformance.maxTorque ? parseInt(specs.powertrainPerformance.maxTorque) : null,
            topSpeedKmh: specs.powertrainPerformance.topSpeed ? parseInt(specs.powertrainPerformance.topSpeed) : null,
            drivetrain: 'FWD',
            dcChargeKw: specs.evEnergyFeatures.dcCharging?.maxPower ? parseFloat(specs.evEnergyFeatures.dcCharging.maxPower) : null,
            acChargeKw: specs.evEnergyFeatures.acCharging?.maxPower ? parseFloat(specs.evEnergyFeatures.acCharging.maxPower) : null,
            lengthMm: specs.dimensionsWeight.length,
            widthMm: specs.dimensionsWeight.width,
            heightMm: specs.dimensionsWeight.height,
            wheelbaseMm: specs.dimensionsWeight.wheelbase,
            curbWeightKg: specs.dimensionsWeight.curbWeight,
            hasV2l: specs.evEnergyFeatures.v2l || false,
            features: JSON.stringify(specs),
            dataSource: 'brochure-pdf',
            lastVerified: new Date()
          }
        });
        
        console.log(`✅ Updated variant: ${variant.name}`);
      } else {
        const newVariant = await prisma.nevVariant.create({
          data: {
            modelId: model.id,
            name: variant.name,
            fullName: `${data.brand} ${data.model} ${variant.name}`,
            slug: `${data.brand.toLowerCase()}-${data.model.toLowerCase().replace(/\s+/g, '-')}-${variant.name.toLowerCase()}`,
            priceBaht: variant.price,
            batteryKwh: specs.batteryDetails.capacity ? parseFloat(specs.batteryDetails.capacity) : null,
            rangeKm: specs.batteryDetails.rangeCLTC ? parseInt(specs.batteryDetails.rangeCLTC) : null,
            rangeStandard: 'CLTC',
            motorCount: 1,
            motorKw: specs.powertrainPerformance.maxPower ? parseFloat(specs.powertrainPerformance.maxPower) : null,
            torqueNm: specs.powertrainPerformance.maxTorque ? parseInt(specs.powertrainPerformance.maxTorque) : null,
            topSpeedKmh: specs.powertrainPerformance.topSpeed ? parseInt(specs.powertrainPerformance.topSpeed) : null,
            drivetrain: 'FWD',
            dcChargeKw: specs.evEnergyFeatures.dcCharging?.maxPower ? parseFloat(specs.evEnergyFeatures.dcCharging.maxPower) : null,
            acChargeKw: specs.evEnergyFeatures.acCharging?.maxPower ? parseFloat(specs.evEnergyFeatures.acCharging.maxPower) : null,
            lengthMm: specs.dimensionsWeight.length,
            widthMm: specs.dimensionsWeight.width,
            heightMm: specs.dimensionsWeight.height,
            wheelbaseMm: specs.dimensionsWeight.wheelbase,
            curbWeightKg: specs.dimensionsWeight.curbWeight,
            hasV2l: specs.evEnergyFeatures.v2l || false,
            features: JSON.stringify(specs),
            isActive: true,
            dataSource: 'brochure-pdf',
            lastVerified: new Date()
          }
        });
        
        console.log(`✅ Created variant: ${newVariant.name} (ID: ${newVariant.id})`);
      }
    }

    console.log('\n🎉 Import completed successfully!');
    console.log(`\n📝 Summary:`);
    console.log(`   Brand: ${brand.name}`);
    console.log(`   Model: ${model.name} (${data.year})`);
    console.log(`   Variants: ${data.variants.length}`);
    console.log(`   Source: ${data.metadata.source}`);

  } catch (error) {
    console.error('❌ Error during import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run import
importWuling()
  .then(() => {
    console.log('\n✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
