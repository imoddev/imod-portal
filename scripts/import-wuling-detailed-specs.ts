import { config } from 'dotenv';
config({ path: '.env.local', override: true });
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const connectionString = 'postgresql://postgres.deunlrpkfrinjsqdqvkk:hH%2FR24fxSmM%40xB%2B@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const prisma = new PrismaClient({ datasourceUrl: connectionString });

async function importDetailedSpecs() {
  try {
    console.log('📊 Importing Wuling detailed specifications...\n');

    const jsonPath = '/Users/imodteam/Desktop/NEV-Database/Upload/2026-02-21 Wuling Brochure/merged.json';
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(rawData);

    for (const variantData of data.variants) {
      const variant = await prisma.nevVariant.findFirst({
        where: {
          model: {
            brand: { name: data.brand },
            name: data.model
          },
          name: variantData.name
        }
      });

      if (!variant) {
        console.log(`❌ Variant ${variantData.name} not found, skipping...`);
        continue;
      }

      console.log(`\n🔧 Processing ${variantData.name}...`);
      const specs = variantData.specifications;

      // 1. Multimedia & Convenience
      await prisma.nevMultimedia.upsert({
        where: { variantId: variant.id },
        create: {
          variantId: variant.id,
          displaySize: specs.multimediaConvenience.infotainmentSystem.includes('10.25') ? 10.25 : null,
          displayType: specs.multimediaConvenience.infotainmentSystem.includes('LCD') ? 'LCD Touch Screen' : null,
          appleCarPlay: specs.multimediaConvenience.appleCarPlay,
          androidAuto: specs.multimediaConvenience.androidAuto,
          keylessEntry: specs.multimediaConvenience.keylessEntry,
          keylessStart: specs.multimediaConvenience.keylessStart
        },
        update: {
          displaySize: specs.multimediaConvenience.infotainmentSystem.includes('10.25') ? 10.25 : null,
          displayType: specs.multimediaConvenience.infotainmentSystem.includes('LCD') ? 'LCD Touch Screen' : null,
          appleCarPlay: specs.multimediaConvenience.appleCarPlay,
          androidAuto: specs.multimediaConvenience.androidAuto,
          keylessEntry: specs.multimediaConvenience.keylessEntry,
          keylessStart: specs.multimediaConvenience.keylessStart
        }
      });
      console.log('  ✅ Multimedia');

      // 2. Safety Systems
      await prisma.nevSafety.upsert({
        where: { variantId: variant.id },
        create: {
          variantId: variant.id,
          airbagsFront: 2,
          esc: specs.safetySystems.esc,
          tcs: specs.safetySystems.tcs,
          ebd: specs.safetySystems.ebd,
          hhc: specs.safetySystems.hillStartAssist,
          camera360: false,
          parkingSensorsRear: specs.safetySystems.reverseSensor ? 4 : 0,
          tpms: specs.safetySystems.tpms,
          seatbeltReminderFront: true
        },
        update: {
          airbagsFront: 2,
          esc: specs.safetySystems.esc,
          tcs: specs.safetySystems.tcs,
          ebd: specs.safetySystems.ebd,
          hhc: specs.safetySystems.hillStartAssist,
          parkingSensorsRear: specs.safetySystems.reverseSensor ? 4 : 0,
          tpms: specs.safetySystems.tpms
        }
      });
      console.log('  ✅ Safety');

      // 3. Interior Equipment
      await prisma.nevInterior.upsert({
        where: { variantId: variant.id },
        create: {
          variantId: variant.id,
          steeringMultifunction: true,
          steeringMaterial: 'Leather',
          seatMaterial: specs.interiorEquipment.seatMaterial,
          driverSeatPower: specs.interiorEquipment.driverSeatAdjustment.includes('ไฟฟ้า'),
          driverSeatAdjustments: 6,
          rearSeatFold: '50:50',
          isofixPoints: 2,
          ambientLighting: false
        },
        update: {
          seatMaterial: specs.interiorEquipment.seatMaterial,
          driverSeatPower: specs.interiorEquipment.driverSeatAdjustment.includes('ไฟฟ้า'),
          driverSeatAdjustments: 6
        }
      });
      console.log('  ✅ Interior');

      // 4. Exterior Equipment
      const sideMirrorsFold = specs.exteriorEquipment.sideMirrors.includes('พับอัตโนมัติ');
      
      await prisma.nevExterior.upsert({
        where: { variantId: variant.id },
        create: {
          variantId: variant.id,
          headlightsType: 'LED',
          headlightsAuto: true,
          drlType: 'LED',
          taillightsType: 'LED',
          sideMirrorsPower: true,
          sideMirrorsFold: sideMirrorsFold,
          windowsRearDefrost: true
        },
        update: {
          headlightsType: 'LED',
          sideMirrorsPower: true,
          sideMirrorsFold: sideMirrorsFold
        }
      });
      console.log('  ✅ Exterior');

      // 5. EV Energy Features
      const dcTime = specs.evEnergyFeatures.dcCharging?.time30to80;
      const acTime = specs.evEnergyFeatures.acCharging?.time20to100;
      
      await prisma.nevEVFeatures.upsert({
        where: { variantId: variant.id },
        create: {
          variantId: variant.id,
          acChargeType: specs.evEnergyFeatures.acCharging?.type || null,
          acChargeMaxKw: specs.evEnergyFeatures.acCharging?.maxPower ? parseFloat(specs.evEnergyFeatures.acCharging.maxPower) : null,
          dcChargeType: specs.evEnergyFeatures.dcCharging?.type || null,
          dcChargeMaxKw: specs.evEnergyFeatures.dcCharging?.maxPower ? parseFloat(specs.evEnergyFeatures.dcCharging.maxPower) : null,
          dcCharge10to80Min: dcTime ? parseFloat(dcTime) : null,
          v2l: specs.evEnergyFeatures.v2l,
          regenerativeBrake: specs.evEnergyFeatures.energyRecovery
        },
        update: {
          acChargeMaxKw: specs.evEnergyFeatures.acCharging?.maxPower ? parseFloat(specs.evEnergyFeatures.acCharging.maxPower) : null,
          dcChargeMaxKw: specs.evEnergyFeatures.dcCharging?.maxPower ? parseFloat(specs.evEnergyFeatures.dcCharging.maxPower) : null,
          dcCharge10to80Min: dcTime ? parseFloat(dcTime) : null,
          v2l: specs.evEnergyFeatures.v2l,
          regenerativeBrake: specs.evEnergyFeatures.energyRecovery
        }
      });
      console.log('  ✅ EV Features');

      // 6. Battery Details
      await prisma.nevBatteryDetails.upsert({
        where: { variantId: variant.id },
        create: {
          variantId: variant.id,
          batteryType: specs.batteryDetails.type,
          batteryKwh: specs.batteryDetails.capacity ? parseFloat(specs.batteryDetails.capacity) : null,
          batteryChemistry: 'LFP'
        },
        update: {
          batteryType: specs.batteryDetails.type,
          batteryKwh: specs.batteryDetails.capacity ? parseFloat(specs.batteryDetails.capacity) : null
        }
      });
      console.log('  ✅ Battery');

      // 7. Suspension
      await prisma.nevSuspension.upsert({
        where: { variantId: variant.id },
        create: {
          variantId: variant.id,
          frontType: specs.suspension.front,
          rearType: specs.suspension.rear
        },
        update: {
          frontType: specs.suspension.front,
          rearType: specs.suspension.rear
        }
      });
      console.log('  ✅ Suspension');

      // 8. Brake System
      await prisma.nevBrakeSystem.upsert({
        where: { variantId: variant.id },
        create: {
          variantId: variant.id,
          frontBrakeType: specs.brakeSystem.front,
          rearBrakeType: specs.brakeSystem.rear
        },
        update: {
          frontBrakeType: specs.brakeSystem.front,
          rearBrakeType: specs.brakeSystem.rear
        }
      });
      console.log('  ✅ Brakes');

      // 9. Wheels & Tires
      await prisma.nevWheelsTires.upsert({
        where: { variantId: variant.id },
        create: {
          variantId: variant.id,
          wheelSizeInch: 15,
          wheelMaterial: specs.wheelsTires.material,
          tireSizeFront: specs.wheelsTires.tireSize,
          tireSizeRear: specs.wheelsTires.tireSize,
          spareTire: false
        },
        update: {
          wheelMaterial: specs.wheelsTires.material,
          tireSizeFront: specs.wheelsTires.tireSize,
          tireSizeRear: specs.wheelsTires.tireSize
        }
      });
      console.log('  ✅ Wheels & Tires');

      // 10. Powertrain & Performance
      await prisma.nevPowertrain.upsert({
        where: { variantId: variant.id },
        create: {
          variantId: variant.id,
          drivetrain: 'FWD',
          frontMotorType: specs.powertrainPerformance.motorType,
          frontMotorKw: specs.powertrainPerformance.maxPower ? parseFloat(specs.powertrainPerformance.maxPower) : null,
          frontMotorNm: specs.powertrainPerformance.maxTorque ? parseFloat(specs.powertrainPerformance.maxTorque) : null,
          totalPowerKw: specs.powertrainPerformance.maxPower ? parseFloat(specs.powertrainPerformance.maxPower) : null,
          totalTorqueNm: specs.powertrainPerformance.maxTorque ? parseFloat(specs.powertrainPerformance.maxTorque) : null,
          topSpeedKmh: specs.powertrainPerformance.topSpeed ? parseFloat(specs.powertrainPerformance.topSpeed) : null
        },
        update: {
          frontMotorKw: specs.powertrainPerformance.maxPower ? parseFloat(specs.powertrainPerformance.maxPower) : null,
          frontMotorNm: specs.powertrainPerformance.maxTorque ? parseFloat(specs.powertrainPerformance.maxTorque) : null,
          totalPowerKw: specs.powertrainPerformance.maxPower ? parseFloat(specs.powertrainPerformance.maxPower) : null,
          totalTorqueNm: specs.powertrainPerformance.maxTorque ? parseFloat(specs.powertrainPerformance.maxTorque) : null,
          topSpeedKmh: specs.powertrainPerformance.topSpeed ? parseFloat(specs.powertrainPerformance.topSpeed) : null
        }
      });
      console.log('  ✅ Powertrain');

      // 11. Dimensions & Weight
      await prisma.nevDimensions.upsert({
        where: { variantId: variant.id },
        create: {
          variantId: variant.id,
          seatingCapacity: 5,
          lengthMm: specs.dimensionsWeight.length,
          widthMm: specs.dimensionsWeight.width,
          heightMm: specs.dimensionsWeight.height,
          wheelbaseMm: specs.dimensionsWeight.wheelbase,
          curbWeightKg: specs.dimensionsWeight.curbWeight,
          trunkCapacityRearL: 310
        },
        update: {
          lengthMm: specs.dimensionsWeight.length,
          widthMm: specs.dimensionsWeight.width,
          heightMm: specs.dimensionsWeight.height,
          wheelbaseMm: specs.dimensionsWeight.wheelbase,
          curbWeightKg: specs.dimensionsWeight.curbWeight
        }
      });
      console.log('  ✅ Dimensions');

      console.log(`\n✅ Completed ${variantData.name} - All 11 categories imported!\n`);
    }

    console.log('🎉 All detailed specs imported successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importDetailedSpecs()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
