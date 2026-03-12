import { config } from 'dotenv';
config({ path: '.env.local', override: true });

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const connectionString = 'postgresql://postgres.deunlrpkfrinjsqdqvkk:hH%2FR24fxSmM%40xB%2B@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const prisma = new PrismaClient({ datasourceUrl: connectionString });

interface VariantSpec {
  variantName: string;
  trimLevel: string;
  specifications: any;
}

interface DenzaData {
  brand: string;
  subBrand: string;
  model: string;
  modelYear: number;
  bodyType: string;
  fuelType: string;
  country: string;
  variants: VariantSpec[];
  metadata: any;
}

async function createOrUpdateCategories(variantId: string, spec: any) {
  console.log(`   📋 Creating/updating 11 categories...`);
  
  // 1. Multimedia & Convenience
  await prisma.nevMultimedia.upsert({
    where: { variantId },
    create: {
      variantId,
      displaySize: parseFloat(spec.multimedia.mainScreenSize) || null,
      displayType: 'LCD Touchscreen',
      appleCarPlay: spec.multimedia.appleCarPlay,
      androidAuto: spec.multimedia.androidAuto,
      bluetooth: spec.multimedia.bluetooth,
      audioSystem: spec.multimedia.audioSystem,
      speakerCount: spec.multimedia.speakerCount,
      voiceControl: spec.multimedia.voiceControl,
      usbCFront: 2,
      usbAFront: 1,
      usbCRear: 4,
      powerOutlet12V: spec.multimedia['12vOutlet'],
      wirelessCharging: spec.multimedia.wirelessCharging,
      wirelessChargingWatt: spec.multimedia.wirelessChargingPowerW,
      otaUpdate: spec.multimedia.ota,
      keylessEntry: spec.multimedia.keylessEntry,
      keylessStart: spec.multimedia.keylessStart,
      nfcCard: spec.multimedia.nfcKey,
      digitalKey: spec.multimedia.digitalKey,
      climateZones: spec.climate.climateZones,
      rearVents: spec.climate.rearAcVents,
      pm25Filter: spec.climate.pm25Filter
    },
    update: {
      displaySize: parseFloat(spec.multimedia.mainScreenSize) || null,
      appleCarPlay: spec.multimedia.appleCarPlay,
      androidAuto: spec.multimedia.androidAuto,
      bluetooth: spec.multimedia.bluetooth,
      audioSystem: spec.multimedia.audioSystem,
      speakerCount: spec.multimedia.speakerCount
    }
  });
  
  // 2. Safety Systems
  await prisma.nevSafety.upsert({
    where: { variantId },
    create: {
      variantId,
      airbagsFront: 2,
      airbagsSide: 2,
      airbagsCurtain: true,
      camera360: spec.safety.camera360,
      parkingSensorsRear: spec.safety.parkingSensors.includes('Rear') ? 4 : 0,
      esc: spec.safety.esc || spec.brakes.esc,
      tcs: spec.safety.tcs || spec.brakes.tcs,
      ebd: spec.safety.ebd || spec.brakes.ebd,
      adaptiveCruise: spec.safety.acc,
      trafficSignRecog: spec.safety.tsr,
      autoEmergencyBrake: spec.safety.aeb,
      forwardCollisionWarn: spec.safety.fcw,
      laneDepartureWarn: spec.safety.ldw,
      laneKeepAssist: spec.safety.lca,
      frontCrossTrafficAlert: spec.safety.fcta,
      rearCrossTrafficAlert: spec.safety.rcta,
      rearCrossTrafficBrake: spec.safety.rctb,
      blindSpotDetection: spec.safety.blindSpotMonitoring,
      doorOpenWarning: spec.safety.dow,
      driverMonitoring: spec.safety.dms,
      tpms: spec.safety.tpms
    },
    update: {
      camera360: spec.safety.camera360,
      adaptiveCruise: spec.safety.acc,
      autoEmergencyBrake: spec.safety.aeb
    }
  });
  
  // 3. Interior Equipment
  await prisma.nevInterior.upsert({
    where: { variantId },
    create: {
      variantId,
      seatMaterial: spec.interior.seatMaterial,
      driverSeatPower: spec.interior.powerAdjustableSeats,
      driverSeatMemory: spec.interior.memorySeats,
      driverSeatVentilation: spec.interior.ventilatedSeats,
      hudDisplay: spec.multimedia.hudDisplay || false,
      instrumentCluster: spec.multimedia.instrumentClusterSize,
      ambientLighting: spec.multimedia.ambientLighting
    },
    update: {
      seatMaterial: spec.interior.seatMaterial
    }
  });
  
  // 4. Exterior Equipment
  await prisma.nevExterior.upsert({
    where: { variantId },
    create: {
      variantId,
      headlightsType: spec.exterior.ledHeadlights ? 'LED' : null,
      headlightsAuto: spec.exterior.autoHeadlights,
      headlightsFollowMeHome: spec.exterior.followMeHome,
      drlType: spec.exterior.ledDrl ? 'LED' : null,
      taillightsType: spec.exterior.ledTaillights ? 'LED' : null,
      turnSignalsSequential: spec.exterior.sequentialTurnSignals,
      sunroofType: spec.exterior.panoramicSunroof ? 'Panoramic' : null,
      sideMirrorsPower: spec.exterior.powerFoldingMirrors,
      sideMirrorsFold: spec.exterior.autoFoldingMirrors
    },
    update: {
      headlightsType: spec.exterior.ledHeadlights ? 'LED' : null
    }
  });
  
  // 5. EV Energy Features
  await prisma.nevEVFeatures.upsert({
    where: { variantId },
    create: {
      variantId,
      rangeNEDC: spec.battery.rangeNedcKm,
      chargerMode2: spec.charging.chargingMode2,
      acChargeType: 'Type 2',
      acChargeMaxKw: spec.charging.acChargingMaxKw,
      dcChargeType: spec.charging.dcChargingType,
      dcChargeMaxKw: spec.charging.dcChargingMaxKw,
      v2l: spec.charging.v2lSupport,
      regenerativeBrake: spec.charging.regenerativeBraking
    },
    update: {
      rangeNEDC: spec.battery.rangeNedcKm,
      acChargeMaxKw: spec.charging.acChargingMaxKw,
      dcChargeMaxKw: spec.charging.dcChargingMaxKw
    }
  });
  
  // 6. Battery Details
  await prisma.nevBatteryDetails.upsert({
    where: { variantId },
    create: {
      variantId,
      batteryType: spec.battery.batteryType,
      batteryKwh: spec.battery.batteryCapacityKwh,
      batteryChemistry: 'LFP'
    },
    update: {
      batteryType: spec.battery.batteryType,
      batteryKwh: spec.battery.batteryCapacityKwh
    }
  });
  
  // 7. Suspension
  await prisma.nevSuspension.upsert({
    where: { variantId },
    create: {
      variantId,
      frontType: spec.suspension.frontSuspension,
      rearType: spec.suspension.rearSuspension,
      adaptiveSuspension: spec.suspension.adaptiveSuspension
    },
    update: {
      frontType: spec.suspension.frontSuspension,
      rearType: spec.suspension.rearSuspension
    }
  });
  
  // 8. Brake System
  await prisma.nevBrakeSystem.upsert({
    where: { variantId },
    create: {
      variantId,
      frontBrakeType: spec.brakes.frontBrake,
      rearBrakeType: spec.brakes.rearBrake
    },
    update: {
      frontBrakeType: spec.brakes.frontBrake,
      rearBrakeType: spec.brakes.rearBrake
    }
  });
  
  // 9. Wheels & Tires
  await prisma.nevWheelsTires.upsert({
    where: { variantId },
    create: {
      variantId,
      wheelSizeInch: spec.wheelsAndTires.wheelSizeInch,
      tireSizeFront: spec.wheelsAndTires.tireSize,
      tireSizeRear: spec.wheelsAndTires.tireSize
    },
    update: {
      wheelSizeInch: spec.wheelsAndTires.wheelSizeInch,
      tireSizeFront: spec.wheelsAndTires.tireSize
    }
  });
  
  // 10. Powertrain & Performance
  await prisma.nevPowertrain.upsert({
    where: { variantId },
    create: {
      variantId,
      drivetrain: spec.powertrain.driveType,
      frontMotorType: spec.powertrain.motorType,
      frontMotorKw: spec.powertrain.frontMotorPowerKw,
      frontMotorNm: spec.powertrain.frontMotorTorqueNm,
      rearMotorType: spec.powertrain.rearMotorPowerKw ? spec.powertrain.motorType : null,
      rearMotorKw: spec.powertrain.rearMotorPowerKw,
      rearMotorNm: spec.powertrain.rearMotorTorqueNm,
      totalPowerKw: spec.powertrain.totalPowerKw,
      totalTorqueNm: spec.powertrain.totalTorqueNm,
      accel0100: spec.powertrain.acceleration0to100Kmh
    },
    update: {
      totalPowerKw: spec.powertrain.totalPowerKw,
      totalTorqueNm: spec.powertrain.totalTorqueNm,
      accel0100: spec.powertrain.acceleration0to100Kmh
    }
  });
  
  // 11. Dimensions & Weight
  await prisma.nevDimensions.upsert({
    where: { variantId },
    create: {
      variantId,
      seatingCapacity: spec.dimensions.seatingCapacity,
      lengthMm: spec.dimensions.lengthMm,
      widthMm: spec.dimensions.widthMm,
      heightMm: spec.dimensions.heightMm,
      wheelbaseMm: spec.dimensions.wheelbaseMm,
      turningRadiusM: spec.dimensions.turningRadiusM,
      trunkCapacityFrontL: spec.dimensions.cargoCapacityFrontL,
      trunkCapacityRearL: spec.dimensions.cargoCapacityRearL,
      curbWeightKg: spec.dimensions.curbWeightKg,
      gvwKg: spec.dimensions.gvwKg
    },
    update: {
      lengthMm: spec.dimensions.lengthMm,
      widthMm: spec.dimensions.widthMm,
      heightMm: spec.dimensions.heightMm,
      curbWeightKg: spec.dimensions.curbWeightKg
    }
  });
  
  console.log(`   ✅ All 11 categories saved`);
}

