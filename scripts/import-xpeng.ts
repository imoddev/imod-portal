import { config } from 'dotenv';
config({ path: '.env.local', override: true });

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const connectionString = 'postgresql://postgres.deunlrpkfrinjsqdqvkk:hH%2FR24fxSmM%40xB%2B@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const prisma = new PrismaClient({ datasourceUrl: connectionString });

interface XPengData {
  brand: string;
  models: any[];
  metadata: any;
}

async function main() {
  console.log('🚗 XPeng Import Script Starting...\n');

  // Read merged.json
  const dataPath = '/Users/imodteam/Desktop/NEV-Database/Upload/2026-02-22 XPeng Brochure/merged.json';
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const data: XPengData = JSON.parse(rawData);

  console.log(`📦 Data loaded: ${data.models.length} models, ${data.metadata.total_variants} variants\n`);

  // 1. Ensure Brand exists
  console.log('🏢 Checking brand: XPeng...');
  let brand = await prisma.nevBrand.findUnique({
    where: { slug: 'xpeng' }
  });

  if (!brand) {
    console.log('   Creating XPeng brand...');
    brand = await prisma.nevBrand.create({
      data: {
        name: 'XPeng',
        nameTh: 'เสี่ยวเผิง',
        slug: 'xpeng',
        country: 'China',
        website: 'https://www.xiaopeng.com',
        isActive: true
      }
    });
    console.log(`   ✅ Brand created: ${brand.name} (${brand.id})`);
  } else {
    console.log(`   ✅ Brand exists: ${brand.name} (${brand.id})`);
  }

  // 2. Import each model
  for (const modelData of data.models) {
    const modelName = modelData.model;
    console.log(`\n📱 Processing model: ${modelName}...`);

    // Check if model exists
    let model = await prisma.nevModel.findUnique({
      where: { slug: `xpeng-${modelName.toLowerCase()}` }
    });

    const bodyType = modelName === 'G6' ? 'SUV' : 
                     modelName === 'X9' ? 'MPV' : 'Unknown';

    const seats = modelName === 'X9' ? 7 : 5;

    if (!model) {
      console.log(`   Creating model ${modelName}...`);
      model = await prisma.nevModel.create({
        data: {
          brandId: brand.id,
          name: modelName,
          nameTh: modelName === 'G6' ? 'จี6' : modelName === 'X9' ? 'เอ็กซ์9' : modelName,
          slug: `xpeng-${modelName.toLowerCase()}`,
          fullName: `XPeng ${modelName}`,
          year: 2025,
          bodyType,
          seats,
          powertrain: 'BEV',
          assembly: 'CBU',
          madeIn: 'China',
          isActive: true,
          isNewModel: true
        }
      });
      console.log(`   ✅ Model created: ${model.name} (${model.id})`);
    } else {
      console.log(`   ✅ Model exists: ${model.name} (${model.id})`);
    }

    // 3. Import variants
    for (const variantData of modelData.variants) {
      const variantName = variantData.variant;
      const slug = `xpeng-${modelName.toLowerCase()}-${variantName.toLowerCase().replace(/\\s+/g, '-')}`;

      console.log(`\n   🔧 Processing variant: ${variantName}...`);

      // Check if variant exists
      let variant = await prisma.nevVariant.findUnique({
        where: { slug }
      });

      const variantPayload = {
        modelId: model.id,
        name: variantName,
        fullName: `XPeng ${modelName} ${variantName}`,
        slug,
        batteryKwh: variantData.battery?.capacity_kwh || null,
        rangeKm: variantData.range?.wltp_km || variantData.range?.nedc_km || null,
        rangeStandard: variantData.range?.wltp_km ? 'WLTP' : 'NEDC',
        motorCount: variantData.powertrain?.motors || 1,
        motorKw: variantData.powertrain?.max_power_kw || null,
        motorHp: variantData.powertrain?.max_power_ps || null,
        torqueNm: variantData.powertrain?.max_torque_nm || null,
        topSpeedKmh: variantData.powertrain?.max_speed_kmh || null,
        accel0100: variantData.powertrain?.acceleration_0_100_s || null,
        drivetrain: variantData.drivetrain || variantData.powertrain?.drivetrain || null,
        dcChargeKw: variantData.charging?.dc_max_kw || null,
        dcChargeMin: variantData.charging?.dc_time_10_80_min || null,
        acChargeKw: variantData.charging?.ac_max_kw || null,
        lengthMm: variantData.dimensions?.length_mm || null,
        widthMm: variantData.dimensions?.width_mm || null,
        heightMm: variantData.dimensions?.height_mm || null,
        wheelbaseMm: variantData.dimensions?.wheelbase_mm || null,
        groundClearanceMm: null,
        curbWeightKg: variantData.dimensions?.curb_weight_kg || null,
        grossWeightKg: null,
        trunkLitres: null,
        hasV2l: variantData.charging?.v2l || false,
        v2lKw: variantData.charging?.v2l_power_kw || null,
        warrantyVehicle: variantData.warranty ? `${variantData.warranty.product_years} ปี / ${variantData.warranty.product_km.toLocaleString()} กม.` : null,
        warrantyBattery: variantData.warranty ? `${variantData.warranty.battery_motor_years} ปี / ${variantData.warranty.battery_motor_km.toLocaleString()} กม.` : null,
        isActive: true,
        dataSource: 'xpeng-brochure-import',
        lastVerified: new Date()
      };

      if (!variant) {
        console.log(`      Creating variant ${variantName}...`);
        variant = await prisma.nevVariant.create({
          data: variantPayload
        });
        console.log(`      ✅ Variant created: ${variant.name} (${variant.id})`);
      } else {
        console.log(`      Updating variant ${variantName}...`);
        variant = await prisma.nevVariant.update({
          where: { id: variant.id },
          data: variantPayload
        });
        console.log(`      ✅ Variant updated: ${variant.name} (${variant.id})`);
      }

      // 4. Import detailed specs (11 categories)
      
      // 4.1 Multimedia
      if (variantData.multimedia) {
        await prisma.nevMultimedia.upsert({
          where: { variantId: variant.id },
          create: {
            variantId: variant.id,
            displaySize: variantData.multimedia.central_screen_inches || null,
            displayType: 'Touchscreen',
            appleCarPlay: variantData.multimedia.wireless_apple_carplay || false,
            androidAuto: variantData.multimedia.wireless_android_auto || false,
            wirelessCharging: variantData.interior?.wireless_charger_50w_front || false,
            otaUpdate: variantData.multimedia.ota_updates || false,
            keylessEntry: true,
            keylessStart: true,
            nfcCard: variantData.multimedia.nfc_card_key || false,
            digitalKey: variantData.multimedia.mobile_app_bluetooth_key || false
          },
          update: {
            displaySize: variantData.multimedia.central_screen_inches || null,
            displayType: 'Touchscreen',
            appleCarPlay: variantData.multimedia.wireless_apple_carplay || false,
            androidAuto: variantData.multimedia.wireless_android_auto || false,
            wirelessCharging: variantData.interior?.wireless_charger_50w_front || false,
            otaUpdate: variantData.multimedia.ota_updates || false,
            keylessEntry: true,
            keylessStart: true,
            nfcCard: variantData.multimedia.nfc_card_key || false,
            digitalKey: variantData.multimedia.mobile_app_bluetooth_key || false
          }
        });
        console.log(`      ✅ Multimedia specs imported`);
      }

      // 4.2 Safety (ADAS)
      if (variantData.adas) {
        await prisma.nevSafety.upsert({
          where: { variantId: variant.id },
          create: {
            variantId: variant.id,
            airbagsFront: variantData.safety?.airbags ? 2 : 0,
            tpms: variantData.safety?.tpms || false,
            adaptiveCruise: variantData.adas.adaptive_cruise_control || false,
            laneKeepAssist: variantData.adas.lane_keeping_assist || false,
            autoEmergencyBrake: variantData.adas.aeb || false,
            blindSpotDetection: variantData.adas.blind_spot_detection || false,
            rearCrossTrafficAlert: variantData.adas.rear_cross_traffic_alert || false,
            camera360: variantData.adas.camera_360 || false,
            driverMonitoring: variantData.adas.driver_state_monitoring || false,
            trafficSignRecog: variantData.adas.traffic_sign_recognition || false,
            laneDepartureWarn: variantData.adas.lane_departure_warning || false,
            forwardCollisionWarn: variantData.adas.forward_collision_warning || false,
            rearCollisionWarn: variantData.adas.rear_collision_warning || false,
            doorOpenWarning: variantData.adas.door_open_warning || false,
            emergencyLaneKeep: variantData.adas.emergency_lane_keeping || false
          },
          update: {
            airbagsFront: variantData.safety?.airbags ? 2 : 0,
            tpms: variantData.safety?.tpms || false,
            adaptiveCruise: variantData.adas.adaptive_cruise_control || false,
            laneKeepAssist: variantData.adas.lane_keeping_assist || false,
            autoEmergencyBrake: variantData.adas.aeb || false,
            blindSpotDetection: variantData.adas.blind_spot_detection || false,
            rearCrossTrafficAlert: variantData.adas.rear_cross_traffic_alert || false,
            camera360: variantData.adas.camera_360 || false,
            driverMonitoring: variantData.adas.driver_state_monitoring || false,
            trafficSignRecog: variantData.adas.traffic_sign_recognition || false,
            laneDepartureWarn: variantData.adas.lane_departure_warning || false,
            forwardCollisionWarn: variantData.adas.forward_collision_warning || false,
            rearCollisionWarn: variantData.adas.rear_collision_warning || false,
            doorOpenWarning: variantData.adas.door_open_warning || false,
            emergencyLaneKeep: variantData.adas.emergency_lane_keeping || false
          }
        });
        console.log(`      ✅ Safety/ADAS specs imported`);
      }

      // 4.3 Interior
      if (variantData.interior) {
        await prisma.nevInterior.upsert({
          where: { variantId: variant.id },
          create: {
            variantId: variant.id,
            seatMaterial: variantData.interior.seat_material || null,
            driverSeatPower: variantData.interior.front_seats_electric_10way || variantData.interior.front_seats_electric_12way || false,
            driverSeatAdjustments: variantData.interior.front_seats_electric_10way ? 10 : variantData.interior.front_seats_electric_12way ? 12 : null,
            driverSeatVentilation: variantData.interior.front_seat_heated_ventilated || false,
            driverSeatMemory: variantData.interior.front_seat_memory || false,
            rearSeatFold: variantData.interior.rear_seat_foldable_6040 ? '60:40' : null,
            ambientLighting: variantData.comfort?.ambient_lighting ? true : false
          },
          update: {
            seatMaterial: variantData.interior.seat_material || null,
            driverSeatPower: variantData.interior.front_seats_electric_10way || variantData.interior.front_seats_electric_12way || false,
            driverSeatAdjustments: variantData.interior.front_seats_electric_10way ? 10 : variantData.interior.front_seats_electric_12way ? 12 : null,
            driverSeatVentilation: variantData.interior.front_seat_heated_ventilated || false,
            driverSeatMemory: variantData.interior.front_seat_memory || false,
            rearSeatFold: variantData.interior.rear_seat_foldable_6040 ? '60:40' : null,
            ambientLighting: variantData.comfort?.ambient_lighting ? true : false
          }
        });
        console.log(`      ✅ Interior specs imported`);
      }

      // 4.4 Exterior
      if (variantData.exterior) {
        await prisma.nevExterior.upsert({
          where: { variantId: variant.id },
          create: {
            variantId: variant.id,
            headlightsType: 'LED',
            headlightsAuto: variantData.exterior.led_auto_onoff_headlight || false,
            doorHandlesRetractable: variantData.exterior.electric_hidden_door_handles || false,
            powerTailgate: variantData.exterior.electric_tailgate || false,
            wipersFrontAuto: variantData.exterior.rain_sensing_wiper || false,
            sunroofType: variantData.comfort?.panoramic_glass_roof ? 'Panoramic Glass Roof' : null
          },
          update: {
            headlightsType: 'LED',
            headlightsAuto: variantData.exterior.led_auto_onoff_headlight || false,
            doorHandlesRetractable: variantData.exterior.electric_hidden_door_handles || false,
            powerTailgate: variantData.exterior.electric_tailgate || false,
            wipersFrontAuto: variantData.exterior.rain_sensing_wiper || false,
            sunroofType: variantData.comfort?.panoramic_glass_roof ? 'Panoramic Glass Roof' : null
          }
        });
        console.log(`      ✅ Exterior specs imported`);
      }

      // 4.5 EV Features
      if (variantData.range || variantData.charging) {
        await prisma.nevEVFeatures.upsert({
          where: { variantId: variant.id },
          create: {
            variantId: variant.id,
            rangeWLTP: variantData.range?.wltp_km || null,
            rangeNEDC: variantData.range?.nedc_km || null,
            acChargeMaxKw: variantData.charging?.ac_max_kw || null,
            dcChargeMaxKw: variantData.charging?.dc_max_kw || null,
            dcCharge10to80Min: variantData.charging?.dc_time_10_80_min || null,
            v2l: variantData.charging?.v2l || false,
            regenerativeBrake: true
          },
          update: {
            rangeWLTP: variantData.range?.wltp_km || null,
            rangeNEDC: variantData.range?.nedc_km || null,
            acChargeMaxKw: variantData.charging?.ac_max_kw || null,
            dcChargeMaxKw: variantData.charging?.dc_max_kw || null,
            dcCharge10to80Min: variantData.charging?.dc_time_10_80_min || null,
            v2l: variantData.charging?.v2l || false,
            regenerativeBrake: true
          }
        });
        console.log(`      ✅ EV Features imported`);
      }

      // 4.6 Battery Details
      if (variantData.battery) {
        await prisma.nevBatteryDetails.upsert({
          where: { variantId: variant.id },
          create: {
            variantId: variant.id,
            batteryType: variantData.battery.type || null,
            batteryKwh: variantData.battery.capacity_kwh || null,
            batteryChemistry: variantData.battery.chemistry || null
          },
          update: {
            batteryType: variantData.battery.type || null,
            batteryKwh: variantData.battery.capacity_kwh || null,
            batteryChemistry: variantData.battery.chemistry || null
          }
        });
        console.log(`      ✅ Battery specs imported`);
      }

      // 4.7 Suspension
      if (variantData.suspension) {
        await prisma.nevSuspension.upsert({
          where: { variantId: variant.id },
          create: {
            variantId: variant.id,
            frontType: variantData.suspension.front || null,
            rearType: variantData.suspension.rear || null,
            adaptiveSuspension: variantData.suspension.intelligent_air_suspension ? 'Air Suspension' : null
          },
          update: {
            frontType: variantData.suspension.front || null,
            rearType: variantData.suspension.rear || null,
            adaptiveSuspension: variantData.suspension.intelligent_air_suspension ? 'Air Suspension' : null
          }
        });
        console.log(`      ✅ Suspension specs imported`);
      }

      // 4.8 Brake System
      await prisma.nevBrakeSystem.upsert({
        where: { variantId: variant.id },
        create: {
          variantId: variant.id,
          frontBrakeType: variantData.brakes?.type || 'Disc',
          rearBrakeType: variantData.brakes?.type || 'Disc'
        },
        update: {
          frontBrakeType: variantData.brakes?.type || 'Disc',
          rearBrakeType: variantData.brakes?.type || 'Disc'
        }
      });

      // 4.9 Wheels & Tires
      if (variantData.wheels_tires) {
        await prisma.nevWheelsTires.upsert({
          where: { variantId: variant.id },
          create: {
            variantId: variant.id,
            wheelSizeInch: variantData.wheels_tires.wheel_size_inches || null,
            wheelMaterial: 'Alloy'
          },
          update: {
            wheelSizeInch: variantData.wheels_tires.wheel_size_inches || null,
            wheelMaterial: 'Alloy'
          }
        });
        console.log(`      ✅ Wheels & Tires specs imported`);
      }

      // 4.10 Powertrain
      if (variantData.powertrain) {
        await prisma.nevPowertrain.upsert({
          where: { variantId: variant.id },
          create: {
            variantId: variant.id,
            drivetrain: variantData.powertrain.drivetrain || null,
            totalPowerKw: variantData.powertrain.max_power_kw || null,
            totalTorqueNm: variantData.powertrain.max_torque_nm || null,
            accel0100: variantData.powertrain.acceleration_0_100_s || null,
            topSpeedKmh: variantData.powertrain.max_speed_kmh || null
          },
          update: {
            drivetrain: variantData.powertrain.drivetrain || null,
            totalPowerKw: variantData.powertrain.max_power_kw || null,
            totalTorqueNm: variantData.powertrain.max_torque_nm || null,
            accel0100: variantData.powertrain.acceleration_0_100_s || null,
            topSpeedKmh: variantData.powertrain.max_speed_kmh || null
          }
        });
        console.log(`      ✅ Powertrain specs imported`);
      }

      // 4.11 Dimensions
      if (variantData.dimensions) {
        await prisma.nevDimensions.upsert({
          where: { variantId: variant.id },
          create: {
            variantId: variant.id,
            seatingCapacity: seats,
            lengthMm: variantData.dimensions.length_mm || null,
            widthMm: variantData.dimensions.width_mm || null,
            heightMm: variantData.dimensions.height_mm || null,
            wheelbaseMm: variantData.dimensions.wheelbase_mm || null,
            turningRadiusM: variantData.dimensions.turning_radius_m || null,
            curbWeightKg: variantData.dimensions.curb_weight_kg || null
          },
          update: {
            seatingCapacity: seats,
            lengthMm: variantData.dimensions.length_mm || null,
            widthMm: variantData.dimensions.width_mm || null,
            heightMm: variantData.dimensions.height_mm || null,
            wheelbaseMm: variantData.dimensions.wheelbase_mm || null,
            turningRadiusM: variantData.dimensions.turning_radius_m || null,
            curbWeightKg: variantData.dimensions.curb_weight_kg || null
          }
        });
        console.log(`      ✅ Dimensions specs imported`);
      }
    }
  }

  // 5. Update brand stats
  const totalModels = await prisma.nevModel.count({
    where: { brandId: brand.id }
  });

  await prisma.nevBrand.update({
    where: { id: brand.id },
    data: { totalModels }
  });

  console.log(`\n✅ Import complete!`);
  console.log(`📊 Summary:`);
  console.log(`   - Brand: XPeng`);
  console.log(`   - Models: ${data.models.length} (${data.models.map(m => m.model).join(', ')})`);
  console.log(`   - Total Variants: ${data.metadata.total_variants}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
