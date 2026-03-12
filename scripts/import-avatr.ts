import { config } from 'dotenv';
config({ path: '.env.local', override: true });
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const connectionString = 'postgresql://postgres.deunlrpkfrinjsqdqvkk:hH%2FR24fxSmM%40xB%2B@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const prisma = new PrismaClient({ datasourceUrl: connectionString });

interface Variant {
  name: string;
  price: number | null;
  specs: {
    multimedia_convenience?: any;
    safety_systems?: any;
    interior_equipment?: any;
    exterior_equipment?: any;
    ev_energy_features?: any;
    battery_details?: any;
    suspension?: any;
    brake_system?: any;
    wheels_tires?: any;
    powertrain_performance?: any;
    dimensions_weight?: any;
  };
}

interface Model {
  model: string;
  variants: Variant[];
}

interface DataFile {
  brand: string;
  models: Model[];
  metadata?: any;
}

async function main() {
  console.log('🚗 AVATR Import Script Starting...\n');

  // Load merged.json
  const dataPath = '/Users/imodteam/Desktop/NEV-Database/Upload/2026-02-22 AVATR Brochure/merged.json';
  console.log(`📁 Loading data from: ${dataPath}`);
  
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const data: DataFile = JSON.parse(rawData);

  console.log(`📦 Brand: ${data.brand}`);
  console.log(`📦 Models: ${data.models.length}\n`);

  // Find or create brand
  let brand = await prisma.nevBrand.findFirst({
    where: { name: data.brand }
  });

  if (!brand) {
    console.log(`➕ Creating brand: ${data.brand}`);
    brand = await prisma.nevBrand.create({
      data: {
        name: data.brand,
        nameTh: 'อะวาทาร์',
        slug: data.brand.toLowerCase(),
        country: 'China',
        website: 'https://www.avatr.co.th',
        isActive: true
      }
    });
    console.log(`✅ Brand created: ${brand.name} (ID: ${brand.id})\n`);
  } else {
    console.log(`✅ Brand found: ${brand.name} (ID: ${brand.id})\n`);
  }

  // Process each model
  for (const modelData of data.models) {
    console.log(`\n📋 Processing Model: ${modelData.model}`);
    console.log(`   Variants: ${modelData.variants.length}`);

    // Find or create model
    const modelSlug = modelData.model.toLowerCase().replace(/\s+/g, '-');
    let model = await prisma.nevModel.findFirst({
      where: {
        OR: [
          { brandId: brand.id, name: modelData.model },
          { slug: modelSlug }
        ]
      }
    });

    if (!model) {
      console.log(`   ➕ Creating model: ${modelData.model}`);
      model = await prisma.nevModel.create({
        data: {
          brandId: brand.id,
          name: modelData.model,
          slug: modelSlug,
          year: 2024,
          bodyType: modelData.model.includes('11') ? 'SUV' : 'Crossover',
          powertrain: 'BEV',
          assembly: 'CBU',
          madeIn: 'China',
          isActive: true
        }
      });
      console.log(`   ✅ Model created (ID: ${model.id})`);
    } else {
      console.log(`   ✅ Model found (ID: ${model.id})`);
    }

    // Process each variant
    for (const variantData of modelData.variants) {
      console.log(`\n   🔧 Processing Variant: ${variantData.name}`);

      // Check if variant already exists
      const existingVariant = await prisma.nevVariant.findFirst({
        where: {
          modelId: model.id,
          name: variantData.name
        }
      });

      if (existingVariant) {
        console.log(`   ⚠️  Variant already exists, skipping: ${variantData.name}`);
        continue;
      }

      // Prepare variant data
      const specs = variantData.specs;
      
      // Extract key specs
      const dimensions = specs.dimensions_weight || {};
      const performance = specs.powertrain_performance || {};
      const battery = specs.battery_details || {};
      const evFeatures = specs.ev_energy_features || {};

      // Create variant with unique slug
      const variantSlug = `${data.brand.toLowerCase()}-${modelData.model.toLowerCase()}-${variantData.name.toLowerCase()}`
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      
      const variant = await prisma.nevVariant.create({
        data: {
          modelId: model.id,
          name: variantData.name,
          fullName: variantData.name,
          slug: variantSlug,
          priceBaht: variantData.price,
          
          // Battery & Range
          batteryKwh: battery.capacity_kwh || evFeatures.battery_capacity_kwh || null,
          rangeKm: battery.range_nedc_km || evFeatures.range_nedc_km || null,
          rangeStandard: 'NEDC',
          
          // Motor
          motorCount: performance.drivetrain === 'AWD' ? 2 : 1,
          motorKw: performance.motor_power_kw || null,
          motorHp: performance.motor_power_hp || null,
          torqueNm: performance.torque_nm || null,
          
          // Performance
          topSpeedKmh: performance.top_speed_kmh || null,
          accel0100: performance.acceleration_0_100_sec || null,
          
          // Drivetrain
          drivetrain: performance.drivetrain || null,
          
          // Charging
          dcChargeKw: evFeatures.dc_charging_kw || null,
          acChargeKw: evFeatures.ac_charging_kw || null,
          
          // Dimensions
          lengthMm: dimensions.length_mm || null,
          widthMm: dimensions.width_mm || null,
          heightMm: dimensions.height_mm || null,
          wheelbaseMm: dimensions.wheelbase_mm || null,
          groundClearanceMm: dimensions.ground_clearance_mm || null,
          curbWeightKg: dimensions.curb_weight_kg || null,
          
          // V2L
          hasV2l: evFeatures.v2l_kw ? true : false,
          v2lKw: evFeatures.v2l_kw || null,
          
          // Store full specs as JSON
          features: JSON.stringify(specs),
          
          dataSource: 'manual',
          lastVerified: new Date(),
          isActive: true
        }
      });

      console.log(`   ✅ Variant created: ${variant.name} (ID: ${variant.id})`);

      // Import detailed specs to extended tables
      await importExtendedSpecs(variant.id, specs);
    }
  }

  console.log('\n\n🎉 Import completed successfully!');
  await prisma.$disconnect();
}