async function main() {
  console.log('🚀 Starting BYD Denza D9 import...\n');

  // Read merged.json
  const jsonPath = '/Users/imodteam/Desktop/NEV-Database/Upload/2026-02-22 BYD Denza Brochure/merged.json';
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const data: DenzaData = JSON.parse(rawData);

  console.log(`📦 Importing ${data.brand} ${data.subBrand} ${data.model} (${data.modelYear})`);
  console.log(`   Variants: ${data.variants.length}\n`);

  // 1. Find or create Brand
  let brand = await prisma.nevBrand.findFirst({
    where: { name: data.brand }
  });

  if (!brand) {
    console.log(`✨ Creating brand: ${data.brand}`);
    brand = await prisma.nevBrand.create({
      data: {
        name: data.brand,
        nameTh: data.brand === 'BYD' ? 'บีวายดี' : data.brand,
        slug: data.brand.toLowerCase(),
        country: data.country,
        logoUrl: null,
        totalModels: 0
      }
    });
  } else {
    console.log(`✅ Found existing brand: ${data.brand} (ID: ${brand.id})`);
  }

  // 2. Find or create Model
  const modelSlug = `${data.brand.toLowerCase()}-${data.model.toLowerCase().replace(/\s+/g, '-')}`;
  
  let model = await prisma.nevModel.findFirst({
    where: {
      slug: modelSlug
    }
  });

  if (!model) {
    console.log(`✨ Creating model: ${data.subBrand} ${data.model}`);
    model = await prisma.nevModel.create({
      data: {
        brandId: brand.id,
        name: data.model,
        nameTh: data.subBrand === 'Denza' ? 'เดนซ่า' : data.subBrand,
        slug: modelSlug,
        fullName: `${data.subBrand} ${data.model}`,
        year: data.modelYear,
        bodyType: data.bodyType,
        powertrain: data.fuelType,
        seats: data.variants[0]?.specifications?.dimensions?.seatingCapacity || null
      }
    });
  } else {
    console.log(`✅ Found existing model: ${data.subBrand} ${data.model} (ID: ${model.id})`);
  }

  // 3. Import each variant
  for (const variantData of data.variants) {
    console.log(`\n🔧 Processing variant: ${variantData.variantName}`);

    const spec = variantData.specifications;

    // Check if variant already exists
    let variant = await prisma.nevVariant.findFirst({
      where: {
        modelId: model.id,
        name: variantData.variantName
      }
    });

    const variantSlug = `${model.slug}-${variantData.variantName.toLowerCase().replace(/\s+/g, '-')}`;

    if (variant) {
      console.log(`   ⚠️  Variant already exists (ID: ${variant.id}), updating...`);
      
      // Update basic variant
      variant = await prisma.nevVariant.update({
        where: { id: variant.id },
        data: {
          fullName: `${data.subBrand} ${data.model} ${variantData.variantName}`,
          
          // Battery & Range
          batteryKwh: spec.battery.batteryCapacityKwh,
          rangeKm: spec.battery.rangeNedcKm,
          rangeStandard: 'NEDC',
          
          // Motor
          motorCount: spec.powertrain.rearMotorPowerKw ? 2 : 1,
          motorKw: spec.powertrain.totalPowerKw,
          torqueNm: spec.powertrain.totalTorqueNm,
          
          // Performance
          accel0100: spec.powertrain.acceleration0to100Kmh,
          
          // Drivetrain
          drivetrain: spec.powertrain.driveType,
          
          // Charging
          dcChargeKw: spec.charging.dcChargingMaxKw,
          acChargeKw: spec.charging.acChargingMaxKw,
          chargePort: 'CCS2',
          
          // Dimensions
          lengthMm: spec.dimensions.lengthMm,
          widthMm: spec.dimensions.widthMm,
          heightMm: spec.dimensions.heightMm,
          wheelbaseMm: spec.dimensions.wheelbaseMm,
          curbWeightKg: spec.dimensions.curbWeightKg,
          grossWeightKg: spec.dimensions.gvwKg,
          trunkLitres: spec.dimensions.cargoCapacityRearL,
          
          // V2L
          hasV2l: spec.charging.v2lSupport,
          
          dataSource: 'pdf-brochure',
          lastVerified: new Date()
        }
      });
      
    } else {
      console.log(`   ✨ Creating new variant...`);
      
      // Create new variant
      variant = await prisma.nevVariant.create({
        data: {
          modelId: model.id,
          name: variantData.variantName,
          fullName: `${data.subBrand} ${data.model} ${variantData.variantName}`,
          slug: variantSlug,
          
          // Battery & Range
          batteryKwh: spec.battery.batteryCapacityKwh,
          rangeKm: spec.battery.rangeNedcKm,
          rangeStandard: 'NEDC',
          
          // Motor
          motorCount: spec.powertrain.rearMotorPowerKw ? 2 : 1,
          motorKw: spec.powertrain.totalPowerKw,
          torqueNm: spec.powertrain.totalTorqueNm,
          
          // Performance
          accel0100: spec.powertrain.acceleration0to100Kmh,
          
          // Drivetrain
          drivetrain: spec.powertrain.driveType,
          
          // Charging
          dcChargeKw: spec.charging.dcChargingMaxKw,
          acChargeKw: spec.charging.acChargingMaxKw,
          chargePort: 'CCS2',
          
          // Dimensions
          lengthMm: spec.dimensions.lengthMm,
          widthMm: spec.dimensions.widthMm,
          heightMm: spec.dimensions.heightMm,
          wheelbaseMm: spec.dimensions.wheelbaseMm,
          curbWeightKg: spec.dimensions.curbWeightKg,
          grossWeightKg: spec.dimensions.gvwKg,
          trunkLitres: spec.dimensions.cargoCapacityRearL,
          
          // V2L
          hasV2l: spec.charging.v2lSupport,
          
          dataSource: 'pdf-brochure',
          lastVerified: new Date()
        }
      });
    }

    console.log(`   ✅ Variant saved: ${variant.name} (ID: ${variant.id})`);
    
    // Now create/update 11 categories
    await createOrUpdateCategories(variant.id, spec);
  }

  console.log('\n✅ Import completed successfully!\n');
  
  // Summary
  console.log('📊 Summary:');
  console.log(`   Brand: ${brand.name} (ID: ${brand.id})`);
  console.log(`   Model: ${data.subBrand} ${model.name} (ID: ${model.id})`);
  console.log(`   Variants imported: ${data.variants.length}`);
  
  const allVariants = await prisma.nevVariant.findMany({
    where: { modelId: model.id }
  });
  
  console.log('\n📋 All variants in database:');
  allVariants.forEach((v, i) => {
    console.log(`   ${i + 1}. ${v.name} (ID: ${v.id})`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
