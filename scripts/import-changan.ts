import { config } from 'dotenv';
config({ path: '.env.local', override: true });
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const connectionString = 'postgresql://postgres.deunlrpkfrinjsqdqvkk:hH%2FR24fxSmM%40xB%2B@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const prisma = new PrismaClient({ datasourceUrl: connectionString });

interface Variant {
  name: string;
  specs: {
    dimensions?: any;
    powertrain?: any;
    battery?: any;
    charging?: any;
    suspension?: any;
    brakes?: any;
    wheelsAndTires?: any;
    exterior?: string[];
    interior?: string[];
    multimedia?: string[];
    safety?: string[];
  };
}

interface Model {
  modelName: string;
  slug: string;
  type: string;
  variants: Variant[];
}

interface ImportData {
  brand: string;
  models: Model[];
}

async function importChangan() {
  console.log('🚗 Starting Changan import...\n');

  // Read merged.json
  const jsonPath = '/Users/imodteam/Desktop/NEV-Database/Upload/2026-02-22 Changan Brochure/merged.json';
  const data: ImportData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  // Find or create brand
  let brand = await prisma.nevBrand.findUnique({
    where: { slug: 'changan' }
  });

  if (!brand) {
    console.log('Creating brand: Changan');
    brand = await prisma.nevBrand.create({
      data: {
        name: 'Changan',
        nameTh: 'ฉางอัน',
        slug: 'changan',
        country: 'China',
        website: 'https://www.changan.co.th',
        isActive: true
      }
    });
  }

  console.log(`✅ Brand: ${brand.name} (ID: ${brand.id})\n`);

  // Import models
  for (const modelData of data.models) {
    console.log(`📦 Processing model: ${modelData.modelName}`);

    // Find existing model by brand + name (more reliable than slug)
    let model = await prisma.nevModel.findFirst({
      where: {
        brandId: brand.id,
        name: modelData.modelName
      }
    });

    if (!model) {
      console.log(`  Creating model: ${modelData.modelName}`);
      try {
        model = await prisma.nevModel.create({
          data: {
            brandId: brand.id,
            name: modelData.modelName,
            slug: modelData.slug,
            bodyType: modelData.type,
            powertrain: modelData.type.includes('REEV') ? 'REEV' : 'BEV',
            year: 2026,
            assembly: 'CBU',
            madeIn: 'China',
            isActive: true
          }
        });
      } catch (error: any) {
        if (error.code === 'P2002') {
          // Slug conflict, try to find existing model
          console.log(`  Slug conflict detected, finding existing model...`);
          model = await prisma.nevModel.findUnique({
            where: { slug: modelData.slug }
          });
          if (!model) throw error;
        } else {
          throw error;
        }
      }
    }

    console.log(`  ✅ Model created/found (ID: ${model.id})`);

    // Import variants
    for (const variantData of modelData.variants) {
      console.log(`    🔧 Processing variant: ${variantData.name}`);

      // Check if variant exists
      let variant = await prisma.nevVariant.findFirst({
        where: {
          modelId: model.id,
          name: variantData.name
        }
      });

      const specs = variantData.specs;
      const variantSlug = `${modelData.slug}-${variantData.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')}`;
      
      const variantInput: any = {
        modelId: model.id,
        name: variantData.name,
        fullName: `${modelData.modelName} ${variantData.name}`,
        slug: variantSlug,
        
        // Battery & Range
        batteryKwh: specs.battery?.capacity || null,
        rangeKm: specs.powertrain?.rangeNEDC || null,
        rangeStandard: specs.powertrain?.rangeNEDC ? 'NEDC' : null,
        
        // Motor
        motorCount: specs.powertrain?.driveType === 'AWD' ? 2 : 1,
        motorKw: specs.powertrain?.motorPower || specs.powertrain?.combinedPower || null,
        motorHp: specs.powertrain?.motorPower ? Math.round((specs.powertrain.motorPower || specs.powertrain.combinedPower) * 1.36) : null,
        torqueNm: specs.powertrain?.motorTorque || specs.powertrain?.combinedTorque || null,
        
        // Performance
        accel0100: specs.powertrain?.acceleration0to100 || null,
        topSpeedKmh: specs.powertrain?.topSpeed || null,
        drivetrain: specs.powertrain?.driveType || null,
        
        // Charging
        acChargeKw: specs.charging?.acCharging || null,
        dcChargeKw: specs.charging?.dcCharging || null,
        dcChargeMin: specs.charging?.dcChargingTime30to80 || null,
        v2lKw: specs.charging?.v2l && typeof specs.charging.v2l === 'number' ? specs.charging.v2l : null,
        
        // Dimensions
        lengthMm: specs.dimensions?.length || null,
        widthMm: specs.dimensions?.width || null,
        heightMm: specs.dimensions?.height || null,
        wheelbaseMm: specs.dimensions?.wheelbase || null,
        groundClearanceMm: specs.dimensions?.groundClearance || null,
        curbWeightKg: specs.dimensions?.curbWeight || null,
        
        // V2L
        hasV2l: specs.charging?.v2l ? true : false,
        
        // REEV specific (if applicable)
        engineCc: specs.powertrain?.engineDisplacement || null,
        engineHp: specs.powertrain?.enginePower ? Math.round(specs.powertrain.enginePower * 1.36) : null,
        fuelTankL: specs.powertrain?.fuelTankCapacity || null,
        
        isActive: true
      };

      if (variant) {
        console.log(`    Updating existing variant...`);
        await prisma.nevVariant.update({
          where: { id: variant.id },
          data: variantInput
        });
      } else {
        console.log(`    Creating new variant...`);
        try {
          variant = await prisma.nevVariant.create({
            data: variantInput
          });
        } catch (error: any) {
          if (error.code === 'P2002') {
            // Slug conflict, try to find and update existing variant
            console.log(`    Slug conflict, finding existing variant...`);
            variant = await prisma.nevVariant.findUnique({
              where: { slug: variantSlug }
            });
            if (variant) {
              console.log(`    Updating found variant...`);
              await prisma.nevVariant.update({
                where: { id: variant.id },
                data: variantInput
              });
            } else {
              throw error;
            }
          } else {
            throw error;
          }
        }
      }

      console.log(`    ✅ Variant saved (ID: ${variant!.id})`);
    }

    console.log('');
  }

  console.log('🎉 Import completed successfully!\n');
}

importChangan()
  .catch((error) => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