async function importExtendedSpecs(variantId: string, specs: any) {
  console.log(`      📦 Importing extended specs...`);

  // 1. Multimedia & Convenience
  if (specs.multimedia_convenience) {
    const mm = specs.multimedia_convenience;
    await prisma.nevMultimedia.create({
      data: {
        variantId,
        displaySize: parseFloat(mm.center_screen?.replace(' นิ้ว', '')) || null,
        displayType: mm.infotainment || null,
        bluetooth: mm.connectivity?.includes('Bluetooth') || false,
        appleCarPlay: mm.connectivity?.includes('Apple CarPlay') || false,
        androidAuto: mm.connectivity?.includes('Android Auto') || false,
        audioSystem: mm.sound_system || null,
        speakerCount: parseInt(mm.sound_system?.match(/\d+/)?.[0] || '0') || null,
        voiceControl: mm.connectivity?.includes('สั่งการด้วยเสียง') || false,
        navigation: mm.connectivity?.includes('นำทาง') || false,
        otaUpdate: mm.connectivity?.includes('OTA') || false,
        digitalKey: mm.digital_key || false,
        wirelessCharging: mm.wireless_charging !== undefined,
        climateZones: mm.climate?.zones || null,
      }
    });
  }

  // 2. Safety Systems
  if (specs.safety_systems) {
    const sf = specs.safety_systems;
    await prisma.nevSafety.create({
      data: {
        variantId,
        airbagsFront: sf.airbags || 0,
        esc: sf.esp || false,
        tcs: sf.tcs || false,
        camera360: sf.adas_features?.some((f: string) => f.includes('360')) || false,
        adaptiveCruise: sf.adas_features?.some((f: string) => f.includes('ACC')) || false,
        autoEmergencyBrake: sf.adas_features?.some((f: string) => f.includes('AEB')) || false,
        laneDepartureWarn: sf.adas_features?.some((f: string) => f.includes('LDW')) || false,
        laneKeepAssist: sf.adas_features?.some((f: string) => f.includes('LKA') || f.includes('LCC')) || false,
        blindSpotDetection: sf.adas_features?.some((f: string) => f.includes('BSD')) || false,
        tpms: sf.tpms || false,
      }
    });
  }

  // 3. Interior Equipment
  if (specs.interior_equipment) {
    const interior = specs.interior_equipment;
    await prisma.nevInterior.create({
      data: {
        variantId,
        seatMaterial: interior.seats?.material || null,
        driverSeatPower: interior.seats?.front_seats?.adjustment?.includes('ไฟฟ้า') || false,
        driverSeatMemory: interior.seats?.front_seats?.memory || false,
        driverSeatVentilation: interior.seats?.front_seats?.heating || false,
        rearSeatFold: interior.seats?.rear_seats?.recline_fold || null,
        ambientLighting: interior.ambient_lighting !== undefined,
      }
    });
  }

  // 4. Exterior Equipment
  if (specs.exterior_equipment) {
    const ext = specs.exterior_equipment;
    await prisma.nevExterior.create({
      data: {
        variantId,
        headlightsType: ext.headlights || null,
        taillightsType: ext.taillights || null,
        sunroofType: ext.roof || null,
        doorHandlesRetractable: ext.door_handles?.includes('ซ่อน') || false,
      }
    });
  }

  // 5. EV Energy Features
  if (specs.ev_energy_features) {
    const ev = specs.ev_energy_features;
    await prisma.nevEVFeatures.create({
      data: {
        variantId,
        rangeNEDC: ev.range_nedc_km || null,
        acChargeMaxKw: ev.ac_charging_kw || null,
        dcChargeMaxKw: ev.dc_charging_kw || null,
        v2l: ev.v2l_kw ? true : false,
        regenerativeBrake: ev.regenerative_braking !== undefined,
      }
    });
  }

  // 6. Battery Details
  if (specs.battery_details) {
    const bat = specs.battery_details;
    await prisma.nevBatteryDetails.create({
      data: {
        variantId,
        batteryType: bat.type || null,
        batteryKwh: bat.capacity_kwh || null,
      }
    });
  }

  // 7. Suspension
  if (specs.suspension) {
    const susp = specs.suspension;
    await prisma.nevSuspension.create({
      data: {
        variantId,
        frontType: susp.front || null,
        rearType: susp.rear || null,
        adaptiveSuspension: susp.cdc_adaptive ? 'CDC' : null,
      }
    });
  }

  // 8. Brake System
  if (specs.brake_system) {
    const brake = specs.brake_system;
    await prisma.nevBrakeSystem.create({
      data: {
        variantId,
        frontBrakeType: brake.front || null,
        rearBrakeType: brake.rear || null,
        caliperColor: brake.caliper || null,
      }
    });
  }

  // 9. Wheels & Tires
  if (specs.wheels_tires) {
    const wheels = specs.wheels_tires;
    await prisma.nevWheelsTires.create({
      data: {
        variantId,
        wheelSizeInch: wheels.wheel_size_inch?.[0] || null,
      }
    });
  }

  // 10. Powertrain & Performance
  if (specs.powertrain_performance) {
    const pow = specs.powertrain_performance;
    await prisma.nevPowertrain.create({
      data: {
        variantId,
        drivetrain: pow.drivetrain || null,
        totalPowerKw: pow.motor_power_kw || null,
        totalTorqueNm: pow.torque_nm || null,
        accel0100: pow.acceleration_0_100_sec || null,
        topSpeedKmh: pow.top_speed_kmh || null,
      }
    });
  }

  // 11. Dimensions & Weight
  if (specs.dimensions_weight) {
    const dim = specs.dimensions_weight;
    await prisma.nevDimensions.create({
      data: {
        variantId,
        seatingCapacity: dim.seats || null,
        lengthMm: dim.length_mm || null,
        widthMm: dim.width_mm || null,
        heightMm: dim.height_mm || null,
        wheelbaseMm: dim.wheelbase_mm || null,
        groundClearanceMm: dim.ground_clearance_mm || null,
        curbWeightKg: dim.curb_weight_kg || null,
        gvwKg: dim.gross_weight_kg || null,
      }
    });
  }

  console.log(`      ✅ Extended specs imported`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });
