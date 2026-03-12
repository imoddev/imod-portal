import { config } from 'dotenv';
config({ path: '.env.local', override: true });

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const connectionString = 'postgresql://postgres.deunlrpkfrinjsqdqvkk:hH%2FR24fxSmM%40xB%2B@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const prisma = new PrismaClient({ datasourceUrl: connectionString });

interface VariantData {
  variantName: string;
  trimLevel: string;
  powertrain: any;
  battery: any;
  evFeatures?: any;
  dimensions: any;
  suspension?: any;
  brakes?: any;
  wheels?: any;
  safety?: any;
  multimedia?: any;
  interior?: any;
  exterior?: any;
  colors?: any;
  warranty?: any;
}

interface ModelData {
  modelName: string;
  type: string;
  brand: string;
  year: number;
  variants: VariantData[];
}

interface MergedData {
  brand: string;
  source: string;
  extractedDate: string;
  models: ModelData[];
}

async function main() {
  console.log('🚗 OMODA & JAECOO Import Script v2.0');
  console.log('=====================================\n');

  const jsonPath = '/Users/imodteam/Desktop/NEV-Database/Upload/2026-02-21 OMODA & JAECOO Brochure/merged.json';
  const data: MergedData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  console.log(`📦 Brand: ${data.brand}`);
  console.log(`📅 Extracted: ${data.extractedDate}`);
  console.log(`📄 Source: ${data.source}\n`);

  let totalCreated = 0;
  let totalUpdated = 0;

  for (const model of data.models) {
    console.log(`\n🚙 Processing: ${model.modelName} (${model.type})`);
    console.log(`   Brand: ${model.brand}`);
    console.log(`   Year: ${model.year}`);
    console.log(`   Variants: ${model.variants.length}\n`);

    // Find or create brand
    let brandRecord = await prisma.nevBrand.findFirst({
      where: { name: model.brand }
    });

    if (!brandRecord) {
      brandRecord = await prisma.nevBrand.create({
        data: {
          name: model.brand,
          slug: model.brand.toLowerCase().replace(/\s+/g, '-'),
          country: 'China',
          isActive: true
        }
      });
      console.log(`   ✅ Created brand: ${model.brand}`);
    }

    // Find or create model
    let modelRecord = await prisma.nevModel.findFirst({
      where: {
        brandId: brandRecord.id,
        name: model.modelName
      }
    });

    if (!modelRecord) {
      modelRecord = await prisma.nevModel.create({
        data: {
          brandId: brandRecord.id,
          name: model.modelName,
          slug: `${model.brand.toLowerCase()}-${model.modelName.toLowerCase()}`.replace(/\s+/g, '-'),
          year: model.year,
          powertrain: model.type,
          isActive: true
        }
      });
      console.log(`   ✅ Created model: ${model.modelName}`);
      totalCreated++;
    } else {
      console.log(`   ℹ️  Model exists: ${model.modelName}`);
    }

    // Import variants
    for (const variant of model.variants) {
      console.log(`\n   📋 Variant: ${variant.variantName}`);

      // Check if variant exists
      let variantRecord = await prisma.nevVariant.findFirst({
        where: {
          modelId: modelRecord.id,
          name: variant.variantName
        }
      });

      const variantData: any = {
        name: variant.variantName,
        fullName: `${model.brand} ${model.modelName} ${variant.variantName}`,
        slug: `${model.brand.toLowerCase()}-${model.modelName.toLowerCase()}-${variant.variantName.toLowerCase()}`.replace(/\s+/g, '-'),
        modelId: modelRecord.id,
        
        // Battery & Range
        batteryKwh: parseFloat(variant.battery?.capacity) || null,
        rangeKm: parseInt(variant.battery?.rangeNEDC || variant.battery?.pureElectricRangeNEDC) || null,
        rangeStandard: variant.battery?.rangeNEDC ? 'NEDC' : null,
        
        // Motor
        motorCount: variant.powertrain?.motors || 1,
        motorKw: parseFloat(variant.powertrain?.maxPower) || null,
        motorHp: parseInt(variant.powertrain?.maxPower?.match(/\((\d+)\s*hp\)/)?.[1]) || null,
        torqueNm: parseInt(variant.powertrain?.maxTorque) || null,
        
        // Performance
        topSpeedKmh: parseInt(variant.powertrain?.topSpeed) || null,
        accel0100: parseFloat(variant.powertrain?.acceleration0to100) || null,
        
        // Drivetrain
        drivetrain: variant.powertrain?.driveType || null,
        
        // Charging
        dcChargeKw: parseFloat(variant.battery?.maxDCCharging) || null,
        acChargeKw: parseFloat(variant.battery?.maxACCharging) || null,
        
        // PHEV specific
        engineCc: variant.powertrain?.engineType?.includes('1.5') ? 1500 : null,
        engineHp: parseInt(variant.powertrain?.engineMaxPower?.match(/\((\d+)\s*PS\)/)?.[1]) || null,
        combinedHp: variant.powertrain?.motorMaxPower ? 
          (parseInt(variant.powertrain?.engineMaxPower?.match(/\((\d+)\s*PS\)/)?.[1]) || 0) + 
          (parseInt(variant.powertrain?.motorMaxPower?.match(/\((\d+)\s*PS\)/)?.[1]) || 0) : null,
        fuelConsumption: parseFloat(variant.powertrain?.fuelConsumption) || null,
        
        // Dimensions
        lengthMm: variant.dimensions?.length || null,
        widthMm: variant.dimensions?.width || null,
        heightMm: variant.dimensions?.height || null,
        wheelbaseMm: variant.dimensions?.wheelbase || null,
        groundClearanceMm: variant.dimensions?.groundClearance || null,
        
        // V2L
        hasV2l: variant.evFeatures?.v2l || false,
        v2lKw: variant.evFeatures?.v2lPower ? parseFloat(variant.evFeatures.v2lPower) : null,
        
        // Features JSON
        features: JSON.stringify({
          multimedia: variant.multimedia,
          safety: variant.safety,
          interior: variant.interior,
          exterior: variant.exterior,
          evFeatures: variant.evFeatures,
          colors: variant.colors
        }),
        
        // Status
        isActive: true,
        dataSource: 'brochure-pdf',
        lastVerified: new Date()
      };

      if (variantRecord) {
        variantRecord = await prisma.nevVariant.update({
          where: { id: variantRecord.id },
          data: variantData
        });
        console.log(`      ✅ Updated: ${variant.variantName}`);
        totalUpdated++;
      } else {
        variantRecord = await prisma.nevVariant.create({
          data: variantData
        });
        console.log(`      ✅ Created: ${variant.variantName}`);
        totalCreated++;
      }

      // Import detailed specs to 11 categories
      await importDetailedSpecs(variantRecord.id, variant);
    }

    // Update model stats
    const variantCount = await prisma.nevVariant.count({
      where: { modelId: modelRecord.id, isActive: true }
    });
    
    await prisma.nevBrand.update({
      where: { id: brandRecord.id },
      data: {
        totalModels: await prisma.nevModel.count({
          where: { brandId: brandRecord.id, isActive: true }
        })
      }
    });
  }

  console.log('\n\n========================================');
  console.log('✅ Import completed successfully!');
  console.log(`📊 Created: ${totalCreated} records`);
  console.log(`📊 Updated: ${totalUpdated} records`);
  console.log('========================================\n');
}

