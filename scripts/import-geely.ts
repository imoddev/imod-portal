import { config } from 'dotenv';
config({ path: '.env.local', override: true });
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const connectionString = 'postgresql://postgres.deunlrpkfrinjsqdqvkk:hH%2FR24fxSmM%40xB%2B@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const prisma = new PrismaClient({ datasourceUrl: connectionString });

interface GeelyData {
  brand: string;
  models: {
    modelName: string;
    slogan?: string;
    platform?: string;
    structure?: string;
    variants: {
      variantName: string;
      specifications: any;
    }[];
  }[];
}

async function main() {
  console.log('🚗 เริ่มต้น Import ข้อมูล Geely...\n');

  const jsonPath = '/Users/imodteam/Desktop/NEV-Database/Upload/2026-02-22 Geely Brochure/merged.json';
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const data: GeelyData = JSON.parse(rawData);

  console.log(`📦 Brand: ${data.brand}`);
  console.log(`📊 Models: ${data.models.length}\n`);

  // หา/สร้าง Brand
  let brand = await prisma.nevBrand.findFirst({
    where: { name: { equals: data.brand, mode: 'insensitive' } }
  });

  if (!brand) {
    brand = await prisma.nevBrand.create({
      data: {
        name: data.brand,
        slug: data.brand.toLowerCase(),
        country: 'China',
        nameTh: 'จีลี่'
      }
    });
    console.log(`✅ สร้าง Brand: ${brand.name} (ID: ${brand.id})`);
  } else {
    console.log(`✅ พบ Brand: ${brand.name} (ID: ${brand.id})`);
  }

  // วนลูป Models
  for (const modelData of data.models) {
    console.log(`\n📋 กำลังประมวลผล Model: ${modelData.modelName}`);

    const modelSlug = `${data.brand.toLowerCase()}-${modelData.modelName.toLowerCase().replace(/\s+/g, '-')}`;

    let model = await prisma.nevModel.findFirst({
      where: {
        slug: modelSlug
      }
    });

    if (!model) {
      model = await prisma.nevModel.create({
        data: {
          brandId: brand.id,
          name: modelData.modelName,
          slug: modelSlug,
          fullName: `${data.brand} ${modelData.modelName}`,
          powertrain: 'BEV',
          bodyType: 'SUV' // Default - ปรับตามจริง
        }
      });
      console.log(`  ✅ สร้าง Model: ${model.name} (ID: ${model.id})`);
    } else {
      console.log(`  ✅ พบ Model: ${model.name} (ID: ${model.id})`);
    }

    // วนลูป Variants
    for (const variantData of modelData.variants) {
      console.log(`    🔧 Variant: ${variantData.variantName}`);

      const specs = variantData.specifications;
      const fullVariantName = `${modelData.modelName} ${variantData.variantName}`;
      const variantSlug = `${modelSlug}-${variantData.variantName.toLowerCase()}`;

      let variant = await prisma.nevVariant.findFirst({
        where: { slug: variantSlug }
      });

      // Extract ข้อมูลสำคัญจาก specs
      const powertrainData = specs.powertrainPerformance || {};
      const batteryData = specs.batteryDetails || {};
      const dimensionsData = specs.dimensionsWeight || {};
      const evData = specs.evEnergyFeatures || {};

      if (!variant) {
        variant = await prisma.nevVariant.create({
          data: {
            modelId: model.id,
            name: variantData.variantName,
            fullName: fullVariantName,
            slug: variantSlug,
            
            // Battery & Range
            batteryKwh: parseFloat(batteryData.capacity) || null,
            rangeKm: batteryData.range?.wltp ? parseInt(batteryData.range.wltp) : null,
            rangeStandard: batteryData.range?.wltp ? 'WLTP' : (batteryData.range?.nedc ? 'NEDC' : null),
            
            // Motor
            motorKw: parseFloat(powertrainData.maxPower) || null,
            torqueNm: parseInt(powertrainData.maxTorque) || null,
            
            // Performance
            topSpeedKmh: parseInt(powertrainData.topSpeed) || null,
            accel0100: parseFloat(powertrainData.acceleration0to100) || null,
            
            // Drivetrain
            drivetrain: powertrainData.driveType || null,
            
            // Charging
            dcChargeKw: evData.charging?.dcCcs2 ? parseFloat(evData.charging.dcCcs2) : null,
            acChargeKw: evData.charging?.acType2 ? parseFloat(evData.charging.acType2) : null,
            chargePort: 'CCS2',
            
            // Dimensions
            lengthMm: dimensionsData.length ? parseInt(dimensionsData.length) : null,
            widthMm: dimensionsData.width ? parseInt(dimensionsData.width) : null,
            heightMm: dimensionsData.height ? parseInt(dimensionsData.height) : null,
            wheelbaseMm: dimensionsData.wheelbase ? parseInt(dimensionsData.wheelbase) : null,
            groundClearanceMm: dimensionsData.groundClearance ? parseInt(dimensionsData.groundClearance.split('/')[0]) : null,
            curbWeightKg: dimensionsData.curbWeight ? parseInt(dimensionsData.curbWeight) : null,
            
            // V2L
            hasV2l: evData.v2l || false,
            
            isActive: true
          }
        });
        console.log(`      ✅ สร้าง Variant: ${variant.name} (ID: ${variant.id})`);
      } else {
        console.log(`      ✅ พบ Variant: ${variant.name} (ID: ${variant.id})`);
      }

      // === Insert ลง Spec Tables ===

      // 1. Multimedia
      const mmData = specs.multimediaConvenience;
      if (mmData) {
        await prisma.nevMultimedia.upsert({
          where: { variantId: variant.id },
          create: {
            variantId: variant.id,
            displaySize: mmData.display?.mainTouchscreen ? parseFloat(mmData.display.mainTouchscreen) : null,
            displayType: 'HD Touchscreen',
            audioSystem: mmData.audioSystem?.brand || null,
            speakerCount: mmData.audioSystem?.speakers ? parseInt(mmData.audioSystem.speakers) : null,
            bluetooth: mmData.connectivity?.includes('Bluetooth') || false,
            navigation: mmData.connectivity?.includes('ระบบนำทาง') || false,
            voiceControl: true
          },
          update: {}
        });
        console.log(`        ✅ Multimedia`);
      }

      // 2. Safety
      const safetyData = specs.safetySystems;
      if (safetyData) {
        await prisma.nevSafety.upsert({
          where: { variantId: variant.id },
          create: {
            variantId: variant.id,
            airbagsFront: 2,
            airbagsSide: 2,
            airbagsCurtain: true,
            camera360: safetyData.adas?.some((f: string) => f.includes('360')) || false,
            esc: safetyData.basicSafety?.includes('ESC') || false,
            tcs: safetyData.basicSafety?.includes('TCS') || false,
            ebd: safetyData.basicSafety?.includes('EBD') || false,
            hhc: safetyData.basicSafety?.includes('HDC') || false,
            avh: safetyData.basicSafety?.includes('Auto Hold') || false
          },
          update: {}
        });
        console.log(`        ✅ Safety`);
      }

      // 3. Interior
      const interiorData = specs.interiorEquipment;
      if (interiorData) {
        await prisma.nevInterior.upsert({
          where: { variantId: variant.id },
          create: {
            variantId: variant.id,
            steeringMultifunction: true,
            hudDisplay: mmData?.display?.hud != null,
            seatMaterial: interiorData.seats?.material || null,
            driverSeatPower: variantData.variantName === 'MAX',
            driverSeatVentilation: interiorData.seats?.features?.includes('Ventilation') || false,
            ambientLighting: mmData?.ambientLighting != null,
            rearSeatFold: '60:40'
          },
          update: {}
        });
        console.log(`        ✅ Interior`);
      }

      // 4. Exterior
      const exteriorData = specs.exteriorEquipment;
      if (exteriorData) {
        await prisma.nevExterior.upsert({
          where: { variantId: variant.id },
          create: {
            variantId: variant.id,
            headlightsType: 'LED',
            headlightsAuto: exteriorData.lighting?.some((f: string) => f.includes('อัตโนมัติ')) || false,
            drlType: 'LED',
            taillightsType: 'LED',
            sideMirrorsPower: true,
            sideMirrorsFold: true
          },
          update: {}
        });
        console.log(`        ✅ Exterior`);
      }

      // 5. EV Features
      if (evData) {
        const parseKw = (val: any) => {
          const num = parseFloat(val);
          return isNaN(num) ? null : num;
        };
        
        await prisma.nevEVFeatures.upsert({
          where: { variantId: variant.id },
          create: {
            variantId: variant.id,
            rangeWLTP: batteryData.range?.wltp ? parseKw(batteryData.range.wltp) : null,
            rangeNEDC: batteryData.range?.nedc ? parseKw(batteryData.range.nedc) : null,
            acChargeMaxKw: parseKw(evData.charging?.acType2),
            dcChargeMaxKw: parseKw(evData.charging?.dcCcs2),
            dcCharge10to80Min: parseKw(evData.charging?.dcFastChargeTime),
            v2l: evData.v2l || false,
            regenerativeBrake: evData.regenerativeBraking || false
          },
          update: {}
        });
        console.log(`        ✅ EV Features`);
      }

      // 6. Battery Details
      if (batteryData) {
        await prisma.nevBatteryDetails.upsert({
          where: { variantId: variant.id },
          create: {
            variantId: variant.id,
            batteryChemistry: batteryData.type || null,
            batteryKwh: batteryData.capacity ? parseFloat(batteryData.capacity) : null
          },
          update: {}
        });
        console.log(`        ✅ Battery Details`);
      }

      // 7. Suspension
      const suspensionData = specs.suspension;
      if (suspensionData) {
        await prisma.nevSuspension.upsert({
          where: { variantId: variant.id },
          create: {
            variantId: variant.id,
            frontType: suspensionData.front || null,
            rearType: suspensionData.rear || null
          },
          update: {}
        });
        console.log(`        ✅ Suspension`);
      }

      // 8. Brake System
      const brakeData = specs.brakeSystem;
      if (brakeData) {
        await prisma.nevBrakeSystem.upsert({
          where: { variantId: variant.id },
          create: {
            variantId: variant.id,
            frontBrakeType: brakeData.front || null,
            rearBrakeType: brakeData.rear || null
          },
          update: {}
        });
        console.log(`        ✅ Brake System`);
      }

      // 9. Wheels & Tires
      const wheelsData = specs.wheelsTires;
      if (wheelsData) {
        await prisma.nevWheelsTires.upsert({
          where: { variantId: variant.id },
          create: {
            variantId: variant.id,
            wheelSizeInch: wheelsData.wheelSize ? parseFloat(wheelsData.wheelSize) : null,
            tireSizeFront: wheelsData.tireSize || null,
            tireSizeRear: wheelsData.tireSize || null
          },
          update: {}
        });
        console.log(`        ✅ Wheels & Tires`);
      }

      // 10. Powertrain & Performance
      if (powertrainData) {
        await prisma.nevPowertrain.upsert({
          where: { variantId: variant.id },
          create: {
            variantId: variant.id,
            drivetrain: powertrainData.driveType || null,
            rearMotorType: powertrainData.motorType || null,
            totalPowerKw: powertrainData.maxPower ? parseFloat(powertrainData.maxPower) : null,
            totalTorqueNm: powertrainData.maxTorque ? parseInt(powertrainData.maxTorque) : null,
            accel0100: powertrainData.acceleration0to100 ? parseFloat(powertrainData.acceleration0to100) : null,
            topSpeedKmh: powertrainData.topSpeed ? parseInt(powertrainData.topSpeed) : null
          },
          update: {}
        });
        console.log(`        ✅ Powertrain & Performance`);
      }

      // 11. Dimensions
      if (dimensionsData) {
        await prisma.nevDimensions.upsert({
          where: { variantId: variant.id },
          create: {
            variantId: variant.id,
            seatingCapacity: dimensionsData.seatingCapacity || 5,
            lengthMm: dimensionsData.length ? parseFloat(dimensionsData.length) : null,
            widthMm: dimensionsData.width ? parseFloat(dimensionsData.width) : null,
            heightMm: dimensionsData.height ? parseFloat(dimensionsData.height) : null,
            wheelbaseMm: dimensionsData.wheelbase ? parseFloat(dimensionsData.wheelbase) : null,
            groundClearanceMm: dimensionsData.groundClearance ? parseFloat(dimensionsData.groundClearance.split('/')[0]) : null,
            curbWeightKg: dimensionsData.curbWeight ? parseFloat(dimensionsData.curbWeight) : null,
            turningRadiusM: dimensionsData.turningRadius ? parseFloat(dimensionsData.turningRadius) : null
          },
          update: {}
        });
        console.log(`        ✅ Dimensions`);
      }
    }
  }

  console.log('\n🎉 Import สำเร็จทั้งหมด!\n');
}

main()
  .catch((e) => {
    console.error('❌ เกิดข้อผิดพลาด:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
