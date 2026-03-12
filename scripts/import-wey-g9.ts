import { config } from 'dotenv';
config({ path: '.env.local', override: true });
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const connectionString = 'postgresql://postgres.deunlrpkfrinjsqdqvkk:hH%2FR24fxSmM%40xB%2B@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const prisma = new PrismaClient({ datasourceUrl: connectionString });

interface WeyG9Data {
  brand: any;
  model: any;
  variant: any;
  specs: any;
  warranty: any;
  privileges: any;
  mobileApp: any;
  environmental: any;
  images: any;
  metadata: any;
}

async function importWeyG9() {
  console.log('🚀 Starting WEY G9 import...\n');

  try {
    // Read merged.json
    const dataPath = '/Users/imodteam/Desktop/NEV-Database/Upload/2026-02-21 WEY G9/merged.json';
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const data: WeyG9Data = JSON.parse(rawData);

    console.log('📋 Data loaded from merged.json');
    console.log(`   Brand: ${data.brand.name}`);
    console.log(`   Model: ${data.model.fullName}`);
    console.log(`   Variant: ${data.variant.fullName}`);
    console.log(`   Price: ฿${data.variant.priceBaht?.toLocaleString()}\n`);

    // 1. Create or Update Brand
    console.log('📦 Step 1: Creating/Updating Brand...');
    const brand = await prisma.nevBrand.upsert({
      where: { slug: data.brand.slug },
      update: {
        name: data.brand.name,
        nameTh: data.brand.nameTh,
        country: data.brand.country,
        website: data.brand.website,
        isActive: true,
      },
      create: {
        name: data.brand.name,
        nameTh: data.brand.nameTh,
        slug: data.brand.slug,
        country: data.brand.country,
        website: data.brand.website,
        isActive: true,
      },
    });
    console.log(`   ✅ Brand: ${brand.name} (ID: ${brand.id})\n`);

    // 2. Create or Update Model
    console.log('🚗 Step 2: Creating/Updating Model...');
    const model = await prisma.nevModel.upsert({
      where: { slug: data.model.slug },
      update: {
        brandId: brand.id,
        name: data.model.name,
        nameTh: data.model.nameTh,
        fullName: data.model.fullName,
        year: data.model.year,
        bodyType: data.model.bodyType,
        segment: data.model.segment,
        seats: data.model.seats,
        powertrain: data.model.powertrain,
        assembly: data.model.assembly,
        madeIn: data.model.madeIn,
        overview: data.model.overview,
        highlights: data.model.highlights,
        isActive: data.model.isActive,
        isNewModel: data.model.isNewModel,
        launchDate: data.model.launchDate ? new Date(data.model.launchDate) : null,
      },
      create: {
        brandId: brand.id,
        name: data.model.name,
        nameTh: data.model.nameTh,
        slug: data.model.slug,
        fullName: data.model.fullName,
        year: data.model.year,
        bodyType: data.model.bodyType,
        segment: data.model.segment,
        seats: data.model.seats,
        powertrain: data.model.powertrain,
        assembly: data.model.assembly,
        madeIn: data.model.madeIn,
        overview: data.model.overview,
        highlights: data.model.highlights,
        isActive: data.model.isActive,
        isNewModel: data.model.isNewModel,
        launchDate: data.model.launchDate ? new Date(data.model.launchDate) : null,
      },
    });
    console.log(`   ✅ Model: ${model.fullName} (ID: ${model.id})\n`);

    // 3. Create or Update Variant
    console.log('⚡ Step 3: Creating/Updating Variant...');
    const variant = await prisma.nevVariant.upsert({
      where: { slug: data.variant.slug },
      update: {
        modelId: model.id,
        name: data.variant.name,
        fullName: data.variant.fullName,
        priceBaht: data.variant.priceBaht,
        priceNote: data.variant.priceNote,
        isBestSeller: data.variant.isBestSeller,
        isActive: data.variant.isActive,
        dataSource: data.variant.dataSource,
        lastVerified: data.variant.lastVerified ? new Date(data.variant.lastVerified) : null,
        
        // Basic specs
        batteryKwh: data.specs.basic.batteryKwh,
        rangeKm: data.specs.basic.rangeKm,
        rangeStandard: data.specs.basic.rangeStandard,
        motorCount: data.specs.basic.motorCount,
        motorKw: data.specs.basic.motorKw,
        motorHp: data.specs.basic.motorHp,
        torqueNm: data.specs.basic.torqueNm,
        engineCc: data.specs.basic.engineCc,
        combinedHp: data.specs.basic.combinedHp,
        fuelTankL: data.specs.basic.fuelTankL,
        drivetrain: data.specs.basic.drivetrain,
        dcChargeKw: data.specs.basic.dcChargeKw,
        acChargeKw: data.specs.basic.acChargeKw,
        chargePort: data.specs.basic.chargePort,
        hasV2l: data.specs.basic.hasV2l,
        v2lKw: data.specs.basic.v2lKw,
        
        // Dimensions
        lengthMm: data.specs.dimensions.lengthMm,
        widthMm: data.specs.dimensions.widthMm,
        heightMm: data.specs.dimensions.heightMm,
        wheelbaseMm: data.specs.dimensions.wheelbaseMm,
        groundClearanceMm: data.specs.dimensions.groundClearanceMm,
        curbWeightKg: data.specs.dimensions.curbWeightKg,
        grossWeightKg: data.specs.dimensions.gvwKg,
        
        // Warranty
        warrantyVehicle: data.warranty.vehicle,
        warrantyBattery: data.warranty.battery,
        
        // Features JSON
        features: JSON.stringify({
          warranty: data.warranty,
          privileges: data.privileges,
          mobileApp: data.mobileApp,
          environmental: data.environmental,
          images: data.images,
        }),
      },
      create: {
        modelId: model.id,
        name: data.variant.name,
        fullName: data.variant.fullName,
        slug: data.variant.slug,
        priceBaht: data.variant.priceBaht,
        priceNote: data.variant.priceNote,
        isBestSeller: data.variant.isBestSeller,
        isActive: data.variant.isActive,
        dataSource: data.variant.dataSource,
        lastVerified: data.variant.lastVerified ? new Date(data.variant.lastVerified) : null,
        
        // Basic specs
        batteryKwh: data.specs.basic.batteryKwh,
        rangeKm: data.specs.basic.rangeKm,
        rangeStandard: data.specs.basic.rangeStandard,
        motorCount: data.specs.basic.motorCount,
        motorKw: data.specs.basic.motorKw,
        motorHp: data.specs.basic.motorHp,
        torqueNm: data.specs.basic.torqueNm,
        engineCc: data.specs.basic.engineCc,
        combinedHp: data.specs.basic.combinedHp,
        fuelTankL: data.specs.basic.fuelTankL,
        drivetrain: data.specs.basic.drivetrain,
        dcChargeKw: data.specs.basic.dcChargeKw,
        acChargeKw: data.specs.basic.acChargeKw,
        chargePort: data.specs.basic.chargePort,
        hasV2l: data.specs.basic.hasV2l,
        v2lKw: data.specs.basic.v2lKw,
        
        // Dimensions
        lengthMm: data.specs.dimensions.lengthMm,
        widthMm: data.specs.dimensions.widthMm,
        heightMm: data.specs.dimensions.heightMm,
        wheelbaseMm: data.specs.dimensions.wheelbaseMm,
        groundClearanceMm: data.specs.dimensions.groundClearanceMm,
        curbWeightKg: data.specs.dimensions.curbWeightKg,
        grossWeightKg: data.specs.dimensions.gvwKg,
        
        // Warranty
        warrantyVehicle: data.warranty.vehicle,
        warrantyBattery: data.warranty.battery,
        
        // Features JSON
        features: JSON.stringify({
          warranty: data.warranty,
          privileges: data.privileges,
          mobileApp: data.mobileApp,
          environmental: data.environmental,
          images: data.images,
        }),
      },
    });
    console.log(`   ✅ Variant: ${variant.fullName} (ID: ${variant.id})\n`);

    // 4. Create Extended Specs (11 Categories)
    console.log('🔧 Step 4: Creating Extended Specs...\n');

    // 4.1 Multimedia & Convenience
    console.log('   📺 Multimedia & Convenience...');
    await prisma.nevMultimedia.upsert({
      where: { variantId: variant.id },
      update: {
        displaySize: data.specs.multimedia.displaySize,
        displayType: data.specs.multimedia.displayType,
        bluetooth: data.specs.multimedia.bluetooth,
        appleCarPlay: data.specs.multimedia.appleCarPlay,
        androidAuto: data.specs.multimedia.androidAuto,
        audioSystem: data.specs.multimedia.audioSystem,
        speakerCount: data.specs.multimedia.speakerCount,
        voiceControl: data.specs.multimedia.voiceControl,
        voiceLanguages: data.specs.multimedia.voiceLanguages?.toString(),
        navigation: data.specs.multimedia.navigation,
        musicStreaming: data.specs.multimedia.musicStreaming,
        powerOutlet12V: data.specs.multimedia.powerOutlet12V,
        wirelessCharging: data.specs.multimedia.wirelessCharging,
        otaUpdate: data.specs.multimedia.otaUpdate,
        keylessEntry: data.specs.multimedia.keylessEntry,
        keylessStart: data.specs.multimedia.keylessStart,
        digitalKey: data.specs.multimedia.digitalKey,
        climateZones: data.specs.multimedia.climateZones,
        rearVents: data.specs.multimedia.rearVents,
        pm25Filter: data.specs.multimedia.pm25Filter,
        pm25FilterType: data.specs.multimedia.pm25FilterType,
      },
      create: {
        variantId: variant.id,
        displaySize: data.specs.multimedia.displaySize,
        displayType: data.specs.multimedia.displayType,
        bluetooth: data.specs.multimedia.bluetooth,
        appleCarPlay: data.specs.multimedia.appleCarPlay,
        androidAuto: data.specs.multimedia.androidAuto,
        audioSystem: data.specs.multimedia.audioSystem,
        speakerCount: data.specs.multimedia.speakerCount,
        voiceControl: data.specs.multimedia.voiceControl,
        voiceLanguages: data.specs.multimedia.voiceLanguages?.toString(),
        navigation: data.specs.multimedia.navigation,
        musicStreaming: data.specs.multimedia.musicStreaming,
        powerOutlet12V: data.specs.multimedia.powerOutlet12V,
        wirelessCharging: data.specs.multimedia.wirelessCharging,
        otaUpdate: data.specs.multimedia.otaUpdate,
        keylessEntry: data.specs.multimedia.keylessEntry,
        keylessStart: data.specs.multimedia.keylessStart,
        digitalKey: data.specs.multimedia.digitalKey,
        climateZones: data.specs.multimedia.climateZones,
        rearVents: data.specs.multimedia.rearVents,
        pm25Filter: data.specs.multimedia.pm25Filter,
        pm25FilterType: data.specs.multimedia.pm25FilterType,
      },
    });
    console.log('      ✅ Created\n');

    // 4.2 Safety Systems
    console.log('   🛡️ Safety Systems (ADAS)...');
    await prisma.nevSafety.upsert({
      where: { variantId: variant.id },
      update: {
        airbagsFront: data.specs.safety.airbagsFront,
        airbagsSide: data.specs.safety.airbagsSide,
        airbagsCurtain: data.specs.safety.airbagsCurtain,
        seatbeltPretensioner: data.specs.safety.seatbeltPretensioner,
        seatbeltReminderFront: data.specs.safety.seatbeltReminderFront,
        seatbeltReminderRear: data.specs.safety.seatbeltReminderRear,
        childLockElectric: data.specs.safety.childLockElectric,
        camera360: data.specs.safety.camera360,
        parkingSensorsFront: data.specs.safety.parkingSensorsFront,
        parkingSensorsRear: data.specs.safety.parkingSensorsRear,
        esc: data.specs.safety.esc,
        tcs: data.specs.safety.tcs,
        ebd: data.specs.safety.ebd,
        hhc: data.specs.safety.hhc,
        avh: data.specs.safety.avh,
        adaptiveCruise: data.specs.safety.adaptiveCruise,
        intelligentCruise: data.specs.safety.intelligentCruise,
        trafficSignRecog: data.specs.safety.trafficSignRecog,
        speedLimitAlert: data.specs.safety.speedLimitAlert,
        autoEmergencyBrake: data.specs.safety.autoEmergencyBrake,
        forwardCollisionWarn: data.specs.safety.forwardCollisionWarn,
        rearCollisionWarn: data.specs.safety.rearCollisionWarn,
        laneDepartureWarn: data.specs.safety.laneDepartureWarn,
        laneKeepAssist: data.specs.safety.laneKeepAssist,
        emergencyLaneKeep: data.specs.safety.emergencyLaneKeep,
        rearCrossTrafficAlert: data.specs.safety.rearCrossTrafficAlert,
        rearCrossTrafficBrake: data.specs.safety.rearCrossTrafficBrake,
        autoHighBeam: data.specs.safety.autoHighBeam,
        blindSpotDetection: data.specs.safety.blindSpotDetection,
        doorOpenWarning: data.specs.safety.doorOpenWarning,
        tpms: data.specs.safety.tpms,
        itac: data.specs.safety.itvc,
      },
      create: {
        variantId: variant.id,
        airbagsFront: data.specs.safety.airbagsFront,
        airbagsSide: data.specs.safety.airbagsSide,
        airbagsCurtain: data.specs.safety.airbagsCurtain,
        seatbeltPretensioner: data.specs.safety.seatbeltPretensioner,
        seatbeltReminderFront: data.specs.safety.seatbeltReminderFront,
        seatbeltReminderRear: data.specs.safety.seatbeltReminderRear,
        childLockElectric: data.specs.safety.childLockElectric,
        camera360: data.specs.safety.camera360,
        parkingSensorsFront: data.specs.safety.parkingSensorsFront,
        parkingSensorsRear: data.specs.safety.parkingSensorsRear,
        esc: data.specs.safety.esc,
        tcs: data.specs.safety.tcs,
        ebd: data.specs.safety.ebd,
        hhc: data.specs.safety.hhc,
        avh: data.specs.safety.avh,
        adaptiveCruise: data.specs.safety.adaptiveCruise,
        intelligentCruise: data.specs.safety.intelligentCruise,
        trafficSignRecog: data.specs.safety.trafficSignRecog,
        speedLimitAlert: data.specs.safety.speedLimitAlert,
        autoEmergencyBrake: data.specs.safety.autoEmergencyBrake,
        forwardCollisionWarn: data.specs.safety.forwardCollisionWarn,
        rearCollisionWarn: data.specs.safety.rearCollisionWarn,
        laneDepartureWarn: data.specs.safety.laneDepartureWarn,
        laneKeepAssist: data.specs.safety.laneKeepAssist,
        emergencyLaneKeep: data.specs.safety.emergencyLaneKeep,
        rearCrossTrafficAlert: data.specs.safety.rearCrossTrafficAlert,
        rearCrossTrafficBrake: data.specs.safety.rearCrossTrafficBrake,
        autoHighBeam: data.specs.safety.autoHighBeam,
        blindSpotDetection: data.specs.safety.blindSpotDetection,
        doorOpenWarning: data.specs.safety.doorOpenWarning,
        tpms: data.specs.safety.tpms,
        itac: data.specs.safety.itvc,
      },
    });
    console.log('      ✅ Created\n');

    // 4.3 Interior Equipment
    console.log('   🎨 Interior Equipment...');
    await prisma.nevInterior.upsert({
      where: { variantId: variant.id },
      update: {
        steeringMultifunction: data.specs.interior.steeringMultifunction,
        steeringPowerAssist: data.specs.interior.steeringPowerAssist,
        steeringMaterial: data.specs.interior.steeringMaterial,
        hudDisplay: data.specs.interior.hudDisplay,
        instrumentCluster: data.specs.interior.instrumentCluster,
        rearviewMirrorAutoDim: data.specs.interior.rearviewMirrorAutoDim,
        sideMirrorsFold: data.specs.interior.sideMirrorsFold,
        seatMaterial: data.specs.interior.seatMaterial,
        driverSeatPower: data.specs.interior.driverSeatPower,
        driverSeatAdjustments: data.specs.interior.driverSeatAdjustments,
        driverSeatLumbar: data.specs.interior.driverSeatLumbar,
        driverSeatMemory: data.specs.interior.driverSeatMemory,
        driverSeatVentilation: data.specs.interior.driverSeatVentilation,
        passengerSeatPower: data.specs.interior.passengerSeatPower,
        passengerSeatAdjustments: data.specs.interior.passengerSeatAdjustments,
        welcomeSeat: data.specs.interior.welcomeSeat,
        rearSeatFold: data.specs.interior.thirdRowFold,
        rearSeatArmrest: data.specs.interior.secondRowArmrest,
        isofixPoints: data.specs.interior.isofixPoints,
        ambientLighting: data.specs.interior.ambientLighting,
        ambientLightingType: data.specs.interior.ambientLightingColors?.toString(),
      },
      create: {
        variantId: variant.id,
        steeringMultifunction: data.specs.interior.steeringMultifunction,
        steeringPowerAssist: data.specs.interior.steeringPowerAssist,
        steeringMaterial: data.specs.interior.steeringMaterial,
        hudDisplay: data.specs.interior.hudDisplay,
        instrumentCluster: data.specs.interior.instrumentCluster,
        rearviewMirrorAutoDim: data.specs.interior.rearviewMirrorAutoDim,
        sideMirrorsFold: data.specs.interior.sideMirrorsFold,
        seatMaterial: data.specs.interior.seatMaterial,
        driverSeatPower: data.specs.interior.driverSeatPower,
        driverSeatAdjustments: data.specs.interior.driverSeatAdjustments,
        driverSeatLumbar: data.specs.interior.driverSeatLumbar,
        driverSeatMemory: data.specs.interior.driverSeatMemory,
        driverSeatVentilation: data.specs.interior.driverSeatVentilation,
        passengerSeatPower: data.specs.interior.passengerSeatPower,
        passengerSeatAdjustments: data.specs.interior.passengerSeatAdjustments,
        welcomeSeat: data.specs.interior.welcomeSeat,
        rearSeatFold: data.specs.interior.thirdRowFold,
        rearSeatArmrest: data.specs.interior.secondRowArmrest,
        isofixPoints: data.specs.interior.isofixPoints,
        ambientLighting: data.specs.interior.ambientLighting,
        ambientLightingType: data.specs.interior.ambientLightingColors?.toString(),
      },
    });
    console.log('      ✅ Created\n');

    // 4.4 Exterior Equipment
    console.log('   🌟 Exterior Equipment...');
    await prisma.nevExterior.upsert({
      where: { variantId: variant.id },
      update: {
        headlightsType: data.specs.exterior.headlightsType,
        headlightsAuto: data.specs.exterior.headlightsAuto,
        headlightsFollowMeHome: data.specs.exterior.headlightsFollowMeHome,
        drlType: data.specs.exterior.drlType,
        taillightsType: data.specs.exterior.taillightsType,
        sunroofType: data.specs.exterior.sunroofType,
        sunroofElectric: data.specs.exterior.sunroofElectric,
        powerTailgate: data.specs.exterior.powerTailgate,
        kickSensorTailgate: data.specs.exterior.kickSensorTailgate,
        sideMirrorsPower: data.specs.exterior.sideMirrorsPower,
        sideMirrorsFold: data.specs.exterior.sideMirrorsFold,
        windowsRearDefrost: data.specs.exterior.windowsRearDefrost,
        wipersFrontAuto: data.specs.exterior.wipersFrontAuto,
        wipersRear: data.specs.exterior.wipersRear,
      },
      create: {
        variantId: variant.id,
        headlightsType: data.specs.exterior.headlightsType,
        headlightsAuto: data.specs.exterior.headlightsAuto,
        headlightsFollowMeHome: data.specs.exterior.headlightsFollowMeHome,
        drlType: data.specs.exterior.drlType,
        taillightsType: data.specs.exterior.taillightsType,
        sunroofType: data.specs.exterior.sunroofType,
        sunroofElectric: data.specs.exterior.sunroofElectric,
        powerTailgate: data.specs.exterior.powerTailgate,
        kickSensorTailgate: data.specs.exterior.kickSensorTailgate,
        sideMirrorsPower: data.specs.exterior.sideMirrorsPower,
        sideMirrorsFold: data.specs.exterior.sideMirrorsFold,
        windowsRearDefrost: data.specs.exterior.windowsRearDefrost,
        wipersFrontAuto: data.specs.exterior.wipersFrontAuto,
        wipersRear: data.specs.exterior.wipersRear,
      },
    });
    console.log('      ✅ Created\n');

    // 4.5 EV Energy Features
    console.log('   ⚡ EV Energy Features...');
    await prisma.nevEVFeatures.upsert({
      where: { variantId: variant.id },
      update: {
        rangeNEDC: data.specs.evFeatures.rangeNEDC,
        rangeWLTP: data.specs.evFeatures.rangeWLTP,
        rangeEPA: data.specs.evFeatures.rangeEPA,
        acChargeType: data.specs.evFeatures.acChargeType,
        acChargeMaxKw: data.specs.evFeatures.acChargeMaxKw,
        dcChargeType: data.specs.evFeatures.dcChargeType,
        dcChargeMaxKw: data.specs.evFeatures.dcChargeMaxKw,
        v2l: data.specs.evFeatures.v2l,
        v2lAccessories: data.specs.evFeatures.v2lAccessories,
        regenerativeBrake: data.specs.evFeatures.regenerativeBrake,
      },
      create: {
        variantId: variant.id,
        rangeNEDC: data.specs.evFeatures.rangeNEDC,
        rangeWLTP: data.specs.evFeatures.rangeWLTP,
        rangeEPA: data.specs.evFeatures.rangeEPA,
        acChargeType: data.specs.evFeatures.acChargeType,
        acChargeMaxKw: data.specs.evFeatures.acChargeMaxKw,
        dcChargeType: data.specs.evFeatures.dcChargeType,
        dcChargeMaxKw: data.specs.evFeatures.dcChargeMaxKw,
        v2l: data.specs.evFeatures.v2l,
        v2lAccessories: data.specs.evFeatures.v2lAccessories,
        regenerativeBrake: data.specs.evFeatures.regenerativeBrake,
      },
    });
    console.log('      ✅ Created\n');

    // 4.6 Battery Details
    console.log('   🔋 Battery Details...');
    await prisma.nevBatteryDetails.upsert({
      where: { variantId: variant.id },
      update: {
        batteryType: data.specs.battery.batteryType,
        batteryKwh: data.specs.battery.batteryKwh,
        batteryVoltage: data.specs.battery.batteryVoltage,
        batteryChemistry: data.specs.battery.batteryChemistry,
      },
      create: {
        variantId: variant.id,
        batteryType: data.specs.battery.batteryType,
        batteryKwh: data.specs.battery.batteryKwh,
        batteryVoltage: data.specs.battery.batteryVoltage,
        batteryChemistry: data.specs.battery.batteryChemistry,
      },
    });
    console.log('      ✅ Created\n');

    // 4.7 Suspension
    console.log('   🔧 Suspension...');
    await prisma.nevSuspension.upsert({
      where: { variantId: variant.id },
      update: {
        frontType: data.specs.suspension.frontType,
        rearType: data.specs.suspension.rearType,
        adaptiveSuspension: data.specs.suspension.adaptiveSuspension ? 'Yes' : null,
      },
      create: {
        variantId: variant.id,
        frontType: data.specs.suspension.frontType,
        rearType: data.specs.suspension.rearType,
        adaptiveSuspension: data.specs.suspension.adaptiveSuspension ? 'Yes' : null,
      },
    });
    console.log('      ✅ Created\n');

    // 4.8 Brake System
    console.log('   🛑 Brake System...');
    await prisma.nevBrakeSystem.upsert({
      where: { variantId: variant.id },
      update: {
        frontBrakeType: data.specs.brakes.frontBrakeType,
        rearBrakeType: data.specs.brakes.rearBrakeType,
        caliperColor: data.specs.brakes.caliperColor,
      },
      create: {
        variantId: variant.id,
        frontBrakeType: data.specs.brakes.frontBrakeType,
        rearBrakeType: data.specs.brakes.rearBrakeType,
        caliperColor: data.specs.brakes.caliperColor,
      },
    });
    console.log('      ✅ Created\n');

    // 4.9 Wheels & Tires
    console.log('   🛞 Wheels & Tires...');
    await prisma.nevWheelsTires.upsert({
      where: { variantId: variant.id },
      update: {
        wheelSizeInch: data.specs.wheels.wheelSizeInch,
        wheelMaterial: data.specs.wheels.wheelMaterial,
        tireSizeFront: data.specs.wheels.tireSizeFront,
        tireSizeRear: data.specs.wheels.tireSizeRear,
        spareTire: data.specs.wheels.spareTire,
        spareType: data.specs.wheels.spareType,
      },
      create: {
        variantId: variant.id,
        wheelSizeInch: data.specs.wheels.wheelSizeInch,
        wheelMaterial: data.specs.wheels.wheelMaterial,
        tireSizeFront: data.specs.wheels.tireSizeFront,
        tireSizeRear: data.specs.wheels.tireSizeRear,
        spareTire: data.specs.wheels.spareTire,
        spareType: data.specs.wheels.spareType,
      },
    });
    console.log('      ✅ Created\n');

    // 4.10 Powertrain & Performance
    console.log('   🚀 Powertrain & Performance...');
    await prisma.nevPowertrain.upsert({
      where: { variantId: variant.id },
      update: {
        drivetrain: data.specs.powertrain.drivetrain,
        frontMotorType: data.specs.powertrain.frontMotorType,
        frontMotorKw: data.specs.powertrain.frontMotorKw,
        frontMotorNm: data.specs.powertrain.frontMotorNm,
        rearMotorType: data.specs.powertrain.rearMotorType,
        rearMotorKw: data.specs.powertrain.rearMotorKw,
        rearMotorNm: data.specs.powertrain.rearMotorNm,
        totalPowerKw: data.specs.powertrain.totalPowerKw,
        totalTorqueNm: data.specs.powertrain.totalTorqueNm,
        accel0100: data.specs.powertrain.accel0100,
        topSpeedKmh: data.specs.powertrain.topSpeedKmh,
      },
      create: {
        variantId: variant.id,
        drivetrain: data.specs.powertrain.drivetrain,
        frontMotorType: data.specs.powertrain.frontMotorType,
        frontMotorKw: data.specs.powertrain.frontMotorKw,
        frontMotorNm: data.specs.powertrain.frontMotorNm,
        rearMotorType: data.specs.powertrain.rearMotorType,
        rearMotorKw: data.specs.powertrain.rearMotorKw,
        rearMotorNm: data.specs.powertrain.rearMotorNm,
        totalPowerKw: data.specs.powertrain.totalPowerKw,
        totalTorqueNm: data.specs.powertrain.totalTorqueNm,
        accel0100: data.specs.powertrain.accel0100,
        topSpeedKmh: data.specs.powertrain.topSpeedKmh,
      },
    });
    console.log('      ✅ Created\n');

    // 4.11 Dimensions & Weight
    console.log('   📐 Dimensions & Weight...');
    await prisma.nevDimensions.upsert({
      where: { variantId: variant.id },
      update: {
        seatingCapacity: data.specs.dimensions.seatingCapacity,
        lengthMm: data.specs.dimensions.lengthMm,
        widthMm: data.specs.dimensions.widthMm,
        heightMm: data.specs.dimensions.heightMm,
        wheelbaseMm: data.specs.dimensions.wheelbaseMm,
        groundClearanceMm: data.specs.dimensions.groundClearanceMm,
        trunkCapacityRearL: data.specs.dimensions.trunkCapacityL,
        curbWeightKg: data.specs.dimensions.curbWeightKg,
        gvwKg: data.specs.dimensions.gvwKg,
      },
      create: {
        variantId: variant.id,
        seatingCapacity: data.specs.dimensions.seatingCapacity,
        lengthMm: data.specs.dimensions.lengthMm,
        widthMm: data.specs.dimensions.widthMm,
        heightMm: data.specs.dimensions.heightMm,
        wheelbaseMm: data.specs.dimensions.wheelbaseMm,
        groundClearanceMm: data.specs.dimensions.groundClearanceMm,
        trunkCapacityRearL: data.specs.dimensions.trunkCapacityL,
        curbWeightKg: data.specs.dimensions.curbWeightKg,
        gvwKg: data.specs.dimensions.gvwKg,
      },
    });
    console.log('      ✅ Created\n');

    // 5. Update Brand Stats
    console.log('📊 Step 5: Updating Brand Stats...');
    const modelCount = await prisma.nevModel.count({
      where: { brandId: brand.id, isActive: true },
    });
    await prisma.nevBrand.update({
      where: { id: brand.id },
      data: { totalModels: modelCount },
    });
    console.log(`   ✅ Updated: ${modelCount} active models\n`);

    // 6. Create Audit Log
    console.log('📝 Step 6: Creating Audit Log...');
    await prisma.nevAuditLog.create({
      data: {
        userId: 'maxus-subagent',
        userName: 'Maxus (Lucus Sub-agent)',
        action: 'import',
        targetType: 'variant',
        targetId: variant.id,
        targetName: variant.fullName,
        changes: JSON.stringify({
          source: data.metadata.source,
          dataCompleteness: data.metadata.dataCompleteness,
        }),
      },
    });
    console.log('   ✅ Audit log created\n');

    // Summary
    console.log('═'.repeat(60));
    console.log('✅ IMPORT COMPLETED SUCCESSFULLY!\n');
    console.log('📊 Summary:');
    console.log(`   Brand: ${brand.name} (${brand.id})`);
    console.log(`   Model: ${model.fullName} (${model.id})`);
    console.log(`   Variant: ${variant.fullName} (${variant.id})`);
    console.log(`   Price: ฿${variant.priceBaht?.toLocaleString()}`);
    console.log(`   Powertrain: ${model.powertrain}`);
    console.log(`   Range: ${variant.rangeKm} km (${variant.rangeStandard})`);
    console.log(`   Battery: ${variant.batteryKwh} kWh`);
    console.log(`   Power: ${variant.motorKw} kW (${variant.motorHp} hp)`);
    console.log(`   Torque: ${variant.torqueNm} Nm`);
    console.log(`   Drivetrain: ${variant.drivetrain}`);
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run import
importWeyG9()
  .then(() => {
    console.log('\n🎉 Script finished successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
