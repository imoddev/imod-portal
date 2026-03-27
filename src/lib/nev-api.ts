// NEV Database API
// ดึงข้อมูลรถยนต์ไฟฟ้าจาก Prisma Database

import { prisma } from './prisma';

export interface EVCarData {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  specs: {
    power?: string;
    horsepower?: string;
    torque?: string;
    battery?: string;
    batteryType?: string;
    range?: string;
    acceleration?: string;
    topSpeed?: string;
    drivetrain?: string;
    chargingDC?: string;
    chargingAC?: string;
    v2l?: string;
    warranty?: string;
    safety?: string;
    length?: string;
    width?: string;
    height?: string;
    wheelbase?: string;
    weight?: string;
    seats?: number;
    trunk?: string;
  };
}

// ดึงข้อมูลรถทั้งหมด
export async function getAllEVCars(): Promise<EVCarData[]> {
  const variants = await prisma.nevVariant.findMany({
    where: {
      isActive: true,
      priceBaht: { not: null },
    },
    include: {
      model: {
        include: {
          brand: true,
        },
      },
      safety: true,
      evFeatures: true,
      battery: true,
      dimensions: true,
      powertrain: true,
      wheels: true,
    },
    orderBy: {
      priceBaht: 'asc',
    },
  });

  return variants.map((v) => ({
    id: v.id,
    name: v.fullName || `${v.model.brand.name} ${v.model.name} ${v.name}`,
    brand: v.model.brand.name,
    model: v.model.name,
    price: v.priceBaht || 0,
    specs: {
      power: v.motorKw ? `${v.motorKw} kW` : undefined,
      horsepower: v.motorHp ? `${v.motorHp} hp` : undefined,
      torque: v.torqueNm ? `${v.torqueNm} Nm` : undefined,
      battery: v.batteryKwh ? `${v.batteryKwh} kWh` : undefined,
      batteryType: v.battery?.batteryChemistry || undefined,
      range: v.rangeKm
        ? `${v.rangeKm} km (${v.rangeStandard || 'NEDC'})`
        : undefined,
      acceleration: v.accel0100 ? `${v.accel0100} วินาที` : undefined,
      topSpeed: v.topSpeedKmh ? `${v.topSpeedKmh} km/h` : undefined,
      drivetrain: v.drivetrain || undefined,
      chargingDC: v.dcChargeKw && v.dcChargeMin
        ? `DC ${v.dcChargeKw} kW (10-80% ใน ${v.dcChargeMin} นาที)`
        : v.dcChargeKw
        ? `DC ${v.dcChargeKw} kW`
        : undefined,
      chargingAC: v.acChargeKw ? `AC ${v.acChargeKw} kW` : undefined,
      v2l: v.hasV2l
        ? v.v2lKw
          ? `รองรับ ${v.v2lKw} kW`
          : 'รองรับ'
        : 'ไม่รองรับ',
      warranty: v.warrantyBattery && v.warrantyVehicle
        ? `${v.warrantyBattery} (แบต), ${v.warrantyVehicle} (รถ)`
        : v.warrantyBattery || v.warrantyVehicle || undefined,
      safety: buildSafetyString(v.safety, v.features),
      length: v.lengthMm ? `${v.lengthMm} มม.` : undefined,
      width: v.widthMm ? `${v.widthMm} มม.` : undefined,
      height: v.heightMm ? `${v.heightMm} มม.` : undefined,
      wheelbase: v.wheelbaseMm ? `${v.wheelbaseMm} มม.` : undefined,
      weight: v.curbWeightKg ? `${v.curbWeightKg} กก.` : undefined,
      seats: v.model.seats || undefined,
      trunk: v.trunkLitres ? `${v.trunkLitres} ลิตร` : undefined,
    },
  }));
}

// สร้าง Safety Feature String
function buildSafetyString(safety: any, featuresJson?: string | null): string | undefined {
  const features: string[] = [];

  // Try to parse features JSON first (Mazda6e style)
  if (featuresJson) {
    try {
      const parsed = JSON.parse(featuresJson);
      if (parsed.safety && Array.isArray(parsed.safety)) {
        return parsed.safety.join(', ');
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }

  // Fallback: build from NevSafety table
  if (!safety) return undefined;

  // ADAS
  if (safety.adaptiveCruise || safety.intelligentCruise) features.push('ACC');
  if (safety.autoEmergencyBrake) features.push('AEB');
  if (safety.laneDepartureWarn) features.push('LDW');
  if (safety.laneKeepAssist) features.push('LKA');
  if (safety.blindSpotDetection) features.push('BSM');
  if (safety.rearCrossTrafficAlert) features.push('RCTA');
  if (safety.camera360) features.push('360° Camera');

  // Airbags
  const totalAirbags =
    (safety.airbagsFront || 0) +
    (safety.airbagsSide || 0) +
    (safety.airbagsCurtain ? 1 : 0) +
    (safety.airbagsCenter ? 1 : 0);

  if (totalAirbags > 0) features.push(`Airbags ${totalAirbags} ตัว`);

  return features.length > 0 ? features.join(', ') : undefined;
}
