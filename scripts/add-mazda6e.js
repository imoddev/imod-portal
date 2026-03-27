const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addMazda6e() {
  try {
    // 1. หา/สร้าง Brand: Mazda
    let mazda = await prisma.nevBrand.findFirst({
      where: { name: 'Mazda' }
    });

    if (!mazda) {
      mazda = await prisma.nevBrand.create({
        data: {
          name: 'Mazda',
          nameTh: 'มาสด้า',
          slug: 'mazda',
          country: 'JP', // Japan
        }
      });
      console.log('✅ Created brand: Mazda');
    } else {
      console.log('✅ Brand exists: Mazda');
    }

    // 2. หา/สร้าง Model: Mazda6e
    let mazda6e = await prisma.nevModel.findFirst({
      where: {
        brandId: mazda.id,
        name: 'Mazda6e'
      }
    });

    if (!mazda6e) {
      mazda6e = await prisma.nevModel.create({
        data: {
          brandId: mazda.id,
          name: 'Mazda6e',
          nameTh: 'มาสด้า 6อี',
          slug: 'mazda-mazda6e',
          year: 2026,
          bodyType: 'Sedan',
          powertrain: 'BEV'
        }
      });
      console.log('✅ Created model: Mazda6e');
    } else {
      console.log('✅ Model exists: Mazda6e');
    }

    // 3. สร้าง Variants (Premium + Exclusive)
    const variants = [
      {
        name: 'Premium',
        fullName: 'Mazda6e Premium',
        price: 1169000,
      },
      {
        name: 'Exclusive', 
        fullName: 'Mazda6e Exclusive',
        price: 1199000,
      }
    ];

    const commonSpecs = {
      power: 190, // kW
      horsepower: 258, // hp
      torque: 290, // Nm
      batteryCapacity: 77.9, // kWh
      batteryType: 'LFP (Lithium Iron Phosphate)',
      range: 560, // km WLTP
      acceleration: 7.9, // 0-100 km/h (seconds)
      topSpeed: 175, // km/h
      drivetrain: 'RWD',
      chargingDC: 'DC 194 kW (10-80% ใน 24 นาที, 30-80% ใน 15 นาที)',
      chargingAC: 'AC 11 kW',
      v2l: 'ไม่ระบุ',
      warranty: '8 ปี (แบตเตอรี่)',
      safety: 'SBS (Smart Brake Support), 360° Camera with See-Through View, LDP (Lane Departure Prevention), ELK (Emergency Lane Keeping), RCW (Rear Collision Warning), SCM, LAS, LDWS, ABSM, RCTA, DOW, FDM, Driver Monitoring, TPMS, HBC, FCW, AEB, HLA, DSC, Electric Parking Brake with Auto Hold, Airbags 9 ตัว (รวม Center Airbag)',
      length: 4921, // mm
      width: 1890, // mm (excluding mirrors)
      height: 1491, // mm
      wheelbase: 2895, // mm
      trunk: '336 ลิตร (ท้ายรถ), 1,074 ลิตร (พับเบาะหลัง), 72 ลิตร (frunk)',
      seats: 5, // ตามมาตรฐาน sedan
    };

    for (const variant of variants) {
      const existing = await prisma.nevVariant.findFirst({
        where: {
          modelId: mazda6e.id,
          name: variant.name
        }
      });

      if (existing) {
        console.log(`⚠️  Variant already exists: ${variant.fullName}`);
        continue;
      }

      const created = await prisma.nevVariant.create({
        data: {
          modelId: mazda6e.id,
          name: variant.name,
          fullName: variant.fullName,
          slug: `mazda6e-${variant.name.toLowerCase()}`,
          priceBaht: variant.price,
          
          // Motor & Performance
          motorKw: commonSpecs.power, // kW
          motorHp: commonSpecs.horsepower, // hp
          torqueNm: commonSpecs.torque, // Nm
          accel0100: commonSpecs.acceleration, // seconds
          topSpeedKmh: commonSpecs.topSpeed, // km/h
          drivetrain: commonSpecs.drivetrain,
          
          // Battery & Range
          batteryKwh: commonSpecs.batteryCapacity, // kWh
          rangeKm: commonSpecs.range, // km
          rangeStandard: 'WLTP',
          
          // Charging
          dcChargeKw: 194, // kW
          dcChargeMin: 24, // 10-80% (นาที)
          acChargeKw: 11, // kW
          
          // Dimensions
          lengthMm: commonSpecs.length,
          widthMm: commonSpecs.width,
          heightMm: commonSpecs.height,
          wheelbaseMm: commonSpecs.wheelbase,
          trunkLitres: 336, // ท้ายรถ (ไม่พับเบาะ)
          
          // Warranty
          warrantyVehicle: 'ไม่ระบุในเอกสาร',
          warrantyBattery: '8 ปี (แบตเตอรี่)',
          
          // Features (JSON format)
          features: JSON.stringify({
            safety: [
              'SBS (Smart Brake Support)',
              '360° Camera with See-Through View',
              'LDP (Lane Departure Prevention)',
              'ELK (Emergency Lane Keeping)',
              'RCW (Rear Collision Warning)',
              'SCM (Second Collision Monitoring)',
              'LAS (Lane Keeping Assist)',
              'LDWS (Lane Departure Warning)',
              'ABSM (Advanced Blind Spot Monitoring)',
              'RCTA (Rear Cross Traffic Alert)',
              'DOW (Door Opening Warning)',
              'FDM (Forward Distance Monitoring)',
              'Driver Monitoring System',
              'TPMS (Tire Pressure Monitoring)',
              'HBC (High Beam Control)',
              'FCW/AEB (Front Collision Warning + Auto Emergency Braking)',
              'HLA (Hill Launch Assist)',
              'DSC (Dynamic Stability Control)',
              'Electric Parking Brake with Auto Hold',
              'Airbags 9 ตัว (รวม Center Airbag)'
            ],
            comfort: [
              'Frunk 72 ลิตร',
              'Trunk: 336 ล. (ปกติ), 1,074 ล. (พับเบาะ)'
            ]
          }),
          
          // V2L
          hasV2l: false, // ไม่ระบุในเอกสาร
          
          // Source
          dataSource: 'manual_pdf_ocr',
          lastVerified: new Date(),
        }
      });

      console.log(`✅ Created variant: ${created.fullName} (${created.priceBaht.toLocaleString()} ฿)`);
    }

    console.log('\n✅ Mazda6e added to NEV Database successfully!');
  } catch (error) {
    console.error('❌ Error adding Mazda6e:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addMazda6e();