async function importDetailedSpecs(variantId: string, variant: VariantData) {
  // 1. Multimedia & Convenience
  if (variant.multimedia) {
    await prisma.nevMultimedia.upsert({
      where: { variantId },
      create: {
        variantId,
        displaySize: parseFloat(variant.multimedia.displaySize) || null,
        bluetooth: variant.multimedia.bluetooth || false,
        appleCarPlay: variant.multimedia.appleCarPlay || false,
        androidAuto: variant.multimedia.androidAuto || false,
        audioSystem: variant.multimedia.audioSystem || null,
        speakerCount: variant.multimedia.audioSystem?.match(/(\d+)\s*speaker/i)?.[1] ? 
          parseInt(variant.multimedia.audioSystem.match(/(\d+)\s*speaker/i)[1]) : null,
        usbCFront: variant.multimedia.usbPorts ? 1 : 0,
        wirelessCharging: variant.multimedia.wirelessCharging || false,
        wirelessChargingWatt: parseFloat(variant.multimedia.wirelessChargingPower) || null,
        keylessEntry: variant.interior?.keylessEntry || false,
        climateZones: variant.interior?.climateControl?.includes('Dual') ? 2 : 1
      },
      update: {
        displaySize: parseFloat(variant.multimedia.displaySize) || null,
        bluetooth: variant.multimedia.bluetooth || false,
        appleCarPlay: variant.multimedia.appleCarPlay || false,
        androidAuto: variant.multimedia.androidAuto || false,
        audioSystem: variant.multimedia.audioSystem || null,
        speakerCount: variant.multimedia.audioSystem?.match(/(\d+)\s*speaker/i)?.[1] ? 
          parseInt(variant.multimedia.audioSystem.match(/(\d+)\s*speaker/i)[1]) : null,
        wirelessCharging: variant.multimedia.wirelessCharging || false,
        wirelessChargingWatt: parseFloat(variant.multimedia.wirelessChargingPower) || null
      }
    });
  }

  // 2. Safety Systems
  if (variant.safety) {
    const airbags = variant.safety.airbags || [];
    await prisma.nevSafety.upsert({
      where: { variantId },
      create: {
        variantId,
        airbagsFront: airbags.filter((a: string) => a.includes('Front')).length,
        airbagsSide: airbags.filter((a: string) => a.includes('Side')).length,
        airbagsCurtain: airbags.some((a: string) => a.includes('Curtain')),
        camera360: variant.safety.cameras?.surroundView || false,
        parkingSensorsFront: variant.safety.parkingSensors?.front ? 2 : 0,
        parkingSensorsRear: variant.safety.parkingSensors?.rear ? 2 : 0,
        adaptiveCruise: variant.safety.adas?.includes('ACC') || false,
        autoEmergencyBrake: variant.safety.adas?.includes('AEB') || false,
        forwardCollisionWarn: variant.safety.adas?.includes('FCW') || false,
        laneDepartureWarn: variant.safety.adas?.includes('LDW') || false,
        laneKeepAssist: variant.safety.adas?.includes('LKA') || false,
        blindSpotDetection: variant.safety.adas?.includes('BSD') || false,
        rearCrossTrafficAlert: variant.safety.adas?.includes('RCTA') || false,
        tpms: true
      },
      update: {
        airbagsFront: airbags.filter((a: string) => a.includes('Front')).length,
        airbagsSide: airbags.filter((a: string) => a.includes('Side')).length,
        airbagsCurtain: airbags.some((a: string) => a.includes('Curtain')),
        camera360: variant.safety.cameras?.surroundView || false,
        adaptiveCruise: variant.safety.adas?.includes('ACC') || false,
        autoEmergencyBrake: variant.safety.adas?.includes('AEB') || false
      }
    });
  }

  // 3. Interior Equipment
  if (variant.interior) {
    await prisma.nevInterior.upsert({
      where: { variantId },
      create: {
        variantId,
        steeringMultifunction: true,
        seatMaterial: variant.interior.upholstery || null,
        driverSeatPower: variant.interior.driverSeatAdjustment?.includes('Electric') || false,
        driverSeatVentilation: variant.interior.driverSeatVentilation || false,
        passengerSeatPower: variant.interior.passengerSeatAdjustment?.includes('Electric') || false,
        rearSeatFold: variant.interior.rearSeatSplit || null,
        ambientLighting: variant.interior.ambientLighting ? true : false,
        ambientLightingType: variant.interior.ambientLighting || null
      },
      update: {
        seatMaterial: variant.interior.upholstery || null,
        driverSeatPower: variant.interior.driverSeatAdjustment?.includes('Electric') || false,
        driverSeatVentilation: variant.interior.driverSeatVentilation || false
      }
    });
  }

  // 4. Exterior Equipment
  if (variant.exterior) {
    await prisma.nevExterior.upsert({
      where: { variantId },
      create: {
        variantId,
        headlightsType: variant.exterior.headlights || null,
        headlightsAuto: variant.exterior.autoHeadlights || false,
        drlType: variant.exterior.drl || null,
        taillightsType: variant.exterior.tailLights || null,
        sunroofType: variant.interior?.sunroof ? 'Panoramic' : null,
        powerTailgate: variant.interior?.powerTailgate || false
      },
      update: {
        headlightsType: variant.exterior.headlights || null,
        headlightsAuto: variant.exterior.autoHeadlights || false
      }
    });
  }

  // 5. EV Energy Features
  if (variant.evFeatures || variant.battery) {
    await prisma.nevEVFeatures.upsert({
      where: { variantId },
      create: {
        variantId,
        rangeNEDC: parseFloat(variant.battery?.rangeNEDC || variant.battery?.pureElectricRangeNEDC) || null,
        rangeWLTP: parseFloat(variant.battery?.rangeWLTP) || null,
        acChargeMaxKw: parseFloat(variant.battery?.maxACCharging) || null,
        dcChargeMaxKw: parseFloat(variant.battery?.maxDCCharging) || null,
        v2l: variant.evFeatures?.v2l || false,
        regenerativeBrake: true
      },
      update: {
        rangeNEDC: parseFloat(variant.battery?.rangeNEDC || variant.battery?.pureElectricRangeNEDC) || null,
        rangeWLTP: parseFloat(variant.battery?.rangeWLTP) || null,
        acChargeMaxKw: parseFloat(variant.battery?.maxACCharging) || null,
        dcChargeMaxKw: parseFloat(variant.battery?.maxDCCharging) || null
      }
    });
  }

  // 6. Battery Details
  if (variant.battery) {
    await prisma.nevBatteryDetails.upsert({
      where: { variantId },
      create: {
        variantId,
        batteryKwh: parseFloat(variant.battery.capacity) || null,
        batteryType: 'Lithium-ion'
      },
      update: {
        batteryKwh: parseFloat(variant.battery.capacity) || null
      }
    });
  }

  // 7. Suspension
  if (variant.suspension) {
    await prisma.nevSuspension.upsert({
      where: { variantId },
      create: {
        variantId,
        frontType: variant.suspension.front || null,
        rearType: variant.suspension.rear || null
      },
      update: {
        frontType: variant.suspension.front || null,
        rearType: variant.suspension.rear || null
      }
    });
  }

  // 8. Brake System
  if (variant.brakes) {
    await prisma.nevBrakeSystem.upsert({
      where: { variantId },
      create: {
        variantId,
        frontBrakeType: variant.brakes.front || null,
        rearBrakeType: variant.brakes.rear || null
      },
      update: {
        frontBrakeType: variant.brakes.front || null,
        rearBrakeType: variant.brakes.rear || null
      }
    });
  }

  // 9. Wheels & Tires
  if (variant.wheels) {
    await prisma.nevWheelsTires.upsert({
      where: { variantId },
      create: {
        variantId,
        tireSizeFront: variant.wheels.frontSize || null,
        tireSizeRear: variant.wheels.rearSize || null,
        wheelSizeInch: parseFloat(variant.wheels.frontSize?.match(/R(\d+)/)?.[1]) || null
      },
      update: {
        tireSizeFront: variant.wheels.frontSize || null,
        tireSizeRear: variant.wheels.rearSize || null
      }
    });
  }

  // 10. Powertrain & Performance
  if (variant.powertrain) {
    await prisma.nevPowertrain.upsert({
      where: { variantId },
      create: {
        variantId,
        drivetrain: variant.powertrain.driveType || null,
        totalPowerKw: parseFloat(variant.powertrain.maxPower) || 
                      parseFloat(variant.powertrain.motorMaxPower) || null,
        totalTorqueNm: parseFloat(variant.powertrain.maxTorque) || 
                       parseFloat(variant.powertrain.motorMaxTorque) || null,
        accel0100: parseFloat(variant.powertrain.acceleration0to100) || null,
        topSpeedKmh: parseFloat(variant.powertrain.topSpeed) || null
      },
      update: {
        drivetrain: variant.powertrain.driveType || null,
        totalPowerKw: parseFloat(variant.powertrain.maxPower) || 
                      parseFloat(variant.powertrain.motorMaxPower) || null,
        totalTorqueNm: parseFloat(variant.powertrain.maxTorque) || 
                       parseFloat(variant.powertrain.motorMaxTorque) || null
      }
    });
  }

  // 11. Dimensions & Weight
  if (variant.dimensions) {
    await prisma.nevDimensions.upsert({
      where: { variantId },
      create: {
        variantId,
        seatingCapacity: variant.interior?.seatingCapacity || 5,
        lengthMm: variant.dimensions.length || null,
        widthMm: variant.dimensions.width || null,
        heightMm: variant.dimensions.height || null,
        wheelbaseMm: variant.dimensions.wheelbase || null,
        groundClearanceMm: variant.dimensions.groundClearance || null,
        trunkCapacityRearL: parseFloat(variant.evFeatures?.cargoSpace) || null
      },
      update: {
        lengthMm: variant.dimensions.length || null,
        widthMm: variant.dimensions.width || null,
        heightMm: variant.dimensions.height || null,
        wheelbaseMm: variant.dimensions.wheelbase || null
      }
    });
  }
}

main()
  .catch((e) => {
    console.error('\n❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
