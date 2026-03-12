import { config } from 'dotenv';
config({ path: '.env.local', override: true });
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const connectionString = 'postgresql://postgres.deunlrpkfrinjsqdqvkk:hH%2FR24fxSmM%40xB%2B@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const prisma = new PrismaClient({ datasourceUrl: connectionString });

interface VolvoData {
  brand: string;
  model: string;
  variant: string;
  year: number;
  price_baht: number;
  vehicle_type: string;
  powertrain_performance: any;
  battery_details: any;
  ev_energy_features: any;
  dimensions_weight: any;
  suspension: any;
  brake_system: any;
  wheels_tires: any;
  multimedia_convenience: any;
  interior_equipment: any;
  exterior_equipment: any;
  safety_systems: any;
  platform_technology: any;
  sustainability: any;
  warranty_services: any;
  accessories: any;
  highlights: string[];
  contact: any;
  [key: string]: any;
}

async function main() {
  console.log('🚗 Starting Volvo ES90 Import...\n');

  // อ่าน merged.json
  const jsonPath = '/Users/imodteam/Desktop/NEV-Database/Upload/2026-02-21 Volvo ES90/merged.json';
  const data: VolvoData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  console.log(`📄 Loaded: ${data.brand} ${data.model} ${data.variant}`);
  console.log(`💰 Price: ${data.price_baht.toLocaleString('th-TH')} THB\n`);

  try {
    // ========== 1. Create or Get Brand ==========
    console.log('1️⃣  Creating/Getting Brand: Volvo');
    const brand = await prisma.nevBrand.upsert({
      where: { slug: 'volvo' },
      update: {
        name: 'Volvo',
        nameTh: 'วอลโว่',
        country: 'Sweden',
        website: 'https://www.volvocars.com/th',
        isActive: true,
      },
      create: {
        name: 'Volvo',
        nameTh: 'วอลโว่',
        slug: 'volvo',
        country: 'Sweden',
        website: 'https://www.volvocars.com/th',
        totalModels: 0,
        isActive: true,
      },
    });
    console.log(`   ✅ Brand ID: ${brand.id}\n`);

    // ========== 2. Create or Get Model ==========
    console.log('2️⃣  Creating/Getting Model: ES90');
    const modelSlug = 'volvo-es90';
    const nevModel = await prisma.nevModel.upsert({
      where: { slug: modelSlug },
      update: {
        name: 'ES90',
        nameTh: 'อีเอส90',
        fullName: 'Volvo ES90',
        year: data.year,
        bodyType: 'Fastback Sedan',
        segment: 'E',
        seats: 5,
        powertrain: 'BEV',
        assembly: 'CBU',
        madeIn: 'China',
        overview: 'Volvo ES90 รถยนต์ไฟฟ้าพรีเมียมสไตล์สแกนดิเนเวียนที่ผสานความหรูหราของซีดาน ความเอนกประสงค์ของ Fastback และสมรรถนะการขับขี่แบบ SUV เข้าไว้ด้วยกัน',
        highlights: data.highlights || [],
        isActive: true,
        isNewModel: true,
        launchDate: new Date('2026-02-21'),
      },
      create: {
        brandId: brand.id,
        name: 'ES90',
        nameTh: 'อีเอส90',
        slug: modelSlug,
        fullName: 'Volvo ES90',
        year: data.year,
        bodyType: 'Fastback Sedan',
        segment: 'E',
        seats: 5,
        powertrain: 'BEV',
        assembly: 'CBU',
        madeIn: 'China',
        overview: 'Volvo ES90 รถยนต์ไฟฟ้าพรีเมียมสไตล์สแกนดิเนเวียนที่ผสานความหรูหราของซีดาน ความเอนกประสงค์ของ Fastback และสมรรถนะการขับขี่แบบ SUV เข้าไว้ด้วยกัน',
        highlights: data.highlights || [],
        isActive: true,
        isNewModel: true,
        launchDate: new Date('2026-02-21'),
      },
    });
    console.log(`   ✅ Model ID: ${nevModel.id}\n`);

    // ========== 3. Create or Get Variant ==========
    console.log('3️⃣  Creating/Getting Variant: Ultra Single Motor Extended Range');
    const variantSlug = 'volvo-es90-ultra-single-motor';
    const variant = await prisma.nevVariant.upsert({
      where: { slug: variantSlug },
      update: {
        name: 'Ultra Single Motor Extended Range',
        fullName: 'Volvo ES90 Ultra Single Motor Extended Range',
        priceBaht: data.price_baht,
        batteryKwh: data.battery_details.usable_capacity_kwh,
        rangeKm: data.ev_energy_features.range_km,
        rangeStandard: 'NEDC',
        motorCount: 1,
        motorKw: data.powertrain_performance.max_power_kw,
        motorHp: data.powertrain_performance.max_power_hp,
        torqueNm: data.powertrain_performance.max_torque_nm,
        topSpeedKmh: data.powertrain_performance.top_speed_kmh,
        accel0100: parseFloat(data.powertrain_performance.acceleration_0_100.split(' ')[0]),
        drivetrain: 'RWD',
        dcChargeKw: data.ev_energy_features.charging.max_dc_fast_charge_kw,
        dcChargeMin: 20, // 10-80% in ~20 min
        acChargeKw: 11,
        chargePort: 'CCS2',
        lengthMm: data.dimensions_weight.length_mm,
        widthMm: data.dimensions_weight.width_mm,
        heightMm: data.dimensions_weight.height_mm,
      },
      create: {
        modelId: nevModel.id,
        name: 'Ultra Single Motor Extended Range',
        fullName: 'Volvo ES90 Ultra Single Motor Extended Range',
        slug: variantSlug,
        priceBaht: data.price_baht,
        batteryKwh: data.battery_details.usable_capacity_kwh,
        rangeKm: data.ev_energy_features.range_km,
        rangeStandard: 'NEDC',
        motorCount: 1,
        motorKw: data.powertrain_performance.max_power_kw,
        motorHp: data.powertrain_performance.max_power_hp,
        torqueNm: data.powertrain_performance.max_torque_nm,
        topSpeedKmh: data.powertrain_performance.top_speed_kmh,
        accel0100: parseFloat(data.powertrain_performance.acceleration_0_100.split(' ')[0]),
        drivetrain: 'RWD',
        dcChargeKw: data.ev_energy_features.charging.max_dc_fast_charge_kw,
        dcChargeMin: 20,
        acChargeKw: 11,
        chargePort: 'CCS2',
        lengthMm: data.dimensions_weight.length_mm,
        widthMm: data.dimensions_weight.width_mm,
        heightMm: data.dimensions_weight.height_mm,
      },
    });
    console.log(`   ✅ Variant ID: ${variant.id}\n`);

    // ========== 4. Multimedia & Convenience ==========
    console.log('4️⃣  Importing Multimedia & Convenience');
    await prisma.nevMultimedia.upsert({
      where: { variantId: variant.id },
      update: {
        displaySize: 14.5,
        displayType: 'Touch Screen',
        displayResolution: null,
        bluetooth: true,
        appleCarPlay: true,
        androidAuto: true,
        audioSystem: 'Bowers & Wilkins Premium Sound',
        speakerCount: 25,
        voiceControl: true,
        voiceLanguages: 'Thai, English',
        navigation: true,
        musicStreaming: true,
        usbCFront: 2,
        usbCRear: 2,
        wirelessCharging: true,
        wirelessChargingWatt: 15,
        otaUpdate: true,
        keylessEntry: true,
        keylessStart: true,
        digitalKey: true,
        climateZones: 4,
        rearVents: true,
        ionizer: false,
        pm25Filter: true,
        pm25FilterType: 'Advanced Air Cleaner - 95% PM2.5 filtration',
      },
      create: {
        variantId: variant.id,
        displaySize: 14.5,
        displayType: 'Touch Screen',
        displayResolution: null,
        bluetooth: true,
        appleCarPlay: true,
        androidAuto: true,
        audioSystem: 'Bowers & Wilkins Premium Sound',
        speakerCount: 25,
        voiceControl: true,
        voiceLanguages: 'Thai, English',
        navigation: true,
        musicStreaming: true,
        usbCFront: 2,
        usbCRear: 2,
        wirelessCharging: true,
        wirelessChargingWatt: 15,
        otaUpdate: true,
        keylessEntry: true,
        keylessStart: true,
        digitalKey: true,
        climateZones: 4,
        rearVents: true,
        ionizer: false,
        pm25Filter: true,
        pm25FilterType: 'Advanced Air Cleaner - 95% PM2.5 filtration',
      },
    });
    console.log('   ✅ Multimedia imported\n');

    // ========== 5. Safety Systems ==========
    console.log('5️⃣  Importing Safety Systems (ADAS)');
    await prisma.nevSafety.upsert({
      where: { variantId: variant.id },
      update: {
        airbagsFront: 2,
        airbagsSide: 4,
        airbagsCurtain: true,
        airbagsCenter: false,
        airbagsRearSide: false,
        seatbeltPretensioner: true,
        seatbeltReminderFront: true,
        seatbeltReminderRear: true,
        childLockElectric: true,
        camera360: true,
        parkingSensorsFront: 4,
        parkingSensorsRear: 4,
        esc: true,
        tcs: true,
        ebd: true,
        hhc: true,
        avh: true,
        adaptiveCruise: true,
        intelligentCruise: false,
        trafficSignRecog: true,
        speedLimitAlert: true,
        speedLimitControl: false,
        autoEmergencyBrake: true,
        forwardCollisionWarn: true,
        rearCollisionWarn: true,
        laneDepartureWarn: true,
        laneKeepAssist: true,
        emergencyLaneKeep: true,
        frontCrossTrafficAlert: false,
        frontCrossTrafficBrake: false,
        rearCrossTrafficAlert: true,
        rearCrossTrafficBrake: true,
        autoHighBeam: true,
        blindSpotDetection: true,
        doorOpenWarning: true,
        driverMonitoring: true,
        tpms: true,
        itac: false,
      },
      create: {
        variantId: variant.id,
        airbagsFront: 2,
        airbagsSide: 4,
        airbagsCurtain: true,
        airbagsCenter: false,
        airbagsRearSide: false,
        seatbeltPretensioner: true,
        seatbeltReminderFront: true,
        seatbeltReminderRear: true,
        childLockElectric: true,
        camera360: true,
        parkingSensorsFront: 4,
        parkingSensorsRear: 4,
        esc: true,
        tcs: true,
        ebd: true,
        hhc: true,
        avh: true,
        adaptiveCruise: true,
        intelligentCruise: false,
        trafficSignRecog: true,
        speedLimitAlert: true,
        speedLimitControl: false,
        autoEmergencyBrake: true,
        forwardCollisionWarn: true,
        rearCollisionWarn: true,
        laneDepartureWarn: true,
        laneKeepAssist: true,
        emergencyLaneKeep: true,
        frontCrossTrafficAlert: false,
        frontCrossTrafficBrake: false,
        rearCrossTrafficAlert: true,
        rearCrossTrafficBrake: true,
        autoHighBeam: true,
        blindSpotDetection: true,
        doorOpenWarning: true,
        driverMonitoring: true,
        tpms: true,
        itac: false,
      },
    });
    console.log('   ✅ Safety Systems imported\n');

    // ========== 6. Interior Equipment ==========
    console.log('6️⃣  Importing Interior Equipment');
    await prisma.nevInterior.upsert({
      where: { variantId: variant.id },
      update: {
        steeringMultifunction: true,
        steeringPowerAssist: 'Electric',
        steeringMaterial: 'Leather',
        hudDisplay: true,
        instrumentCluster: 'Digital 9-inch',
        rearviewMirrorAutoDim: true,
        sideMirrorsAutoDim: true,
        sideMirrorsFold: true,
        sideMirrorsHeated: true,
        sideMirrorsMemory: true,
        sideMirrorsAutoTilt: false,
        seatMaterial: 'Ventilated Nappa Leather',
        driverSeatPower: true,
        driverSeatAdjustments: 10,
        driverSeatLumbar: true,
        driverSeatMemory: false,
        driverSeatVentilation: true,
        passengerSeatPower: true,
        passengerSeatAdjustments: 8,
        welcomeSeat: false,
        rearSeatFold: '40/20/40',
        rearSeatArmrest: true,
        rearSeatCupholders: 2,
        isofixPoints: 2,
        sunglassHolder: true,
        cupholdersFront: 2,
        vanityMirrors: true,
        ambientLighting: true,
        ambientLightingType: 'LED with FSC-certified wood panels',
        readingLightsFront: 2,
        readingLightsRear: 2,
        trunkLight: true,
      },
      create: {
        variantId: variant.id,
        steeringMultifunction: true,
        steeringPowerAssist: 'Electric',
        steeringMaterial: 'Leather',
        hudDisplay: true,
        instrumentCluster: 'Digital 9-inch',
        rearviewMirrorAutoDim: true,
        sideMirrorsAutoDim: true,
        sideMirrorsFold: true,
        sideMirrorsHeated: true,
        sideMirrorsMemory: true,
        sideMirrorsAutoTilt: false,
        seatMaterial: 'Ventilated Nappa Leather',
        driverSeatPower: true,
        driverSeatAdjustments: 10,
        driverSeatLumbar: true,
        driverSeatMemory: false,
        driverSeatVentilation: true,
        passengerSeatPower: true,
        passengerSeatAdjustments: 8,
        welcomeSeat: false,
        rearSeatFold: '40/20/40',
        rearSeatArmrest: true,
        rearSeatCupholders: 2,
        isofixPoints: 2,
        sunglassHolder: true,
        cupholdersFront: 2,
        vanityMirrors: true,
        ambientLighting: true,
        ambientLightingType: 'LED with FSC-certified wood panels',
        readingLightsFront: 2,
        readingLightsRear: 2,
        trunkLight: true,
      },
    });
    console.log('   ✅ Interior Equipment imported\n');

    // ========== 7. Exterior Equipment ==========
    console.log('7️⃣  Importing Exterior Equipment');
    await prisma.nevExterior.upsert({
      where: { variantId: variant.id },
      update: {
        headlightsType: 'LED HD Pixel (20,000 LEDs)',
        headlightsAuto: true,
        headlightsFollowMeHome: true,
        drlType: 'LED Thor\'s Hammer',
        taillightsType: 'LED C-shaped',
        rearFogLights: true,
        turnSignalsSequential: false,
        thirdBrakeLight: true,
        thirdBrakeLightType: 'LED',
        sunroofType: 'Panoramic Electrochromic',
        sunroofElectric: true,
        sunroofCurtain: false,
        doorHandlesRetractable: true,
        powerTailgate: true,
        kickSensorTailgate: false,
        sideMirrorsPower: true,
        sideMirrorsFold: true,
        sideMirrorsHeated: true,
        sideMirrorsMemory: true,
        sideMirrorsAutoTilt: false,
        windowsFrontLaminated: true,
        windowsRearPrivacy: true,
        windowsRearDefrost: true,
        wipersFrontAuto: true,
        wipersRear: true,
      },
      create: {
        variantId: variant.id,
        headlightsType: 'LED HD Pixel (20,000 LEDs)',
        headlightsAuto: true,
        headlightsFollowMeHome: true,
        drlType: 'LED Thor\'s Hammer',
        taillightsType: 'LED C-shaped',
        rearFogLights: true,
        turnSignalsSequential: false,
        thirdBrakeLight: true,
        thirdBrakeLightType: 'LED',
        sunroofType: 'Panoramic Electrochromic',
        sunroofElectric: true,
        sunroofCurtain: false,
        doorHandlesRetractable: true,
        powerTailgate: true,
        kickSensorTailgate: false,
        sideMirrorsPower: true,
        sideMirrorsFold: true,
        sideMirrorsHeated: true,
        sideMirrorsMemory: true,
        sideMirrorsAutoTilt: false,
        windowsFrontLaminated: true,
        windowsRearPrivacy: true,
        windowsRearDefrost: true,
        wipersFrontAuto: true,
        wipersRear: true,
      },
    });
    console.log('   ✅ Exterior Equipment imported\n');

    // ========== 8. EV Energy Features ==========
    console.log('8️⃣  Importing EV Energy Features');
    await prisma.nevEVFeatures.upsert({
      where: { variantId: variant.id },
      update: {
        rangeNEDC: data.ev_energy_features.range_km,
        rangeWLTP: null,
        rangeEPA: null,
        chargerMode2: false,
        acChargeType: 'Type 2',
        acChargeMaxKw: 11,
        dcChargeType: 'CCS2',
        dcChargeMaxKw: data.ev_energy_features.charging.max_dc_fast_charge_kw,
        dcCharge10to80Min: 20,
        v2l: false,
        v2lAccessories: false,
        regenerativeBrake: true,
      },
      create: {
        variantId: variant.id,
        rangeNEDC: data.ev_energy_features.range_km,
        rangeWLTP: null,
        rangeEPA: null,
        chargerMode2: false,
        acChargeType: 'Type 2',
        acChargeMaxKw: 11,
        dcChargeType: 'CCS2',
        dcChargeMaxKw: data.ev_energy_features.charging.max_dc_fast_charge_kw,
        dcCharge10to80Min: 20,
        v2l: false,
        v2lAccessories: false,
        regenerativeBrake: true,
      },
    });
    console.log('   ✅ EV Energy Features imported\n');

    // ========== 9. Battery Details ==========
    console.log('9️⃣  Importing Battery Details');
    await prisma.nevBatteryDetails.upsert({
      where: { variantId: variant.id },
      update: {
        batteryType: data.battery_details.battery_type,
        batteryKwh: data.battery_details.usable_capacity_kwh,
        batteryVoltage: data.battery_details.architecture_voltage,
        batteryChemistry: 'NMC',
      },
      create: {
        variantId: variant.id,
        batteryType: data.battery_details.battery_type,
        batteryKwh: data.battery_details.usable_capacity_kwh,
        batteryVoltage: data.battery_details.architecture_voltage,
        batteryChemistry: 'NMC',
      },
    });
    console.log('   ✅ Battery Details imported\n');

    // ========== 10. Suspension ==========
    console.log('🔟 Importing Suspension');
    await prisma.nevSuspension.upsert({
      where: { variantId: variant.id },
      update: {
        frontType: 'Air Suspension',
        rearType: 'Air Suspension',
        adaptiveSuspension: 'Four-C Active Chassis',
        adaptiveFrontRear: 'Both',
      },
      create: {
        variantId: variant.id,
        frontType: 'Air Suspension',
        rearType: 'Air Suspension',
        adaptiveSuspension: 'Four-C Active Chassis',
        adaptiveFrontRear: 'Both',
      },
    });
    console.log('   ✅ Suspension imported\n');

    // ========== 11. Brake System ==========
    console.log('1️⃣1️⃣  Importing Brake System');
    await prisma.nevBrakeSystem.upsert({
      where: { variantId: variant.id },
      update: {
        frontBrakeType: 'Disc',
        rearBrakeType: 'Disc',
        caliperColor: null,
      },
      create: {
        variantId: variant.id,
        frontBrakeType: 'Disc',
        rearBrakeType: 'Disc',
        caliperColor: null,
      },
    });
    console.log('   ✅ Brake System imported\n');

    // ========== 12. Wheels & Tires ==========
    console.log('1️⃣2️⃣  Importing Wheels & Tires');
    await prisma.nevWheelsTires.upsert({
      where: { variantId: variant.id },
      update: {
        wheelSizeInch: data.wheels_tires.wheel_size_inch,
        wheelMaterial: 'Alloy',
        tireSizeFront: data.wheels_tires.front_tire_size,
        tireSizeRear: data.wheels_tires.rear_tire_size,
        spareTire: false,
        spareType: null,
      },
      create: {
        variantId: variant.id,
        wheelSizeInch: data.wheels_tires.wheel_size_inch,
        wheelMaterial: 'Alloy',
        tireSizeFront: data.wheels_tires.front_tire_size,
        tireSizeRear: data.wheels_tires.rear_tire_size,
        spareTire: false,
        spareType: null,
      },
    });
    console.log('   ✅ Wheels & Tires imported\n');

    // ========== 13. Powertrain & Performance ==========
    console.log('1️⃣3️⃣  Importing Powertrain & Performance');
    await prisma.nevPowertrain.upsert({
      where: { variantId: variant.id },
      update: {
        drivetrain: 'RWD',
        frontMotorType: null,
        frontMotorKw: null,
        frontMotorNm: null,
        rearMotorType: 'Permanent Magnet Synchronous',
        rearMotorKw: data.powertrain_performance.max_power_kw,
        rearMotorNm: data.powertrain_performance.max_torque_nm,
        totalPowerKw: data.powertrain_performance.max_power_kw,
        totalTorqueNm: data.powertrain_performance.max_torque_nm,
        accel0100: parseFloat(data.powertrain_performance.acceleration_0_100.split(' ')[0]),
        topSpeedKmh: data.powertrain_performance.top_speed_kmh,
      },
      create: {
        variantId: variant.id,
        drivetrain: 'RWD',
        frontMotorType: null,
        frontMotorKw: null,
        frontMotorNm: null,
        rearMotorType: 'Permanent Magnet Synchronous',
        rearMotorKw: data.powertrain_performance.max_power_kw,
        rearMotorNm: data.powertrain_performance.max_torque_nm,
        totalPowerKw: data.powertrain_performance.max_power_kw,
        totalTorqueNm: data.powertrain_performance.max_torque_nm,
        accel0100: parseFloat(data.powertrain_performance.acceleration_0_100.split(' ')[0]),
        topSpeedKmh: data.powertrain_performance.top_speed_kmh,
      },
    });
    console.log('   ✅ Powertrain & Performance imported\n');

    // ========== 14. Dimensions & Weight ==========
    console.log('1️⃣4️⃣  Importing Dimensions & Weight');
    await prisma.nevDimensions.upsert({
      where: { variantId: variant.id },
      update: {
        seatingCapacity: 5,
        lengthMm: data.dimensions_weight.length_mm,
        widthMm: data.dimensions_weight.width_mm,
        heightMm: data.dimensions_weight.height_mm,
        wheelbaseMm: data.dimensions_weight.wheelbase_mm,
        groundClearanceMm: data.dimensions_weight.ground_clearance_mm,
        groundClearanceLoadedMm: null,
        turningRadiusM: data.wheels_tires.min_turning_circle_m,
        trunkCapacityFrontL: data.dimensions_weight.frunk_capacity_liters,
        trunkCapacityRearL: data.dimensions_weight.trunk_capacity_liters,
        curbWeightKg: null,
        gvwKg: null,
      },
      create: {
        variantId: variant.id,
        seatingCapacity: 5,
        lengthMm: data.dimensions_weight.length_mm,
        widthMm: data.dimensions_weight.width_mm,
        heightMm: data.dimensions_weight.height_mm,
        wheelbaseMm: data.dimensions_weight.wheelbase_mm,
        groundClearanceMm: data.dimensions_weight.ground_clearance_mm,
        groundClearanceLoadedMm: null,
        turningRadiusM: data.wheels_tires.min_turning_circle_m,
        trunkCapacityFrontL: data.dimensions_weight.frunk_capacity_liters,
        trunkCapacityRearL: data.dimensions_weight.trunk_capacity_liters,
        curbWeightKg: null,
        gvwKg: null,
      },
    });
    console.log('   ✅ Dimensions & Weight imported\n');

    // ========== Summary ==========
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ IMPORT COMPLETED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`🚗 Vehicle: ${data.brand} ${data.model} ${data.variant}`);
    console.log(`💰 Price: ${data.price_baht.toLocaleString('th-TH')} THB`);
    console.log(`🔋 Battery: ${data.battery_details.usable_capacity_kwh} kWh (${data.battery_details.architecture_voltage}V)`);
    console.log(`⚡ Power: ${data.powertrain_performance.max_power_hp} hp / ${data.powertrain_performance.max_torque_nm} Nm`);
    console.log(`🏁 0-100 km/h: ${data.powertrain_performance.acceleration_0_100}`);
    console.log(`📏 Range: ${data.ev_energy_features.range_km} km (NEDC)`);
    console.log(`⚙️  Drivetrain: RWD`);
    console.log(`🔌 DC Fast Charge: ${data.ev_energy_features.charging.max_dc_fast_charge_kw} kW (10-80% in ~20 min)\n`);
    console.log(`🆔 Brand ID: ${brand.id}`);
    console.log(`🆔 Model ID: ${nevModel.id}`);
    console.log(`🆔 Variant ID: ${variant.id}\n`);

  } catch (error) {
    console.error('❌ ERROR:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
