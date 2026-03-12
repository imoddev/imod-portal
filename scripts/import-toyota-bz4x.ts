import { config } from 'dotenv';
config({ path: '.env.local', override: true });
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const connectionString = 'postgresql://postgres.deunlrpkfrinjsqdqvkk:hH%2FR24fxSmM%40xB%2B@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const prisma = new PrismaClient({ datasourceUrl: connectionString });

interface ToyotaBZ4XData {
  model: {
    brand: string;
    model: string;
    year: number;
    market: string;
    manufacturer: string;
    tagline: string;
  };
  trims: Array<{
    name: string;
    drivetrain: string;
  }>;
  colors: {
    exterior: Array<{
      name: string;
      type: string;
    }>;
    interior: Array<{
      name: string;
    }>;
  };
  specifications: any;
  warranty: any;
  additional_info: any;
}

async function importToyotaBZ4X() {
  try {
    console.log('🚗 Starting Toyota bZ4X import...\n');

    // Load merged.json
    const dataPath = '/Users/imodteam/Desktop/NEV-Database/Upload/2026-02-21 Toyota bZ4X/merged.json';
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const data: ToyotaBZ4XData = JSON.parse(rawData);

    console.log(`📦 Loaded data for ${data.model.brand} ${data.model.model} ${data.model.year}`);
    console.log(`📍 Market: ${data.model.market}`);
    console.log(`🏭 Manufacturer: ${data.model.manufacturer}\n`);

    // Step 1: Create or get brand
    console.log('🏷️  Creating/finding brand...');
    let brand = await prisma.nevBrand.findUnique({
      where: { slug: data.model.brand.toLowerCase() },
    });

    if (!brand) {
      brand = await prisma.nevBrand.create({
        data: {
          name: data.model.brand,
          slug: data.model.brand.toLowerCase(),
          country: 'Japan',
          isActive: true,
        },
      });
      console.log(`✅ Created brand: ${brand.name}`);
    } else {
      console.log(`✅ Found existing brand: ${brand.name}`);
    }

    // Step 2: Create model
    console.log('\n🚗 Creating model...');
    const modelSlug = `${data.model.brand.toLowerCase()}-${data.model.model.toLowerCase().replace(/\s+/g, '-')}`;
    
    let model = await prisma.nevModel.findUnique({
      where: { slug: modelSlug },
    });

    if (model) {
      console.log(`⚠️  Model already exists: ${model.name}`);
      console.log(`   ID: ${model.id}`);
      console.log(`   Updating with new data...\n`);
    }

    model = await prisma.nevModel.upsert({
      where: { slug: modelSlug },
      create: {
        brandId: brand.id,
        name: data.model.model,
        slug: modelSlug,
        fullName: `${data.model.brand} ${data.model.model}`,
        year: data.model.year,
        bodyType: 'SUV',
        powertrain: 'BEV',
        overview: data.model.tagline,
        isActive: true,
      },
      update: {
        year: data.model.year,
        overview: data.model.tagline,
      },
    });

    console.log(`✅ Model ready: ${model.name} (ID: ${model.id})\n`);

    // Step 3: Create variants
    console.log('📋 Creating variants...');
    
    for (const trim of data.trims) {
      const specs = data.specifications;
      const powertrainSpec = specs.powertrain_performance[trim.name];
      
      const variantSlug = `${modelSlug}-${trim.name.toLowerCase().replace(/\s+/g, '-')}`;
      
      const variant = await prisma.nevVariant.upsert({
        where: { slug: variantSlug },
        create: {
          modelId: model.id,
          name: trim.name,
          fullName: `${data.model.brand} ${data.model.model} ${trim.name}`,
          slug: variantSlug,
          
          // Battery & Range
          batteryKwh: parseFloat(specs.battery_details.capacity.replace(' kWh', '')),
          rangeKm: powertrainSpec?.range_wltp ? parseInt(powertrainSpec.range_wltp.match(/\d+/)?.[0] || '0') : null,
          rangeStandard: 'WLTP',
          
          // Motor
          motorCount: trim.name === 'AWD' ? 2 : 1,
          motorKw: powertrainSpec?.total_power ? parseFloat(powertrainSpec.total_power.match(/[\d.]+/)?.[0] || '0') : null,
          torqueNm: powertrainSpec?.total_torque ? parseInt(powertrainSpec.total_torque.match(/\d+/)?.[0] || '0') : null,
          
          // Drivetrain
          drivetrain: trim.drivetrain,
          
          // Charging
          dcChargeKw: parseFloat(specs.ev_energy_features.charging.dc_fast_charging.max_power.replace(' kW', '')),
          acChargeKw: parseFloat(specs.ev_energy_features.charging.ac_charging.max_power.replace(' kW', '')),
          chargePort: 'CCS2',
          
          // Dimensions
          lengthMm: parseInt(specs.dimensions_weight.length.replace(' mm', '')),
          widthMm: parseInt(specs.dimensions_weight.width.replace(' mm', '')),
          heightMm: parseInt(specs.dimensions_weight.height.replace(' mm', '')),
          wheelbaseMm: parseInt(specs.dimensions_weight.wheelbase.replace(' mm', '')),
          
          // Warranty
          warrantyVehicle: data.warranty.vehicle_warranty,
          warrantyBattery: data.warranty.battery_warranty,
          
          // V2L
          hasV2l: false, // Not mentioned
          
          isActive: true,
          dataSource: 'manual',
          lastVerified: new Date(),
        },
        update: {
          batteryKwh: parseFloat(specs.battery_details.capacity.replace(' kWh', '')),
          rangeKm: powertrainSpec?.range_wltp ? parseInt(powertrainSpec.range_wltp.match(/\d+/)?.[0] || '0') : null,
          motorKw: powertrainSpec?.total_power ? parseFloat(powertrainSpec.total_power.match(/[\d.]+/)?.[0] || '0') : null,
          torqueNm: powertrainSpec?.total_torque ? parseInt(powertrainSpec.total_torque.match(/\d+/)?.[0] || '0') : null,
          lastVerified: new Date(),
        },
      });

      console.log(`  ✅ Created/updated variant: ${trim.name} (${trim.drivetrain}) - ID: ${variant.id}`);
      
      // Create detailed specs for each variant
      await createDetailedSpecs(variant.id, specs, trim.name);
    }

    console.log('\n✨ Import completed successfully!\n');
    console.log(`📊 Summary:`);
    console.log(`   - Brand: ${brand.name}`);
    console.log(`   - Model: ${model.name} ${model.year}`);
    console.log(`   - Variants: ${data.trims.length}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function createDetailedSpecs(variantId: string, specs: any, trimName: string) {
  const powertrainSpec = specs.powertrain_performance[trimName];
  
  // 1. Multimedia & Convenience
  await prisma.nevMultimedia.upsert({
    where: { variantId },
    create: {
      variantId,
      displaySize: 14,
      displayType: 'Touchscreen',
      bluetooth: true,
      appleCarPlay: true,
      androidAuto: true,
      audioSystem: trimName === 'AWD' ? 'JBL' : 'Standard',
      speakerCount: trimName === 'AWD' ? 9 : 6,
      voiceControl: true,
      navigation: true,
      usbCFront: 3,
      usbAFront: 1,
      usbCRear: 2,
      wirelessCharging: true,
      wirelessChargingWatt: 15,
      otaUpdate: true,
      keylessEntry: true,
      keylessStart: true,
      climateZones: 2,
      rearVents: true,
      ionizer: true,
      pm25Filter: true,
      pm25FilterType: 'nanoe™ X',
    },
    update: {},
  });

  // 2. Safety Systems
  await prisma.nevSafety.upsert({
    where: { variantId },
    create: {
      variantId,
      airbagsFront: 4,
      airbagsSide: 4,
      airbagsCurtain: true,
      seatbeltPretensioner: true,
      seatbeltReminderFront: true,
      seatbeltReminderRear: true,
      camera360: true,
      parkingSensorsFront: 4,
      parkingSensorsRear: 4,
      esc: true,
      tcs: true,
      ebd: true,
      hhc: true,
      avh: true,
      adaptiveCruise: true,
      autoEmergencyBrake: true,
      forwardCollisionWarn: true,
      laneDepartureWarn: true,
      laneKeepAssist: true,
      autoHighBeam: true,
      blindSpotDetection: true,
      doorOpenWarning: true,
      tpms: true,
    },
    update: {},
  });

  // 3. Interior Equipment
  await prisma.nevInterior.upsert({
    where: { variantId },
    create: {
      variantId,
      steeringMultifunction: true,
      steeringPowerAssist: 'Electric',
      hudDisplay: true,
      instrumentCluster: '7-inch TFT Color',
      rearviewMirrorAutoDim: true,
      sideMirrorsFold: true,
      sideMirrorsHeated: true,
      driverSeatPower: true,
      driverSeatAdjustments: 8,
      driverSeatMemory: true,
      ambientLighting: true,
      isofixPoints: 2,
    },
    update: {},
  });

  // 4. Exterior Equipment
  await prisma.nevExterior.upsert({
    where: { variantId },
    create: {
      variantId,
      headlightsType: 'Full LED',
      headlightsAuto: true,
      drlType: 'LED',
      taillightsType: 'Full LED',
      sunroofType: trimName === 'AWD' ? 'Panoramic' : null,
      sunroofElectric: trimName === 'AWD',
      sunroofCurtain: trimName === 'AWD',
      powerTailgate: true,
      kickSensorTailgate: true,
      sideMirrorsPower: true,
      sideMirrorsFold: true,
      sideMirrorsHeated: true,
      wipersFrontAuto: true,
      wipersRear: true,
    },
    update: {},
  });

  // 5. EV Energy Features
  await prisma.nevEVFeatures.upsert({
    where: { variantId },
    create: {
      variantId,
      rangeWLTP: powertrainSpec?.range_wltp ? parseFloat(powertrainSpec.range_wltp.match(/[\d.]+/)?.[0] || '0') : null,
      acChargeType: 'Type 2',
      acChargeMaxKw: 22,
      dcChargeType: 'CCS2',
      dcChargeMaxKw: 150,
      regenerativeBrake: true,
    },
    update: {},
  });

  // 6. Battery Details
  await prisma.nevBatteryDetails.upsert({
    where: { variantId },
    create: {
      variantId,
      batteryType: 'Lithium-ion',
      batteryKwh: 71.4,
      batteryChemistry: 'Li-ion',
    },
    update: {},
  });

  // 7. Suspension
  await prisma.nevSuspension.upsert({
    where: { variantId },
    create: {
      variantId,
      frontType: 'MacPherson Strut',
      rearType: 'Double Wishbone',
    },
    update: {},
  });

  // 8. Brake System
  await prisma.nevBrakeSystem.upsert({
    where: { variantId },
    create: {
      variantId,
      frontBrakeType: 'Ventilated disc',
      rearBrakeType: 'Disc',
    },
    update: {},
  });

  // 9. Wheels & Tires
  await prisma.nevWheelsTires.upsert({
    where: { variantId },
    create: {
      variantId,
      wheelSizeInch: 20,
      wheelMaterial: 'Alloy',
    },
    update: {},
  });

  // 10. Powertrain & Performance
  await prisma.nevPowertrain.upsert({
    where: { variantId },
    create: {
      variantId,
      drivetrain: trimName === 'AWD' ? 'AWD' : 'FWD',
      totalPowerKw: powertrainSpec?.total_power ? parseFloat(powertrainSpec.total_power.match(/[\d.]+/)?.[0] || '0') : null,
      totalTorqueNm: powertrainSpec?.total_torque ? parseFloat(powertrainSpec.total_torque.match(/\d+/)?.[0] || '0') : null,
    },
    update: {},
  });

  // 11. Dimensions & Weight
  await prisma.nevDimensions.upsert({
    where: { variantId },
    create: {
      variantId,
      seatingCapacity: 5,
      lengthMm: 4690,
      widthMm: 1860,
      heightMm: 1650,
      wheelbaseMm: 2850,
    },
    update: {},
  });
}

// Run the import
importToyotaBZ4X()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
