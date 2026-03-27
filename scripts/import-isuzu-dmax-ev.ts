#!/usr/bin/env npx tsx
/**
 * Import ISUZU D-MAX EV to NEV Database
 * Source: PDF Brochure (March 2026)
 */

import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('🚀 Starting ISUZU D-MAX EV import...\n');

  // 1. Upsert Brand
  const brand = await prisma.nevBrand.upsert({
    where: { slug: 'isuzu' },
    update: {},
    create: {
      name: 'ISUZU',
      nameTh: 'อีซูซุ',
      slug: 'isuzu',
      country: 'Japan',
      logoUrl: null,
      website: 'https://www.isuzu.co.th',
      isActive: true,
    },
  });
  console.log(`✅ Brand: ${brand.name} (${brand.id})`);

  // 2. Upsert Model
  const model = await prisma.nevModel.upsert({
    where: { slug: 'isuzu-d-max-ev' },
    update: {},
    create: {
      brandId: brand.id,
      name: 'D-MAX EV',
      nameTh: 'ดีแมกซ์ อีวี',
      slug: 'isuzu-d-max-ev',
      fullName: 'ISUZU D-MAX EV',
      year: 2026,
      bodyType: 'Pickup Truck',
      seats: 5,
      powertrain: 'BEV',
      segment: 'Pickup',
      overview: 'ปิกอัพไฟฟ้า 100% มาพร้อมระบบขับเคลื่อน Dual Motor by E-Axle และช่วงล่าง De-Dion พร้อมลีฟสปริง คงความแข็งแกร่งและทนทานในแบบ ISUZU รองรับการใช้งานจริงไม่ต่างจาก D-MAX ดีเซล',
      madeIn: 'Japan',
      assembly: 'Thailand',
      isActive: true,
      isNewModel: true,
    },
  });
  console.log(`✅ Model: ${model.name} (${model.id})\n`);

  // 3. Upsert Variant
  const variant = await prisma.nevVariant.upsert({
    where: { slug: 'isuzu-d-max-ev-4-door' },
    update: {},
    create: {
      modelId: model.id,
      name: '4 Door',
      fullName: 'ISUZU D-MAX EV 4 Door',
      slug: 'isuzu-d-max-ev-4-door',
      
      // Basic specs
      priceBaht: null, // ยังไม่ประกาศราคา
      batteryKwh: 66.9,
      rangeKm: 331,
      rangeStandard: 'NEDC',
      motorCount: 2,
      motorKw: 140,
      motorHp: 190,
      torqueNm: 325,
      drivetrain: 'AWD',
      accel0100: null,
      topSpeedKmh: null,
      
      // Charging
      dcChargeKw: 50,
      dcChargeMin: 60, // 20-80%
      acChargeKw: 11,
      chargePort: 'CCS2 + Type 2',
      
      // Dimensions
      lengthMm: 5280,
      widthMm: 1870,
      heightMm: 1790,
      wheelbaseMm: 3125,
      groundClearanceMm: 260,
      curbWeightKg: 2335,
      grossWeightKg: null,
      trunkLitres: null, // ปิกอัพไม่มี trunk (มีกระบะ)
      
      // Status
      isActive: true,
      isBestSeller: false,
      dataSource: 'pdf-brochure',
      hasV2l: false,
    },
  });
  console.log(`✅ Variant: ${variant.name} (${variant.id})\n`);

  // 4. Create detailed specs
  console.log('📦 Creating detailed specs (11 categories)...\n');

  // Powertrain
  await prisma.nevPowertrain.upsert({
    where: { variantId: variant.id },
    update: {},
    create: {
      variantId: variant.id,
      drivetrain: 'AWD',
      frontMotorType: 'Permanent Magnet Synchronous Motor',
      frontMotorKw: 43,
      frontMotorNm: 108,
      rearMotorType: 'Permanent Magnet Synchronous Motor',
      rearMotorKw: 97,
      rearMotorNm: 217,
      totalPowerKw: 140,
      totalTorqueNm: 325,
      accel0100: null,
      topSpeedKmh: null,
    },
  });

  // Battery
  await prisma.nevBatteryDetails.upsert({
    where: { variantId: variant.id },
    update: {},
    create: {
      variantId: variant.id,
      batteryType: 'Lithium-ion',
      batteryKwh: 66.9,
      batteryVoltage: 350,
      batteryChemistry: null,
    },
  });

  // EV Features
  await prisma.nevEVFeatures.upsert({
    where: { variantId: variant.id },
    update: {},
    create: {
      variantId: variant.id,
      rangeNEDC: 331,
      rangeWLTP: null,
      rangeEPA: null,
      acChargeType: 'Type 2',
      acChargeMaxKw: 11,
      dcChargeType: 'CCS2',
      dcChargeMaxKw: 50,
      dcCharge10to80Min: 60, // 20-80%
      v2l: false,
      regenerativeBrake: true, // 4 ระดับ
    },
  });

  // Dimensions
  await prisma.nevDimensions.upsert({
    where: { variantId: variant.id },
    update: {},
    create: {
      variantId: variant.id,
      seatingCapacity: 5,
      lengthMm: 5280,
      widthMm: 1870,
      heightMm: 1790,
      wheelbaseMm: 3125,
      groundClearanceMm: 260,
      curbWeightKg: 2335,
      gvwKg: null,
      trunkCapacityRearL: null, // Pickup bed: 1,495 x 1,530 x 490 mm
      turningRadiusM: 6.1,
    },
  });

  // Suspension
  await prisma.nevSuspension.upsert({
    where: { variantId: variant.id },
    update: {},
    create: {
      variantId: variant.id,
      frontType: 'Double Wishbone + Coil Spring + Stabilizer',
      rearType: 'De-Dion + Leaf Spring',
      adaptiveSuspension: null,
    },
  });

  // Brake System
  await prisma.nevBrakeSystem.upsert({
    where: { variantId: variant.id },
    update: {},
    create: {
      variantId: variant.id,
      frontBrakeType: 'Ventilated Disc',
      rearBrakeType: 'Drum',
      caliperColor: null,
    },
  });

  // Wheels & Tires
  await prisma.nevWheelsTires.upsert({
    where: { variantId: variant.id },
    update: {},
    create: {
      variantId: variant.id,
      wheelSizeInch: 18,
      wheelMaterial: 'Alloy (Two-Tone)',
      tireSizeFront: '265/60R18',
      tireSizeRear: '265/60R18',
      spareTire: true,
      spareType: 'Steel Rim 18"',
    },
  });

  // Safety
  await prisma.nevSafety.upsert({
    where: { variantId: variant.id },
    update: {},
    create: {
      variantId: variant.id,
      airbagsFront: 2,
      airbagsSide: 2,
      airbagsCurtain: true,
      camera360: true, // พร้อมมุมมองใต้ท้องรถ
      parkingSensorsFront: 4,
      parkingSensorsRear: 4,
      esc: true,
      tcs: true,
      ebd: true,
      adaptiveCruise: true, // Full Speed Range ACC
      autoEmergencyBrake: true, // AEB
      forwardCollisionWarn: true, // FCW
      laneDepartureWarn: true, // LDW
      laneKeepAssist: true, // LKAS + LDP + ELK
      blindSpotDetection: true, // BSM
      rearCrossTrafficAlert: true, // RCTA + RCTB
      driverMonitoring: true, // Attention Assist
      tpms: true,
      hhc: true, // Hill Start Assist
      avh: false,
    },
  });

  // Multimedia
  await prisma.nevMultimedia.upsert({
    where: { variantId: variant.id },
    update: {},
    create: {
      variantId: variant.id,
      displaySize: 9,
      displayType: 'Touchscreen',
      appleCarPlay: true, // Wireless
      androidAuto: true, // Wireless
      audioSystem: 'Standard',
      speakerCount: 8,
      voiceControl: false,
      navigation: false,
      wirelessCharging: false,
      climateZones: 2, // Dual Zone
      rearVents: true,
      pm25Filter: true,
      usbCFront: 2, // 3A
      usbCRear: 0,
    },
  });

  // Interior
  await prisma.nevInterior.upsert({
    where: { variantId: variant.id },
    update: {},
    create: {
      variantId: variant.id,
      seatMaterial: 'COOLMAX Synthetic Leather',
      driverSeatPower: true, // 8-way
      driverSeatAdjustments: 8,
      driverSeatVentilation: false,
      driverSeatMemory: false,
      hudDisplay: false,
      rearviewMirrorAutoDim: true,
      sideMirrorsFold: true, // Power fold
      ambientLighting: false,
      isofixPoints: 2,
    },
  });

  // Exterior
  await prisma.nevExterior.upsert({
    where: { variantId: variant.id },
    update: {},
    create: {
      variantId: variant.id,
      headlightsType: 'Bi-Beam LED Projector',
      headlightsAuto: true, // Auto on/off + AHB
      drlType: 'LED',
      taillightsType: 'LED',
      sunroofType: null,
      powerTailgate: false, // Pickup truck
      kickSensorTailgate: false,
      doorHandlesRetractable: false,
    },
  });

  console.log('✅ All 11 categories created!\n');

  // Summary
  console.log('📊 Import Summary:');
  console.log(`   Brand: ISUZU`);
  console.log(`   Model: D-MAX EV`);
  console.log(`   Variants: 1 (4 Door)`);
  console.log(`   Categories: 11 (complete)`);
  console.log('\n✅ Import complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
