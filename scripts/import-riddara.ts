import { config } from 'dotenv';
config({ path: '.env.local', override: true });

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const connectionString = 'postgresql://postgres.deunlrpkfrinjsqdqvkk:hH%2FR24fxSmM%40xB%2B@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

const prisma = new PrismaClient({
  datasourceUrl: connectionString
});

async function main() {
  console.log('🚀 Starting RIDDARA RD6 import...\n');

  // Read merged JSON data
  const dataPath = '/Users/imodteam/Desktop/NEV-Database/Upload/2026-02-22 RIDDARA/merged.json';
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const riddaraData = JSON.parse(rawData);

  // Check if brand exists
  let brand = await prisma.brand.findFirst({
    where: { name: 'RIDDARA' }
  });

  if (!brand) {
    console.log('📝 Creating RIDDARA brand...');
    brand = await prisma.brand.create({
      data: {
        name: 'RIDDARA',
        slug: 'riddara',
        origin: riddaraData.origin || 'China',
        description: 'RIDDARA - Electric Pickup Truck Manufacturer'
      }
    });
    console.log(`✅ Brand created: ${brand.name} (ID: ${brand.id})\n`);
  } else {
    console.log(`✅ Brand exists: ${brand.name} (ID: ${brand.id})\n`);
  }

  // Check if model exists
  let model = await prisma.model.findFirst({
    where: {
      brandId: brand.id,
      name: 'RD6'
    }
  });

  if (!model) {
    console.log('📝 Creating RD6 model...');
    model = await prisma.model.create({
      data: {
        brandId: brand.id,
        name: 'RD6',
        slug: 'rd6',
        type: 'PICKUP_TRUCK',
        description: '100% Electric Pickup Truck',
        year: 2026
      }
    });
    console.log(`✅ Model created: ${model.name} (ID: ${model.id})\n`);
  } else {
    console.log(`✅ Model exists: ${model.name} (ID: ${model.id})\n`);
  }

  // Import variants
  console.log('📦 Importing variants...\n');
  
  for (const variantData of riddaraData.variants) {
    const trimName = variantData.name;
    
    // Check if variant exists
    let variant = await prisma.variant.findFirst({
      where: {
        modelId: model.id,
        name: trimName
      }
    });

    if (variant) {
      console.log(`⏭️  Variant exists: ${trimName} - skipping`);
      continue;
    }

    // Create variant
    variant = await prisma.variant.create({
      data: {
        modelId: model.id,
        name: trimName,
        slug: trimName.toLowerCase().replace(/\s+/g, '-'),
        price: null, // No price data in brochure
        
        // Battery
        batteryCapacity: variantData.battery_capacity_kwh,
        batteryType: variantData.battery_type,
        
        // Motor & Performance
        motorType: variantData.motor_type,
        motorPowerKw: variantData.motor_power_kw,
        motorPowerHp: variantData.motor_power_hp,
        drivetrain: variantData.drivetrain,
        accelerationSec: variantData.acceleration_0_100_kmh || null,
        
        // Range
        rangeCltcKm: variantData.range_cltc_km,
        
        // Charging
        acChargingKw: variantData.ac_charging_kw,
        acChargingTimeMin: variantData.ac_charging_time_min,
        dcChargingKw: variantData.dc_charging_kw,
        dcChargingTimeHours: variantData.dc_charging_time_hours,
        
        // Dimensions
        lengthMm: riddaraData.dimensions.length_mm,
        widthMm: riddaraData.dimensions.width_mm,
        heightMm: riddaraData.dimensions.height_mm,
        wheelbaseMm: riddaraData.dimensions.wheelbase_mm,
        groundClearanceMm: riddaraData.dimensions.ground_clearance_mm,
        
        // Weight
        curbWeightKg: variantData.curb_weight_kg,
        
        // Features (JSON fields)
        features: {
          multimedia: riddaraData.features.multimedia_convenience,
          safety: riddaraData.features.safety_systems,
          interior: riddaraData.features.interior_equipment,
          exterior: riddaraData.features.exterior_equipment,
          ev_energy: riddaraData.features.ev_energy_features,
          suspension: riddaraData.features.suspension,
          brakes: riddaraData.features.brake_system,
          wheels_tires: riddaraData.features.wheels_tires,
          powertrain: riddaraData.features.powertrain_performance
        },
        
        // Colors
        colors: riddaraData.colors,
        
        // Additional info
        tireSize: variantData.tire_size,
        screenSize: variantData.screen_size_inch ? `${variantData.screen_size_inch}" center screen` : null,
        
        status: 'ACTIVE'
      }
    });

    console.log(`✅ Created: ${trimName}`);
    console.log(`   💰 Price: N/A`);
    console.log(`   🔋 Battery: ${variantData.battery_capacity_kwh} kWh (${variantData.battery_type})`);
    console.log(`   📏 Range: ${variantData.range_cltc_km} km (CLTC)`);
    console.log(`   ⚡ Motor: ${variantData.motor_power_kw} kW (${variantData.motor_power_hp} hp)`);
    console.log(`   🚗 Drivetrain: ${variantData.drivetrain}`);
    console.log('');
  }

  console.log('\n✅ Import completed successfully!');
  console.log(`📊 Total variants imported: ${riddaraData.variants.length}`);
  
  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });
