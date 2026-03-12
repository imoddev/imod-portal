#!/usr/bin/env ts-node
/**
 * Import BYD SEAL 5 DM-i from merged.json
 */

import { config } from 'dotenv';
config({ path: '.env.local', override: true });

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const connectionString = 'postgresql://postgres.deunlrpkfrinjsqdqvkk:hH%2FR24fxSmM%40xB%2B@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const prisma = new PrismaClient({ datasourceUrl: connectionString });

const mergedData = JSON.parse(fs.readFileSync(
  '/Users/imodteam/Desktop/NEV-Database/Upload/2026-02-24 BYD SEAL 5 DM-i/merged.json',
  'utf8'
));

async function main() {
  console.log('🚀 Importing BYD SEAL 5 DM-i...\n');

  // 1. Get or create BYD brand
  let byd = await prisma.nevBrand.findUnique({ where: { slug: 'byd' } });
  if (!byd) {
    byd = await prisma.nevBrand.create({
      data: {
        name: 'BYD',
        nameTh: 'บีวายดี',
        slug: 'byd',
        country: 'China',
      }
    });
    console.log('✅ Created brand: BYD');
  } else {
    console.log('✅ Found brand: BYD');
  }

  // 2. Create model
  const modelSlug = 'byd-seal-5-dm-i';
  let model = await prisma.nevModel.findUnique({ where: { slug: modelSlug } });
  
  if (!model) {
    model = await prisma.nevModel.create({
      data: {
        brandId: byd.id,
        name: 'SEAL 5 DM-i',
        nameTh: 'ซีล 5 DM-i',
        slug: modelSlug,
        fullName: 'BYD SEAL 5 DM-i',
        year: 2026,
        bodyType: 'Sedan',
        segment: 'C',
        seats: 5,
        powertrain: 'PHEV',
        assembly: 'CBU',
        madeIn: 'China',
      }
    });
    console.log('✅ Created model: SEAL 5 DM-i\n');
  } else {
    console.log('✅ Found model: SEAL 5 DM-i\n');
  }

  // 3. Import variants
  for (const variantData of mergedData.variants) {
    console.log(`📦 Processing: ${variantData.name}...`);
    
    const variantSlug = `byd-seal-5-dm-i-${variantData.name.toLowerCase()}`;
    
    // Check if exists
    const existing = await prisma.nevVariant.findUnique({ where: { slug: variantSlug } });
    if (existing) {
      console.log(`⚠️  Variant exists, skipping: ${variantSlug}\n`);
      continue;
    }
    
    const specs = variantData.specs;
    
    // Create variant with basic specs
    const variant = await prisma.nevVariant.create({
      data: {
        modelId: model.id,
        name: variantData.name,
        fullName: `BYD SEAL 5 DM-i ${variantData.name}`,
        slug: variantSlug,
        priceBaht: variantData.price,
        
        // Basic specs
        batteryKwh: specs.battery?.capacity_kwh || null,
        rangeKm: specs.battery?.ev_range_nedc || null,
        rangeStandard: 'NEDC',
        motorHp: specs.powertrain?.motor_front?.max_power_kw ? Math.round(specs.powertrain.motor_front.max_power_kw * 1.341) : null,
        torqueNm: specs.powertrain?.motor_front?.max_torque_nm || null,
        accel0100: specs.powertrain?.acceleration_0_100 || null,
        drivetrain: 'FWD',
        chargePort: 'Type 2',
        
        // PHEV specific
        engineCc: specs.powertrain?.engine?.displacement_cc || null,
        engineHp: specs.powertrain?.engine?.max_power_kw ? Math.round(specs.powertrain.engine.max_power_kw * 1.341) : null,
        combinedHp: specs.powertrain?.combined_power_kw ? Math.round(specs.powertrain.combined_power_kw * 1.341) : null,
        fuelTankL: specs.dimensions?.fuel_tank_l || null,
        
        // Dimensions
        lengthMm: specs.dimensions?.length_mm || null,
        widthMm: specs.dimensions?.width_mm || null,
        heightMm: specs.dimensions?.height_mm || null,
        wheelbaseMm: specs.dimensions?.wheelbase_mm || null,
        groundClearanceMm: specs.dimensions?.ground_clearance_mm || null,
        trunkLitres: specs.dimensions?.trunk_capacity_l || null,
        
        dataSource: 'brochure-pdf',
        isActive: true,
      }
    });
    
    console.log(`✅ Created variant: ${variantData.name}`);
    
    // Create detailed specs - ปล่อยไว้ก่อน เพราะ field ไม่ตรง 100%
    // จะต้อง map ข้อมูลจาก JSON เข้า Schema V2.0
    
    console.log(`\n`);
  }
  
  console.log('🎉 Import complete!\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
