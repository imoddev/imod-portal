import { config } from 'dotenv';
config({ path: '.env.local', override: true });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// MG4 variants from brochure (prices are estimates - verify with MG Thailand)
const MG4_DATA = {
  brand: 'MG',
  model: 'MG4',
  year: 2025,
  bodyType: 'HATCHBACK',
  powertrain: 'BEV',
  seats: 5,
  variants: [
    {
      name: 'Standard Range',
      priceBaht: 1049000,
      batteryKwh: 49,
      rangeKm: 423,
      rangeStandard: 'NEDC',
      motorCount: 1,
      motorKw: 125,
      motorHp: 168,
      torqueNm: 250,
      drivetrain: 'RWD',
      dcChargeKw: 140,
      acChargeKw: 7,
      chargePort: 'CCS2',
      lengthMm: 4287,
      widthMm: 1836,
      heightMm: 1516,
      wheelbaseMm: 2705,
      warrantyVehicle: '5 ปี / 150,000 กม.',
      warrantyBattery: '8 ปี / 160,000 กม.',
    },
    {
      name: 'Long Range',
      priceBaht: 1199000,
      batteryKwh: 64,
      rangeKm: 540,
      rangeStandard: 'NEDC',
      motorCount: 1,
      motorKw: 125,
      motorHp: 168,
      torqueNm: 250,
      drivetrain: 'RWD',
      dcChargeKw: 140,
      acChargeKw: 11,
      chargePort: 'CCS2',
      lengthMm: 4287,
      widthMm: 1836,
      heightMm: 1516,
      wheelbaseMm: 2705,
      warrantyVehicle: '5 ปี / 150,000 กม.',
      warrantyBattery: '8 ปี / 160,000 กม.',
    },
    {
      name: 'XPOWER AWD',
      priceBaht: 1499000,
      batteryKwh: 64,
      rangeKm: 480,
      rangeStandard: 'NEDC',
      motorCount: 2,
      motorKw: 320,
      motorHp: 429,
      torqueNm: 600,
      accel0100: 3.8,
      drivetrain: 'AWD',
      dcChargeKw: 140,
      acChargeKw: 11,
      chargePort: 'CCS2',
      lengthMm: 4287,
      widthMm: 1836,
      heightMm: 1516,
      wheelbaseMm: 2705,
      warrantyVehicle: '5 ปี / 150,000 กม.',
      warrantyBattery: '8 ปี / 160,000 กม.',
    },
  ],
};

function generateSlug(brand: string, model: string, variant: string): string {
  return `${brand}-${model}-${variant}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  console.log('🚗 MG4 Import Script Starting...\n');

  const brand = await prisma.nevBrand.findFirst({
    where: { name: { contains: 'MG', mode: 'insensitive' } },
  });

  if (!brand) {
    console.log('❌ Brand MG not found');
    return;
  }
  console.log(`✅ Brand found: ${brand.name} (ID: ${brand.id})`);

  let model = await prisma.nevModel.findFirst({
    where: { brandId: brand.id, name: { contains: 'MG4' } },
  });

  if (!model) {
    model = await prisma.nevModel.create({
      data: {
        brandId: brand.id,
        name: MG4_DATA.model,
        slug: 'mg-mg4',
        fullName: 'MG MG4',
        year: MG4_DATA.year,
        bodyType: MG4_DATA.bodyType,
        powertrain: MG4_DATA.powertrain,
        seats: MG4_DATA.seats,
        isActive: true,
        isNewModel: true,
      },
    });
    console.log(`✅ Model created (ID: ${model.id})`);
  } else {
    console.log(`✅ Model found (ID: ${model.id})`);
  }

  for (const v of MG4_DATA.variants) {
    console.log(`\n🔧 Processing Variant: ${v.name}`);
    const slug = generateSlug('mg', 'mg4', v.name);

    const existing = await prisma.nevVariant.findUnique({ where: { slug } });

    const payload = {
      modelId: model!.id,
      name: v.name,
      fullName: `MG MG4 ${v.name}`,
      slug,
      priceBaht: v.priceBaht,
      batteryKwh: v.batteryKwh,
      rangeKm: v.rangeKm,
      rangeStandard: v.rangeStandard,
      motorCount: v.motorCount,
      motorKw: v.motorKw,
      motorHp: v.motorHp,
      torqueNm: v.torqueNm,
      accel0100: v.accel0100,
      drivetrain: v.drivetrain,
      dcChargeKw: v.dcChargeKw,
      acChargeKw: v.acChargeKw,
      chargePort: v.chargePort,
      lengthMm: v.lengthMm,
      widthMm: v.widthMm,
      heightMm: v.heightMm,
      wheelbaseMm: v.wheelbaseMm,
      warrantyVehicle: v.warrantyVehicle,
      warrantyBattery: v.warrantyBattery,
    };

    if (existing) {
      await prisma.nevVariant.update({ where: { id: existing.id }, data: payload });
      console.log(`✅ Variant updated (ID: ${existing.id})`);
    } else {
      const newV = await prisma.nevVariant.create({ data: payload });
      console.log(`✅ Variant created (ID: ${newV.id})`);
    }
  }

  console.log('\n🎉 MG4 Import completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
