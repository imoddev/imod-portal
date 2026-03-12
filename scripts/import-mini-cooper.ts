import { config } from 'dotenv';
config({ path: '.env.local', override: true });
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const connectionString = 'postgresql://postgres.deunlrpkfrinjsqdqvkk:hH%2FR24fxSmM%40xB%2B@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const prisma = new PrismaClient({ datasourceUrl: connectionString });

interface Variant {
  variantName: string;
  price: number;
  priceWithPackage: number;
  powertrain: {
    motorType: string;
    maxPower: number;
    maxPowerUnit: string;
    maxPowerHp: number;
    maxTorque: number;
    maxTorqueUnit: string;
    drivetrain: string;
  };
  performance: {
    acceleration0to100: number;
    topSpeed: number;
    electricRange: number;
    rangeStandard: string;
  };
  battery: {
    capacity: number;
    capacityUnit: string;
    warranty: string;
  };
  charging: {
    dcChargingPower: number;
    dcChargingTime: string;
    acChargingPower: number;
    acChargingTime: string;
  };
  wheelsAndTires: {
    wheelDesign: string;
    wheelSize: string;
    tyreSize: string;
  };
  multimedia: string[];
  safety: string[];
  interior: string[];
  exterior: string[];
}

interface Model {
  modelName: string;
  modelYear: number;
  bodyType: string;
  variants: Variant[];
}

interface MiniData {
  brand: string;
  manufacturer: string;
  models: Model[];
  metadata: {
    source: string;
    effectiveDate: string;
    priceListValid: string;
    vehicleWarranty: string;
    maintenancePackage: string;
    serviceInterval: string;
    extractedDate: string;
    notes: string;
  };
}

async function main() {
  console.log('🚀 Starting MINI Cooper Import...\n');

  // Load JSON data
  const jsonPath = '/Users/imodteam/Desktop/NEV-Database/Upload/2026-02-22 Mini Cooper Boucher/merged.json';
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const data: MiniData = JSON.parse(rawData);

  console.log(`📦 Brand: ${data.brand}`);
  console.log(`🏭 Manufacturer: ${data.manufacturer}`);
  console.log(`📊 Models to import: ${data.models.length}\n`);

  // Find or create brand
  let brand = await prisma.nevBrand.findFirst({
    where: { name: data.brand }
  });

  if (!brand) {
    brand = await prisma.nevBrand.create({
      data: {
        name: data.brand,
        slug: data.brand.toLowerCase(),
        country: 'Germany',
        logoUrl: '/images/brands/mini.png',
        website: 'https://www.mini.co.th',
        isActive: true
      }
    });
    console.log(`✅ Created brand: ${brand.name}`);
  } else {
    console.log(`✓ Brand exists: ${brand.name}`);
  }

  let totalVariants = 0;

  // Import each model
  for (const modelData of data.models) {
    console.log(`\n📝 Processing: ${modelData.modelName}`);

    // Find or create model
    let model = await prisma.nevModel.findFirst({
      where: {
        name: modelData.modelName,
        brandId: brand.id
      }
    });

    if (!model) {
      const modelSlug = `mini-${modelData.modelName.toLowerCase().replace(/\s+/g, '-')}`;
      model = await prisma.nevModel.create({
        data: {
          brandId: brand.id,
          name: modelData.modelName,
          slug: modelSlug,
          fullName: `MINI ${modelData.modelName}`,
          year: modelData.modelYear,
          bodyType: modelData.bodyType,
          powertrain: 'BEV',
          assembly: 'CBU',
          madeIn: 'China',
          isActive: true,
          isNewModel: true
        }
      });
      console.log(`  ✅ Created model: ${model.name}`);
    } else {
      console.log(`  ✓ Model exists: ${model.name}`);
    }

    // Import variants
    for (const variantData of modelData.variants) {
      console.log(`    🔧 Variant: ${variantData.variantName}`);

      // Check if variant exists
      const existingVariant = await prisma.nevVariant.findFirst({
        where: {
          modelId: model.id,
          name: variantData.variantName
        }
      });

      if (existingVariant) {
        console.log(`    ⚠️  Variant already exists, skipping: ${variantData.variantName}`);
        continue;
      }

      // Prepare features JSON
      const features = {
        multimedia: variantData.multimedia,
        safety: variantData.safety,
        interior: variantData.interior,
        exterior: variantData.exterior
      };

      // Create variant with all specs
      const variantSlug = `mini-${modelData.modelName}-${variantData.variantName}`.toLowerCase().replace(/\s+/g, '-');
      const variant = await prisma.nevVariant.create({
        data: {
          modelId: model.id,
          name: variantData.variantName,
          fullName: `MINI ${modelData.modelName} ${variantData.variantName}`,
          slug: variantSlug,
          
          // Price
          priceBaht: variantData.price,
          priceNote: `MSI Package: ${variantData.priceWithPackage.toLocaleString()} THB`,
          
          // Battery
          batteryKwh: variantData.battery.capacity,
          rangeKm: variantData.performance.electricRange,
          rangeStandard: variantData.performance.rangeStandard,
          
          // Motor & Performance
          motorCount: 1,
          motorKw: variantData.powertrain.maxPower,
          motorHp: variantData.powertrain.maxPowerHp,
          torqueNm: variantData.powertrain.maxTorque,
          topSpeedKmh: variantData.performance.topSpeed,
          accel0100: variantData.performance.acceleration0to100,
          drivetrain: variantData.powertrain.drivetrain,
          
          // Charging
          dcChargeKw: variantData.charging.dcChargingPower,
          dcChargeMin: parseInt(variantData.charging.dcChargingTime.split(' ')[0]), // Extract minutes
          acChargeKw: variantData.charging.acChargingPower,
          chargePort: 'CCS2',
          
          // Warranty
          warrantyVehicle: data.metadata.vehicleWarranty,
          warrantyBattery: variantData.battery.warranty,
          
          // Features
          features: JSON.stringify(features),
          
          // V2L
          hasV2l: false,
          hasV2g: false,
          
          // Status
          isActive: true,
          isBestSeller: false,
          
          // Data source
          dataSource: 'brochure',
          lastVerified: new Date()
        }
      });

      console.log(`    ✅ Imported: ${variant.name} (${variant.priceBaht?.toLocaleString()} THB)`);
      totalVariants++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Import complete!`);
  console.log(`📊 Total models: ${data.models.length}`);
  console.log(`📊 Total variants imported: ${totalVariants}`);
  console.log('='.repeat(60) + '\n');

  // Generate summary
  console.log('📋 Summary by model:');
  for (const modelData of data.models) {
    console.log(`\n  ${modelData.modelName}:`);
    for (const variant of modelData.variants) {
      console.log(`    - ${variant.variantName}`);
      console.log(`      💰 ${variant.price.toLocaleString()} THB`);
      console.log(`      🔋 ${variant.battery.capacity} kWh`);
      console.log(`      📏 ${variant.performance.electricRange} km`);
      console.log(`      ⚡ ${variant.powertrain.maxPowerHp} hp / ${variant.powertrain.maxTorque} Nm`);
      console.log(`      🏁 0-100: ${variant.performance.acceleration0to100}s | Top: ${variant.performance.topSpeed} km/h`);
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
