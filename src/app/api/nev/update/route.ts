import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// API สำหรับ auto-save ข้อมูลที่แก้ไข
export async function POST(request: NextRequest) {
  try {
    const { variantId, field, value } = await request.json();

    if (!variantId || !field) {
      return NextResponse.json(
        { error: 'Missing variantId or field' },
        { status: 400 }
      );
    }

    // Parse value ตามประเภทของ field
    let parsedValue: any = value;

    // Fields ที่เป็นตัวเลข
    if (['motorKw', 'motorHp', 'torqueNm', 'batteryKwh', 'rangeKm', 
         'accel0100', 'topSpeedKmh', 'dcChargeKw', 'dcChargeMin', 
         'acChargeKw', 'v2lKw', 'lengthMm', 'widthMm', 'heightMm', 
         'wheelbaseMm', 'curbWeightKg', 'trunkLitres'].includes(field)) {
      parsedValue = parseFloat(value) || null;
    }

    // Fields ที่เป็น boolean
    if (['hasV2l', 'hasV2g'].includes(field)) {
      parsedValue = value === 'รองรับ' || value === 'true';
    }

    // อัปเดตลง database
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Map field names
    const fieldMap: Record<string, string> = {
      power: 'motorKw',
      horsepower: 'motorHp',
      torque: 'torqueNm',
      battery: 'batteryKwh',
      range: 'rangeKm',
      acceleration: 'accel0100',
      topSpeed: 'topSpeedKmh',
      chargingDC: 'dcChargeKw',
      chargingAC: 'acChargeKw',
      v2l: 'hasV2l',
      length: 'lengthMm',
      width: 'widthMm',
      height: 'heightMm',
      wheelbase: 'wheelbaseMm',
      weight: 'curbWeightKg',
      trunk: 'trunkLitres',
      seats: 'seats',
      drivetrain: 'drivetrain',
      batteryType: 'batteryType',
      warranty: 'warrantyVehicle',
      safety: 'safety',
    };

    const dbField = fieldMap[field] || field;
    updateData[dbField] = parsedValue;

    const updatedVariant = await prisma.nevVariant.update({
      where: { id: variantId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      updatedAt: updatedVariant.updatedAt,
    });
  } catch (error) {
    console.error('Auto-save failed:', error);
    return NextResponse.json(
      { error: 'Failed to save changes' },
      { status: 500 }
    );
  }
}
