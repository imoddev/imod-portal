import { config } from 'dotenv';
config({ path: '.env.local', override: true });
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const connectionString = 'postgresql://postgres.deunlrpkfrinjsqdqvkk:hH%2FR24fxSmM%40xB%2B@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const prisma = new PrismaClient({ datasourceUrl: connectionString });

interface LotusData {
  brand: string;
  country: string;
  parentCompany: string;
  importedBy: string;
  models: Array<{
    modelName: string;
    modelType: string;
    yearIntroduced: number;
    variants: Array<{
      variantName: string;
      price: number;
      priceCurrency: string;
      priceIncludes: string;
      effectiveDate: string;
      powertrain: any;
      battery: any;
      evEnergy: any;
      dimensions: any;
      wheelsAndTires: any;
      suspension: any;
      brakes: any;
      safety: any;
      interior: any;
      exterior: any;
      multimedia: any;
    }>;
  }>;
  warranty: any;
}

async function main() {
  console.log('🚀 Starting Lotus import...\n');

  // Read merged.json
  const jsonPath = '/Users/imodteam/Desktop/NEV-Database/Upload/2026-02-22 Lotus/merged.json';
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const data: LotusData = JSON.parse(rawData);

  // Find or create Brand
  let brand = await prisma.nevBrand.findFirst({
    where: { name: 'Lotus' }
  });

  if (!brand) {
    brand = await prisma.nevBrand.create({
      data: {
        name: 'Lotus',
        nameTh: 'โลตัส',
        slug: 'lotus',
        country: 'UK',
        logoUrl: '/brands/lotus.png',
        website: 'https://www.lotuscars.co.th',
        totalModels: 2
      }
    });
    console.log('✅ Created brand: Lotus');
  } else {
    console.log('✅ Found existing brand: Lotus');
  }

  // Process each model
  for (const modelData of data.models) {
    console.log(`\n📦 Processing model: ${modelData.modelName}`);

    // Find or create Model
    let model = await prisma.nevModel.findFirst({
      where: {
        brandId: brand.id,
        name: modelData.modelName
      }
    });

    if (!model) {
      model = await prisma.nevModel.create({
        data: {
          brandId: brand.id,
          name: modelData.modelName,
          nameTh: modelData.modelName, // ใช้ชื่อเดียวกันก่อน
          slug: `lotus-${modelData.modelName.toLowerCase()}`,
          fullName: `Lotus ${modelData.modelName}`,
          year: modelData.yearIntroduced,
          bodyType: modelData.modelType.includes('SUV') ? 'SUV' : 'Sedan',
          powertrain: 'BEV',
          assembly: 'CBU',
          madeIn: 'UK',
          imageUrl: `/models/lotus-${modelData.modelName.toLowerCase()}.jpg`,
          overview: `${modelData.modelType} with 800V architecture`
        }
      });
      console.log(`  ✅ Created model: ${modelData.modelName}`);
    } else {
      console.log(`  ✅ Found existing model: ${modelData.modelName}`);
    }

    // Process each variant
    for (const variantData of modelData.variants) {
      console.log(`    🔧 Processing variant: ${variantData.variantName}`);

      // Check if variant already exists
      const existingVariant = await prisma.nevVariant.findFirst({
        where: {
          modelId: model.id,
          name: variantData.variantName
        }
      });

      if (existingVariant) {
        console.log(`    ⚠️  Variant already exists: ${variantData.variantName} (skipping)`);
        continue;
      }

      // Parse dimensions
      const parseDimension = (str: string | null): number | null => {
        if (!str) return null;
        const match = str.match(/[\d,]+/);
        return match ? parseInt(match[0].replace(/,/g, '')) : null;
      };

      const parseCurbWeight = (str: string | null): number | null => {
        if (!str) return null;
        const match = str.match(/[\d,]+/);
        return match ? parseInt(match[0].replace(/,/g, '')) : null;
      };

      // Extract range from WLTP string (e.g., "600 km" -> 600)
      const parseRange = (str: string | null): number | null => {
        if (!str) return null;
        const match = str.match(/\d+/);
        return match ? parseInt(match[0]) : null;
      };

      // Create variant with all specs
      const variant = await prisma.nevVariant.create({
        data: {
          modelId: model.id,
          name: variantData.variantName.replace(/^(Eletre|Emeya)\s+/, ''),
          fullName: variantData.variantName,
          slug: `${model.slug}-${variantData.variantName.toLowerCase().replace(/\s+/g, '-')}`,
          
          // Price
          priceBaht: variantData.price,
          priceNote: `${variantData.priceIncludes} - Effective ${variantData.effectiveDate}`,
          
          // Battery & Range
          batteryKwh: parseFloat(variantData.battery.capacity),
          rangeKm: parseRange(variantData.evEnergy.wltpRange),
          rangeStandard: 'WLTP',
          
          // Motor
          motorCount: variantData.powertrain.motorConfiguration.includes('Dual') ? 2 : 1,
          motorKw: variantData.powertrain.maxPowerKW,
          motorHp: parseInt(variantData.powertrain.maxPower),
          torqueNm: parseInt(variantData.powertrain.maxTorque),
          
          // Performance
          topSpeedKmh: parseInt(variantData.powertrain.topSpeed),
          accel0100: parseFloat(variantData.powertrain.acceleration0to100),
          
          // Drivetrain
          drivetrain: 'AWD',
          
          // Charging
          dcChargeKw: parseFloat(variantData.evEnergy.maxDCChargingPower),
          dcChargeMin: parseInt(variantData.evEnergy.dcChargingTime10to80),
          acChargeKw: parseFloat(variantData.evEnergy.acChargerOnboard),
          chargePort: 'CCS2',
          
          // Dimensions
          lengthMm: parseDimension(variantData.dimensions.length),
          widthMm: parseDimension(variantData.dimensions.width),
          heightMm: parseDimension(variantData.dimensions.height),
          wheelbaseMm: parseDimension(variantData.dimensions.wheelbase),
          groundClearanceMm: parseDimension(variantData.dimensions.groundClearance?.split('-')[0]),
          curbWeightKg: parseCurbWeight(variantData.dimensions.curbWeight),
          trunkLitres: parseInt(variantData.dimensions.rearTrunkCapacity5Seats || variantData.dimensions.rearTrunkCapacity4Seats || '0'),
          
          // Warranty
          warrantyVehicle: '5 years or 160,000 km',
          warrantyBattery: variantData.battery.warranty,
          
          // Features (JSON)
          features: JSON.stringify({
            powertrain: variantData.powertrain,
            battery: variantData.battery,
            evEnergy: variantData.evEnergy,
            wheelsAndTires: variantData.wheelsAndTires,
            suspension: variantData.suspension,
            brakes: variantData.brakes,
            safety: variantData.safety,
            interior: variantData.interior,
            exterior: variantData.exterior,
            multimedia: variantData.multimedia
          }),
          
          // V2L
          hasV2l: variantData.evEnergy.v2l !== null,
          
          // Status
          isActive: true,
          dataSource: 'manual',
          lastVerified: new Date()
        }
      });

      console.log(`    ✅ Created variant: ${variantData.variantName} (ID: ${variant.id})`);
    }
  }

  console.log('\n🎉 Lotus import completed!\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
