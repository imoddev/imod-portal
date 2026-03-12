import { config } from 'dotenv';
config({ path: '.env.local', override: true });

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const connectionString = 'postgresql://postgres.deunlrpkfrinjsqdqvkk:hH%2FR24fxSmM%40xB%2B@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const prisma = new PrismaClient({ datasourceUrl: connectionString });

interface Variant {
  name: string;
  price: number | null;
  specs: {
    multimedia?: any;
    safety?: any;
    interior?: any;
    exterior?: any;
    ev_energy?: any;
    battery?: any;
    suspension?: any;
    brakes?: any;
    wheels_tires?: any;
    powertrain?: any;
    dimensions?: any;
  };
}

interface Model {
  model: string;
  variants: Variant[];
}

interface Data {
  brand: string;
  models: Model[];
}

async function main() {
  console.log('🚀 Starting Zeekr import...\n');

  const jsonPath = '/Users/imodteam/Desktop/NEV-Database/Upload/2026-02-22 Zeekr Brochure/merged.json';
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const data: Data = JSON.parse(rawData);

  // Find or create brand
  let brand = await prisma.nevBrand.findFirst({
    where: { name: data.brand }
  });

  if (!brand) {
    brand = await prisma.nevBrand.create({
      data: {
        name: data.brand,
        slug: data.brand.toLowerCase(),
        logoUrl: null,
        country: 'China',
        website: 'https://www.zeekrlife.com',
        totalModels: 0,
        isActive: true
      }
    });
    console.log(`✅ Created brand: ${brand.name}`);
  } else {
    console.log(`✅ Found brand: ${brand.name}`);
  }

  // Process each model
  for (const modelData of data.models) {
    console.log(`\n📦 Processing ${modelData.model}...`);

    // Find or create model
    let model = await prisma.nevModel.findFirst({
      where: {
        brandId: brand.id,
        name: modelData.model
      }
    });

    if (!model) {
      const bodyType = modelData.model.includes('009') ? 'MPV' : 'SUV';
      const seats = modelData.variants[0]?.specs?.dimensions?.seating_capacity || 
                    modelData.variants[0]?.specs?.interior?.seating_capacity || 5;

      model = await prisma.nevModel.create({
        data: {
          brandId: brand.id,
          name: modelData.model,
          slug: `${brand.slug}-${modelData.model.toLowerCase().replace(/\s+/g, '-')}`,
          fullName: `${brand.name} ${modelData.model}`,
          year: 2024,
          bodyType: bodyType,
          seats: seats,
          powertrain: 'BEV',
          assembly: 'CBU',
          madeIn: 'China',
          isActive: true
        }
      });
      console.log(`   ✅ Created model: ${model.name}`);
    } else {
      console.log(`   ✅ Found model: ${model.name}`);
    }

    // Process variants
    for (const variantData of modelData.variants) {
      console.log(`\n   🔧 Processing variant: ${variantData.name}`);

      // Check if variant exists
      const existingVariant = await prisma.nevVariant.findFirst({
        where: {
          modelId: model.id,
          name: variantData.name
        }
      });

      if (existingVariant) {
        console.log(`      ⚠️  Variant already exists, skipping...`);
        continue;
      }

      // Extract basic info
      const battery = variantData.specs.battery;
      const powertrain = variantData.specs.powertrain;
      const dimensions = variantData.specs.dimensions;
      const evEnergy = variantData.specs.ev_energy;

      // Determine range and standard
      let rangeKm = battery?.range_nedc_km || battery?.range_wltp_km || battery?.range_real_km || null;
      let rangeStandard = battery?.range_nedc_km ? 'NEDC' : 
                         battery?.range_wltp_km ? 'WLTP' : 
                         battery?.range_real_km ? 'Real-World' : null;

      // Determine drivetrain
      let drivetrain = null;
      if (powertrain?.drive_system) {
        const drive = powertrain.drive_system.toUpperCase();
        if (drive.includes('AWD') || drive.includes('ALL-WHEEL')) drivetrain = 'AWD';
        else if (drive.includes('RWD') || drive.includes('REAR')) drivetrain = 'RWD';
        else if (drive.includes('FWD') || drive.includes('FRONT')) drivetrain = 'FWD';
      }

      // Motor count
      let motorCount = 1;
      if (drivetrain === 'AWD' || variantData.name.includes('AWD')) motorCount = 2;

      // Create variant
      const variant = await prisma.nevVariant.create({
        data: {
          modelId: model.id,
          name: variantData.name,
          fullName: `${brand.name} ${model.name} ${variantData.name}`,
          slug: `${model.slug}-${variantData.name.toLowerCase().replace(/\s+/g, '-')}`,
          
          priceBaht: variantData.price,
          
          batteryKwh: battery?.capacity_kwh || battery?.useable_capacity_kwh || battery?.nominal_capacity_kwh || null,
          rangeKm: rangeKm,
          rangeStandard: rangeStandard,
          
          motorCount: motorCount,
          motorKw: powertrain?.max_power_kw || null,
          motorHp: powertrain?.max_power_hp || null,
          torqueNm: powertrain?.max_torque_nm || null,
          
          topSpeedKmh: powertrain?.top_speed_kmh || null,
          accel0100: powertrain?.acceleration_0_100_sec || null,
          
          drivetrain: drivetrain,
          
          dcChargeKw: evEnergy?.dc_charging_max_kw || null,
          acChargeKw: evEnergy?.ac_charging_kw || null,
          chargePort: evEnergy?.charge_port || 'CCS2',
          
          hasV2l: evEnergy?.v2l_kw ? true : false,
          v2lKw: evEnergy?.v2l_kw || null,
          
          lengthMm: dimensions?.length_mm || null,
          widthMm: dimensions?.width_mm || null,
          heightMm: dimensions?.height_mm || null,
          wheelbaseMm: dimensions?.wheelbase_mm || null,
          groundClearanceMm: dimensions?.ground_clearance_mm || dimensions?.ground_clearance_front_mm || null,
          curbWeightKg: dimensions?.curb_weight_kg || dimensions?.weight_unladen_kg || null,
          grossWeightKg: dimensions?.gvwr_kg || null,
          trunkLitres: dimensions?.cargo_volume_l || null,
          
          warrantyVehicle: dimensions?.warranty_vehicle || null,
          warrantyBattery: dimensions?.warranty_motor_battery || null,
          
          dataSource: 'brochure',
          lastVerified: new Date(),
          isActive: true
        }
      });

      console.log(`      ✅ Created variant: ${variant.name}`);
      console.log(`         🔋 Battery: ${variant.batteryKwh || 'N/A'} kWh (${battery?.chemistry || 'N/A'})`);
      console.log(`         📏 Range: ${variant.rangeKm || 'N/A'} km (${variant.rangeStandard || 'N/A'})`);
      console.log(`         ⚡ Motor: ${variant.motorKw || 'N/A'} kW / ${variant.motorHp || 'N/A'} HP`);
      console.log(`         🏎️  0-100: ${variant.accel0100 || 'N/A'} sec`);
      console.log(`         🚗 Drive: ${variant.drivetrain || 'N/A'} (${variant.motorCount} motor${variant.motorCount > 1 ? 's' : ''})`);
    }
  }

  console.log('\n\n🎉 Import completed successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
