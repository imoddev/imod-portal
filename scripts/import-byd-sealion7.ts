#!/usr/bin/env ts-node
/**
 * Import BYD SEALION 7 Complete Specs
 * Based on brochure analysis (March 12, 2026)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚗 Importing BYD SEALION 7...\n');

  // 1. Find or create BYD brand
  let byd = await prisma.nevBrand.findUnique({
    where: { slug: 'byd' }
  });

  if (!byd) {
    byd = await prisma.nevBrand.create({
      data: {
        name: 'BYD',
        nameTh: 'บีวายดี',
        slug: 'byd',
        country: 'China',
        logoUrl: null,
      }
    });
    console.log('✅ Created brand: BYD');
  } else {
    console.log('✅ Found brand: BYD');
  }

  // 2. Find or create SEALION 7 model
  let model = await prisma.nevModel.findUnique({
    where: { slug: 'byd-sealion-7' }
  });

  if (!model) {
    model = await prisma.nevModel.create({
      data: {
        brandId: byd.id,
        name: 'SEALION 7',
        nameTh: 'ซีไลอัน 7',
        slug: 'byd-sealion-7',
        fullName: 'BYD SEALION 7',
        year: 2026,
        bodyType: 'SUV',
        segment: 'D',
        seats: 5,
        powertrain: 'BEV',
        assembly: 'CBU',
        madeIn: 'China',
      }
    });
    console.log('✅ Created model: SEALION 7\n');
  } else {
    console.log('✅ Found model: SEALION 7\n');
  }

  // 3. Create variants
  const variants = [
    {
      name: 'Premium',
      fullName: 'BYD SEALION 7 Premium',
      slug: 'byd-sealion-7-premium',
      priceBaht: null, // TBA
      drivetrain: 'RWD',
      accel0100: 6.7,
    },
    {
      name: 'AWD Performance',
      fullName: 'BYD SEALION 7 AWD Performance',
      slug: 'byd-sealion-7-awd-performance',
      priceBaht: null, // TBA
      drivetrain: 'AWD',
      accel0100: 4.5,
    }
  ];

  for (const variantData of variants) {
    console.log(`\n📦 Processing: ${variantData.name}...`);

    // Check if exists
    let variant = await prisma.nevVariant.findUnique({
      where: { slug: variantData.slug }
    });

    if (variant) {
      console.log(`⚠️  Variant exists, skipping: ${variantData.slug}`);
      continue;
    }

    // Create variant with basic specs
    variant = await prisma.nevVariant.create({
      data: {
        modelId: model.id,
        name: variantData.name,
        fullName: variantData.fullName,
        slug: variantData.slug,
        priceBaht: variantData.priceBaht,
        
        // Basic specs (for compatibility)
        batteryKwh: variantData.drivetrain === 'AWD' ? 91.3 : 82.5,
        rangeKm: variantData.drivetrain === 'AWD' ? 502 : 567,
        rangeStandard: 'CLTC',
        motorHp: variantData.drivetrain === 'AWD' ? 530 : 313,
        torqueNm: variantData.drivetrain === 'AWD' ? 690 : 380,
        accel0100: variantData.accel0100,
        drivetrain: variantData.drivetrain,
        chargePort: 'CCS2',
        
        lengthMm: 4830,
        widthMm: 1925,
        heightMm: 1620,
        wheelbaseMm: 2930,
        curbWeightKg: variantData.drivetrain === 'AWD' ? 2340 : 2225,
        
        dataSource: 'manual-brochure',
        isActive: true,
      }
    });

    console.log(`✅ Created variant: ${variantData.name}`);

    // ======================
    // 1. Multimedia
    // ======================
    await prisma.nevMultimedia.create({
      data: {
        variantId: variant.id,
        displaySize: 15.6,
        displayType: 'Rotating touchscreen',
        bluetooth: true,
        appleCarPlay: true,
        androidAuto: true,
        audioSystem: 'DYNAUDIO',
        speakerCount: 12,
        voiceControl: true,
        voiceLanguages: 'Thai',
        navigation: true,
        musicStreaming: true,
        usbCFront: 1,
        usbAFront: 1,
        usbCRear: 1,
        usbARear: 1,
        powerOutlet12V: true,
        wirelessCharging: true,
        wirelessChargingWatt: 50,
        otaUpdate: true,
        keylessEntry: true,
        keylessStart: true,
        nfcCard: true,
        digitalKey: true,
        climateZones: 2,
        rearVents: true,
        ionizer: true,
        pm25Filter: true,
        pm25FilterType: 'CN95',
      }
    });
    console.log('  ✅ Multimedia specs');

    // ======================
    // 2. Safety
    // ======================
    await prisma.nevSafety.create({
      data: {
        variantId: variant.id,
        airbagsFront: 2,
        airbagsSide: 2,
        airbagsCurtain: true,
        airbagsCenter: true,
        airbagsRearSide: true,
        seatbeltPretensioner: true,
        seatbeltReminderFront: true,
        seatbeltReminderRear: true,
        childLockElectric: true,
        camera360: true,
        parkingSensorsFront: 2,
        parkingSensorsRear: 4,
        esc: true,
        tcs: true,
        ebd: true,
        hhc: true,
        avh: true,
        adaptiveCruise: true,
        intelligentCruise: true,
        trafficSignRecog: true,
        speedLimitAlert: true,
        speedLimitControl: true,
        autoEmergencyBrake: true,
        forwardCollisionWarn: true,
        rearCollisionWarn: true,
        laneDepartureWarn: true,
        laneKeepAssist: true,
        emergencyLaneKeep: true,
        frontCrossTrafficAlert: true,
        frontCrossTrafficBrake: true,
        rearCrossTrafficAlert: true,
        rearCrossTrafficBrake: true,
        autoHighBeam: true,
        blindSpotDetection: true,
        doorOpenWarning: true,
        driverMonitoring: true,
        tpms: true,
        itac: variantData.drivetrain === 'AWD', // AWD only
      }
    });
    console.log('  ✅ Safety specs');

    // ======================
    // 3. Interior
    // ======================
    await prisma.nevInterior.create({
      data: {
        variantId: variant.id,
        steeringMultifunction: true,
        steeringPowerAssist: 'DP-EPS',
        steeringMaterial: 'NAPPA Leather',
        hudDisplay: true,
        instrumentCluster: '10.25" LCD',
        rearviewMirrorAutoDim: true,
        seatMaterial: 'NAPPA Leather',
        driverSeatPower: true,
        driverSeatAdjustments: 8,
        driverSeatLumbar: true,
        driverSeatMemory: true,
        driverSeatVentilation: true,
        passengerSeatPower: true,
        passengerSeatAdjustments: 6,
        welcomeSeat: true,
        rearSeatFold: '60/40',
        rearSeatArmrest: true,
        rearSeatCupholders: 2,
        isofixPoints: 2,
        sunglassHolder: true,
        vanityMirrors: true,
        ambientLighting: true,
        ambientLightingType: 'RGB Dynamic Mood Lights',
      }
    });
    console.log('  ✅ Interior specs');

    // ======================
    // 4. Exterior
    // ======================
    await prisma.nevExterior.create({
      data: {
        variantId: variant.id,
        headlightsType: 'LED',
        headlightsAuto: true,
        headlightsFollowMeHome: true,
        drlType: 'LED',
        taillightsType: 'LED',
        rearFogLights: true,
        turnSignalsSequential: true,
        thirdBrakeLight: true,
        thirdBrakeLightType: 'LED',
        sunroofType: 'Panoramic glass',
        sunroofElectric: true,
        sunroofCurtain: true,
        doorHandlesRetractable: true,
        powerTailgate: true,
        kickSensorTailgate: true,
        sideMirrorsPower: true,
        sideMirrorsFold: true,
        sideMirrorsHeated: true,
        sideMirrorsMemory: true,
        sideMirrorsAutoTilt: true,
        windowsFrontLaminated: true,
        windowsRearPrivacy: true,
        windowsRearDefrost: true,
        wipersFrontAuto: true,
        wipersRear: true,
      }
    });
    console.log('  ✅ Exterior specs');

    // ======================
    // 5. EV Features
    // ======================
    await prisma.nevEVFeatures.create({
      data: {
        variantId: variant.id,
        rangeNEDC: variantData.drivetrain === 'AWD' ? 502 : 567,
        chargerMode2: true,
        acChargeType: 'Type 2',
        acChargeMaxKw: 11,
        dcChargeType: 'CCS2',
        dcChargeMaxKw: 150,
        v2l: true,
        v2lAccessories: true,
        regenerativeBrake: true,
      }
    });
    console.log('  ✅ EV Features');

    // ======================
    // 6. Battery
    // ======================
    await prisma.nevBatteryDetails.create({
      data: {
        variantId: variant.id,
        batteryType: 'BYD Blade Battery',
        batteryKwh: variantData.drivetrain === 'AWD' ? 91.3 : 82.5,
        batteryChemistry: 'LFP',
      }
    });
    console.log('  ✅ Battery specs');

    // ======================
    // 7. Suspension
    // ======================
    await prisma.nevSuspension.create({
      data: {
        variantId: variant.id,
        frontType: 'Independent',
        rearType: 'Multi-link',
        adaptiveSuspension: 'FSD',
        adaptiveFrontRear: 'Front & Rear',
      }
    });
    console.log('  ✅ Suspension specs');

    // ======================
    // 8. Brakes
    // ======================
    await prisma.nevBrakeSystem.create({
      data: {
        variantId: variant.id,
        frontBrakeType: 'Ventilated disc with dual air channels',
        rearBrakeType: 'Ventilated disc',
        caliperColor: variantData.drivetrain === 'AWD' ? 'Red' : null,
      }
    });
    console.log('  ✅ Brake specs');

    // ======================
    // 9. Wheels & Tires
    // ======================
    await prisma.nevWheelsTires.create({
      data: {
        variantId: variant.id,
        wheelSizeInch: variantData.drivetrain === 'AWD' ? 20 : 19,
        wheelMaterial: 'Alloy',
        tireSizeFront: variantData.drivetrain === 'AWD' ? '255/45 R20' : '235/60 R19',
        tireSizeRear: variantData.drivetrain === 'AWD' ? '255/45 R20' : '255/55 R19',
        spareTire: false,
        spareType: 'Emergency repair kit',
      }
    });
    console.log('  ✅ Wheels & Tires');

    // ======================
    // 10. Powertrain
    // ======================
    if (variantData.drivetrain === 'RWD') {
      await prisma.nevPowertrain.create({
        data: {
          variantId: variant.id,
          drivetrain: 'RWD',
          rearMotorType: 'Permanent Magnet Synchronous',
          rearMotorKw: 230,
          rearMotorNm: 380,
          totalPowerKw: 230,
          totalTorqueNm: 380,
          accel0100: 6.7,
        }
      });
    } else {
      // AWD
      await prisma.nevPowertrain.create({
        data: {
          variantId: variant.id,
          drivetrain: 'AWD',
          frontMotorType: 'Synchronous',
          frontMotorKw: 160,
          frontMotorNm: 310,
          rearMotorType: 'Permanent Magnet Synchronous',
          rearMotorKw: 230,
          rearMotorNm: 380,
          totalPowerKw: 390,
          totalTorqueNm: 690,
          accel0100: 4.5,
        }
      });
    }
    console.log('  ✅ Powertrain specs');

    // ======================
    // 11. Dimensions
    // ======================
    await prisma.nevDimensions.create({
      data: {
        variantId: variant.id,
        seatingCapacity: 5,
        lengthMm: 4830,
        widthMm: 1925,
        heightMm: 1620,
        wheelbaseMm: 2930,
        groundClearanceMm: variantData.drivetrain === 'AWD' ? 163 : 157,
        groundClearanceLoadedMm: 140,
        turningRadiusM: 5.85,
        trunkCapacityFrontL: variantData.drivetrain === 'AWD' ? 58 : null,
        trunkCapacityRearL: 500,
        curbWeightKg: variantData.drivetrain === 'AWD' ? 2340 : 2225,
        gvwKg: variantData.drivetrain === 'AWD' ? 2750 : 2635,
      }
    });
    console.log('  ✅ Dimensions specs');

    console.log(`\n✅ ${variantData.name} - All specs imported!`);
  }

  console.log('\n🎉 BYD SEALION 7 import complete!\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
