import { config } from 'dotenv';
config({ path: '.env.local', override: true });

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const connectionString = 'postgresql://postgres.deunlrpkfrinjsqdqvkk:hH%2FR24fxSmM%40xB%2B@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const prisma = new PrismaClient({ datasourceUrl: connectionString });

interface Variant {
  name: string;
  price_thb?: number | null;
  matte_paint_surcharge_thb?: number;
  specifications: {
    dimensions_and_weight?: any;
    powertrain_and_performance?: any;
    battery_details?: any;
    ev_energy_features?: any;
    suspension?: any;
    brake_system?: any;
    wheels_and_tires?: any;
    exterior_equipment?: any;
    interior_equipment?: any;
    multimedia_and_convenience?: any;
    safety_systems?: any;
  };
}

interface Model {
  model_name: string;
  model_year: number;
  segment: string;
  variants: Variant[];
}

interface Data {
  brand: string;
  country: string;
  last_updated: string;
  models: Model[];
}

async function main() {
  console.log('🚀 Starting Hyundai import...\n');

  const jsonPath = '/Users/imodteam/Desktop/NEV-Database/Upload/2026-02-21 Hyundai Brochure/merged.json';
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
        country: data.country,
        website: 'https://www.hyundai.com',
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
    console.log(`\n📦 Processing ${modelData.model_name}...`);

    // Find or create model
    let model = await prisma.nevModel.findFirst({
      where: {
        brandId: brand.id,
        name: modelData.model_name
      }
    });

    if (!model) {
      // Determine body type
      let bodyType = 'Sedan';
      if (modelData.segment.includes('SUV')) bodyType = 'SUV';
      else if (modelData.segment.includes('Hatchback')) bodyType = 'Hatchback';
      else if (modelData.model_name.includes('6')) bodyType = 'Sedan';
      
      const seats = 5;

      model = await prisma.nevModel.create({
        data: {
          brandId: brand.id,
          name: modelData.model_name,
          slug: `${brand.slug}-${modelData.model_name.toLowerCase().replace(/\s+/g, '-')}`,
          fullName: `${brand.name} ${modelData.model_name}`,
          year: modelData.model_year,
          bodyType: bodyType,
          seats: seats,
          powertrain: 'BEV',
          assembly: 'CBU',
          madeIn: 'South Korea',
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

      // Extract specs
      const specs = variantData.specifications;
      const battery = specs.battery_details;
      const powertrain = specs.powertrain_and_performance;
      const dimensions = specs.dimensions_and_weight;
      const evEnergy = specs.ev_energy_features;
      const brakes = specs.brake_system;
      const wheels = specs.wheels_and_tires;

      // Determine range and standard
      let rangeKm = battery?.range_wltp_km || null;
      let rangeStandard = battery?.range_wltp_km ? 'WLTP' : null;

      // Determine drivetrain
      let drivetrain = null;
      if (powertrain?.drive_type) {
        const drive = powertrain.drive_type.toUpperCase();
        if (drive.includes('AWD') || drive.includes('DUAL')) drivetrain = 'AWD';
        else if (drive.includes('RWD') || drive.includes('REAR')) drivetrain = 'RWD';
        else if (drive.includes('FWD') || drive.includes('FRONT')) drivetrain = 'FWD';
      }

      // Motor count
      let motorCount = 1;
      if (drivetrain === 'AWD' || powertrain?.drive_type?.includes('Dual')) motorCount = 2;

      // Extract motor power
      let motorKw = null;
      let motorHp = null;
      if (powertrain?.motor_power) {
        if (Array.isArray(powertrain.motor_power)) {
          // Take the highest power
          motorKw = Math.max(...powertrain.motor_power.map((p: any) => p.kw || 0));
          motorHp = Math.max(...powertrain.motor_power.map((p: any) => p.hp || 0));
        } else if (typeof powertrain.motor_power === 'object') {
          motorKw = powertrain.motor_power.kw;
          motorHp = powertrain.motor_power.hp;
        }
      } else {
        motorKw = powertrain?.motor_power_kw || null;
        motorHp = powertrain?.motor_power_hp || null;
      }

      // Extract torque
      let torqueNm = null;
      if (powertrain?.motor_torque_nm) {
        if (Array.isArray(powertrain.motor_torque_nm)) {
          torqueNm = Math.max(...powertrain.motor_torque_nm.map((t: any) => t.nm || 0));
        } else {
          torqueNm = powertrain.motor_torque_nm;
        }
      }

      // Extract acceleration
      let accel = null;
      if (powertrain?.acceleration_0_100_s) {
        if (typeof powertrain.acceleration_0_100_s === 'object') {
          // Take the fastest time
          accel = powertrain.acceleration_0_100_s.with_n_grin_boost || 
                  powertrain.acceleration_0_100_s.standard || null;
        } else {
          accel = powertrain.acceleration_0_100_s;
        }
      }

      // Extract charging info
      let dcChargeKw = null;
      if (evEnergy?.dc_charging) {
        dcChargeKw = evEnergy.dc_charging.ultra_fast_kw || evEnergy.dc_charging.standard_kw || null;
      } else {
        dcChargeKw = evEnergy?.dc_charging_max_kw || null;
      }

      // V2L
      let hasV2l = false;
      let v2lKw = null;
      if (evEnergy?.v2l) {
        hasV2l = true;
        v2lKw = (evEnergy.v2l.max_power_w || evEnergy.v2l.calculated_max_power_w || 0) / 1000;
      }

      // Create variant
      const variant = await prisma.nevVariant.create({
        data: {
          modelId: model.id,
          name: variantData.name,
          fullName: `${brand.name} ${model.name} ${variantData.name}`,
          slug: `${model.slug}-${variantData.name.toLowerCase().replace(/\s+/g, '-')}`,
          
          priceBaht: variantData.price_thb || null,
          
          batteryKwh: battery?.capacity_kwh || null,
          rangeKm: rangeKm,
          rangeStandard: rangeStandard,
          
          motorCount: motorCount,
          motorKw: motorKw,
          motorHp: motorHp,
          torqueNm: torqueNm,
          
          topSpeedKmh: powertrain?.top_speed_kmh || null,
          accel0100: accel,
          
          drivetrain: drivetrain,
          
          dcChargeKw: dcChargeKw,
          acChargeKw: evEnergy?.ac_charging_max_kw || null,
          chargePort: evEnergy?.connector || 'CCS2',
          
          hasV2l: hasV2l,
          v2lKw: v2lKw,
          
          lengthMm: dimensions?.overall_length_mm || dimensions?.length_mm || null,
          widthMm: dimensions?.overall_width_mm || dimensions?.width_mm || null,
          heightMm: dimensions?.overall_height_mm || dimensions?.height_mm || null,
          wheelbaseMm: dimensions?.wheelbase_mm || null,
          groundClearanceMm: dimensions?.ground_clearance_mm || null,
          curbWeightKg: dimensions?.kerb_weight_kg || dimensions?.curb_weight_kg || null,
          grossWeightKg: dimensions?.gross_weight_kg || null,
          trunkLitres: dimensions?.cargo_volume_liters?.rear_seats_up || 
                       dimensions?.cargo_volume_liters || null,
          
          warrantyVehicle: `${battery?.warranty_years || 5} years / ${battery?.warranty_km || 150000} km`,
          warrantyBattery: `${battery?.warranty_years || 8} years / ${battery?.warranty_km || 160000} km`,
          
          dataSource: 'brochure',
          lastVerified: new Date(),
          isActive: true
        }
      });

      console.log(`      ✅ Created variant: ${variant.name}`);
      console.log(`         🔋 Battery: ${variant.batteryKwh || 'N/A'} kWh`);
      console.log(`         📏 Range: ${variant.rangeKm || 'N/A'} km (${variant.rangeStandard || 'N/A'})`);
      console.log(`         ⚡ Motor: ${variant.motorKw || 'N/A'} kW / ${variant.motorHp || 'N/A'} HP`);
      console.log(`         🔧 Torque: ${variant.torqueNm || 'N/A'} Nm`);
      console.log(`         🏎️  0-100: ${variant.accel0100 || 'N/A'} sec`);
      console.log(`         🚗 Drive: ${variant.drivetrain || 'N/A'} (${variant.motorCount} motor${variant.motorCount > 1 ? 's' : ''})`);
      console.log(`         🔌 Charging: DC ${variant.dcChargeKw || 'N/A'} kW / AC ${variant.acChargeKw || 'N/A'} kW`);
      if (variant.hasV2l) {
        console.log(`         🔌 V2L: ${variant.v2lKw} kW`);
      }
    }
  }

  // Update brand's total models count
  const modelCount = await prisma.nevModel.count({
    where: { brandId: brand.id }
  });

  await prisma.nevBrand.update({
    where: { id: brand.id },
    data: { totalModels: modelCount }
  });

  console.log(`\n✅ Import complete! Total models: ${modelCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
