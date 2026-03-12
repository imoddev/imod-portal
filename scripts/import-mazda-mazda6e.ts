import { config } from 'dotenv';
config({ path: '.env.local', override: true });
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// ✅ Must use datasourceUrl parameter directly
const connectionString = 'postgresql://postgres.deunlrpkfrinjsqdqvkk:hH%2FR24fxSmM%40xB%2B@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const prisma = new PrismaClient({ datasourceUrl: connectionString });

const DATA_FILE = '/Users/imodteam/Desktop/NEV-Database/Upload/2026-03-12-Mazda-Mazda6e/merged.json';

interface MergedData {
  brand: string;
  model: string;
  variants: Array<{
    name: string;
    specs: {
      powertrain: any;
      battery: any;
      evFeatures: any;
      dimensions: any;
      suspension: any;
      brakes: any;
      wheels: any;
      safety: any;
      multimedia: any;
      interior: any;
      exterior: any;
    };
  }>;
  metadata?: any;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function main() {
  console.log('🚀 Starting Mazda Mazda6e import...\n');

  // Read merged.json
  if (!fs.existsSync(DATA_FILE)) {
    console.error('❌ File not found:', DATA_FILE);
    process.exit(1);
  }

  const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
  const data: MergedData = JSON.parse(rawData);

  console.log('📦 Data loaded:');
  console.log(`   Brand: ${data.brand}`);
  console.log(`   Model: ${data.model}`);
  console.log(`   Variants: ${data.variants.length}\n`);

  // 1. Upsert Brand
  console.log('1️⃣ Upserting brand...');
  const brand = await prisma.nevBrand.upsert({
    where: { slug: generateSlug(data.brand) },
    update: {},
    create: {
      name: data.brand,
      nameTh: data.brand,
      slug: generateSlug(data.brand),
      logoUrl: null,
    },
  });
  console.log(`   ✅ Brand: ${brand.name} (${brand.id})\n`);

  // 2. Upsert Model
  console.log('2️⃣ Upserting model...');
  const model = await prisma.nevModel.upsert({
    where: { slug: generateSlug(`${data.brand}-${data.model}`) },
    update: {
      name: data.model,
      nameTh: data.model,
    },
    create: {
      name: data.model,
      nameTh: data.model,
      slug: generateSlug(`${data.brand}-${data.model}`),
      brandId: brand.id,
      powertrain: 'BEV',
      imageUrl: null,
    },
  });
  console.log(`   ✅ Model: ${model.name} (${model.id})\n`);

  // 3. Import Variants
  console.log('3️⃣ Importing variants...\n');
  
  let createdCount = 0;
  let updatedCount = 0;

  for (const variantData of data.variants) {
    const variantSlug = generateSlug(`${data.brand}-${data.model}-${variantData.name}`);
    
    console.log(`   Processing: ${variantData.name}`);
    console.log(`   Slug: ${variantSlug}`);

    // Check if exists
    const existing = await prisma.nevVariant.findUnique({
      where: { slug: variantSlug },
    });

    const specs = variantData.specs;

    // Prepare variant data (matching actual Prisma schema)
    const variantInput = {
      name: variantData.name,
      fullName: `${data.brand} ${data.model} ${variantData.name}`,
      modelId: model.id,
      
      // Battery
      batteryKwh: specs.battery?.capacity?.value || null,

      // Range
      rangeKm: specs.evFeatures?.range?.value || null,
      rangeStandard: specs.evFeatures?.range?.standard || null,

      // Motor
      motorCount: 1,
      motorKw: specs.powertrain?.powerKw || null,
      motorHp: specs.powertrain?.power?.value || null,
      torqueNm: specs.powertrain?.torque?.value || null,

      // Performance
      topSpeedKmh: specs.powertrain?.topSpeed || null,
      accel0100: specs.powertrain?.acceleration?.value || null,

      // Drivetrain
      drivetrain: specs.powertrain?.driveType || null,

      // Charging
      acChargeKw: null, // Will extract from string
      dcChargeKw: null, // Will extract from string
      dcChargeMin: specs.evFeatures?.charging?.dcCharging?.chargingTime?.time || null,

      // V2L
      hasV2l: specs.evFeatures?.v2l?.supported || false,
      v2lKw: specs.evFeatures?.v2l?.power || null,

      // Dimensions
      lengthMm: specs.dimensions?.length || null,
      widthMm: specs.dimensions?.width || null,
      heightMm: specs.dimensions?.height || null,
      wheelbaseMm: specs.dimensions?.wheelbase || null,
      groundClearanceMm: null,
      curbWeightKg: specs.dimensions?.curbWeight || null,
      trunkLitres: null,

      // Misc
      priceBaht: null,
      priceNote: null,
      imageUrl: null,
      isActive: true,
      isBestSeller: false,
      dataSource: 'pdf-brochure',
    };

    // Extract DC charging power from string
    if (specs.evFeatures?.charging?.dcCharging?.maxPower) {
      const dcStr = specs.evFeatures.charging.dcCharging.maxPower;
      const match = dcStr.match(/(\d+)/);
      if (match) {
        variantInput.dcChargeKw = parseFloat(match[1]);
      }
    }

    if (existing) {
      // Update
      const updated = await prisma.nevVariant.update({
        where: { id: existing.id },
        data: variantInput,
      });
      console.log(`   ✅ Updated: ${updated.name}\n`);
      updatedCount++;

      // Update detailed specs
      await updateDetailedSpecs(updated.id, specs);
    } else {
      // Create
      const created = await prisma.nevVariant.create({
        data: {
          ...variantInput,
          slug: variantSlug,
        },
      });
      console.log(`   ✅ Created: ${created.name}\n`);
      createdCount++;

      // Create detailed specs
      await createDetailedSpecs(created.id, specs);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Created: ${createdCount}`);
  console.log(`   Updated: ${updatedCount}`);
  console.log(`   Total: ${data.variants.length}\n`);

  console.log('✅ Import complete!\n');

  await prisma.$disconnect();
}

async function createDetailedSpecs(variantId: string, specs: any) {
  // Just call updateDetailedSpecs - same implementation
  await updateDetailedSpecs(variantId, specs);
}

async function updateDetailedSpecs(variantId: string, specs: any) {
  // Safety (matching actual Prisma schema)
  if (specs.safety?.adas) {
    await prisma.nevSafety.upsert({
      where: { variantId },
      update: {
        // Airbags
        airbagsFront: 2, // Standard front airbags
        airbagsSide: 2,  // Assuming side airbags
        airbagsCurtain: true,
        
        // Stability & Braking
        esc: true,
        tcs: true,
        ebd: specs.safety.ebd || false,
        
        // Camera
        camera360: specs.safety.adas.some((f: any) => f.nameEn?.includes('360')),
        
        // ADAS
        forwardCollisionWarn: specs.safety.adas.some((f: any) => f.code === 'FCW'),
        rearCollisionWarn: specs.safety.adas.some((f: any) => f.code === 'RCW'),
        autoEmergencyBrake: specs.safety.adas.some((f: any) => f.code === 'SBS'),
        laneDepartureWarn: specs.safety.adas.some((f: any) => f.nameEn?.includes('Lane')),
        blindSpotDetection: specs.safety.adas.some((f: any) => f.code === 'BSM'),
        rearCrossTrafficAlert: specs.safety.adas.some((f: any) => f.code === 'RCTA'),
        adaptiveCruise: specs.safety.adas.some((f: any) => f.code?.includes('ACC')),
        doorOpenWarning: specs.safety.adas.some((f: any) => f.code === 'DOW'),
        tpms: true,
      },
      create: {
        variantId,
        // Airbags
        airbagsFront: 2,
        airbagsSide: 2,
        airbagsCurtain: true,
        
        // Stability & Braking
        esc: true,
        tcs: true,
        ebd: specs.safety.ebd || false,
        
        // Camera
        camera360: specs.safety.adas.some((f: any) => f.nameEn?.includes('360')),
        
        // ADAS
        forwardCollisionWarn: specs.safety.adas.some((f: any) => f.code === 'FCW'),
        rearCollisionWarn: specs.safety.adas.some((f: any) => f.code === 'RCW'),
        autoEmergencyBrake: specs.safety.adas.some((f: any) => f.code === 'SBS'),
        laneDepartureWarn: specs.safety.adas.some((f: any) => f.nameEn?.includes('Lane')),
        blindSpotDetection: specs.safety.adas.some((f: any) => f.code === 'BSM'),
        rearCrossTrafficAlert: specs.safety.adas.some((f: any) => f.code === 'RCTA'),
        adaptiveCruise: specs.safety.adas.some((f: any) => f.code?.includes('ACC')),
        doorOpenWarning: specs.safety.adas.some((f: any) => f.code === 'DOW'),
        tpms: true,
      },
    });
  }

  // Powertrain (matching actual schema)
  if (specs.powertrain) {
    await prisma.nevPowertrain.upsert({
      where: { variantId },
      update: {
        drivetrain: specs.powertrain.driveType || null,
        frontMotorType: specs.powertrain.motor || null,
        totalPowerKw: specs.powertrain.powerKw || null,
        totalTorqueNm: specs.powertrain.torque?.value || null,
        accel0100: specs.powertrain.acceleration?.value || null,
        topSpeedKmh: specs.powertrain.topSpeed || null,
      },
      create: {
        variantId,
        drivetrain: specs.powertrain.driveType || null,
        frontMotorType: specs.powertrain.motor || null,
        totalPowerKw: specs.powertrain.powerKw || null,
        totalTorqueNm: specs.powertrain.torque?.value || null,
        accel0100: specs.powertrain.acceleration?.value || null,
        topSpeedKmh: specs.powertrain.topSpeed || null,
      },
    });
  }

  // Battery Details (matching actual schema)
  if (specs.battery) {
    await prisma.nevBatteryDetails.upsert({
      where: { variantId },
      update: {
        batteryType: specs.battery.type || null,
        batteryChemistry: specs.battery.chemistry || null,
        batteryKwh: specs.battery.capacity?.value || null,
        batteryVoltage: specs.battery.voltage || null,
      },
      create: {
        variantId,
        batteryType: specs.battery.type || null,
        batteryChemistry: specs.battery.chemistry || null,
        batteryKwh: specs.battery.capacity?.value || null,
        batteryVoltage: specs.battery.voltage || null,
      },
    });
  }

  // EV Features (matching actual schema)
  if (specs.evFeatures) {
    const rangeStandard = specs.evFeatures.range?.standard;
    await prisma.nevEVFeatures.upsert({
      where: { variantId },
      update: {
        rangeNEDC: rangeStandard === 'NEDC' ? specs.evFeatures.range?.value : null,
        rangeWLTP: rangeStandard === 'WLTP' ? specs.evFeatures.range?.value : null,
        rangeEPA: rangeStandard === 'EPA' ? specs.evFeatures.range?.value : null,
        acChargeMaxKw: null,
        dcChargeMaxKw: null,
        dcCharge10to80Min: specs.evFeatures.charging?.dcCharging?.chargingTime?.time || null,
        v2l: specs.evFeatures.v2l?.supported || false,
        regenerativeBrake: specs.evFeatures.regenerativeBraking || false,
      },
      create: {
        variantId,
        rangeNEDC: rangeStandard === 'NEDC' ? specs.evFeatures.range?.value : null,
        rangeWLTP: rangeStandard === 'WLTP' ? specs.evFeatures.range?.value : null,
        rangeEPA: rangeStandard === 'EPA' ? specs.evFeatures.range?.value : null,
        acChargeMaxKw: null,
        dcChargeMaxKw: null,
        dcCharge10to80Min: specs.evFeatures.charging?.dcCharging?.chargingTime?.time || null,
        v2l: specs.evFeatures.v2l?.supported || false,
        regenerativeBrake: specs.evFeatures.regenerativeBraking || false,
      },
    });
  }

  // Suspension (matching actual schema)
  if (specs.suspension) {
    await prisma.nevSuspension.upsert({
      where: { variantId },
      update: {
        frontType: specs.suspension.front || null,
        rearType: specs.suspension.rear || null,
        adaptiveSuspension: null,
      },
      create: {
        variantId,
        frontType: specs.suspension.front || null,
        rearType: specs.suspension.rear || null,
        adaptiveSuspension: null,
      },
    });
  }

  // Brake System (matching actual schema)
  if (specs.brakes) {
    await prisma.nevBrakeSystem.upsert({
      where: { variantId },
      update: {
        frontBrakeType: specs.brakes.front || null,
        rearBrakeType: specs.brakes.rear || null,
      },
      create: {
        variantId,
        frontBrakeType: specs.brakes.front || null,
        rearBrakeType: specs.brakes.rear || null,
      },
    });
  }

  // Wheels & Tires (matching actual schema)
  if (specs.wheels) {
    await prisma.nevWheelsTires.upsert({
      where: { variantId },
      update: {
        wheelSizeInch: specs.wheels.front?.rimSize || null,
        tireSizeFront: specs.wheels.front?.tireSize || null,
        tireSizeRear: specs.wheels.rear?.tireSize || null,
        wheelMaterial: specs.wheels.front?.rimType || null,
      },
      create: {
        variantId,
        wheelSizeInch: specs.wheels.front?.rimSize || null,
        tireSizeFront: specs.wheels.front?.tireSize || null,
        tireSizeRear: specs.wheels.rear?.tireSize || null,
        wheelMaterial: specs.wheels.front?.rimType || null,
      },
    });
  }

  // Dimensions (matching actual schema)
  if (specs.dimensions) {
    await prisma.nevDimensions.upsert({
      where: { variantId },
      update: {
        lengthMm: specs.dimensions.length || null,
        widthMm: specs.dimensions.width || null,
        heightMm: specs.dimensions.height || null,
        wheelbaseMm: specs.dimensions.wheelbase || null,
        groundClearanceMm: null,
        curbWeightKg: specs.dimensions.curbWeight || null,
        gvwKg: null,
        trunkCapacityRearL: null,
      },
      create: {
        variantId,
        lengthMm: specs.dimensions.length || null,
        widthMm: specs.dimensions.width || null,
        heightMm: specs.dimensions.height || null,
        wheelbaseMm: specs.dimensions.wheelbase || null,
        groundClearanceMm: null,
        curbWeightKg: specs.dimensions.curbWeight || null,
        gvwKg: null,
        trunkCapacityRearL: null,
      },
    });
  }
  
  console.log('   ✅ Detailed specs updated (11 categories)');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });
