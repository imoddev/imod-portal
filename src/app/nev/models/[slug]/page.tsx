'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Extended specs interfaces (V2.0)
interface Multimedia {
  displaySize?: number;
  displayType?: string;
  appleCarPlay?: boolean;
  androidAuto?: boolean;
  audioSystem?: string;
  speakerCount?: number;
  voiceControl?: boolean;
  navigation?: boolean;
  wirelessCharging?: boolean;
  wirelessChargingWatt?: number;
  climateZones?: number;
  rearVents?: boolean;
  pm25Filter?: boolean;
  usbCFront?: number;
  usbCRear?: number;
}

interface Safety {
  airbagsFront?: number;
  airbagsSide?: number;
  airbagsCurtain?: boolean;
  camera360?: boolean;
  parkingSensorsFront?: number;
  parkingSensorsRear?: number;
  esc?: boolean;
  adaptiveCruise?: boolean;
  autoEmergencyBrake?: boolean;
  laneDepartureWarn?: boolean;
  laneKeepAssist?: boolean;
  blindSpotDetection?: boolean;
  driverMonitoring?: boolean;
  tpms?: boolean;
  rearCrossTrafficAlert?: boolean;
  autoHighBeam?: boolean;
}

interface Interior {
  seatMaterial?: string;
  driverSeatPower?: boolean;
  driverSeatAdjustments?: number;
  driverSeatVentilation?: boolean;
  driverSeatMemory?: boolean;
  hudDisplay?: boolean;
  rearviewMirrorAutoDim?: boolean;
  sideMirrorsFold?: boolean;
  ambientLighting?: boolean;
  ambientLightingType?: string;
  isofixPoints?: number;
}

interface Exterior {
  headlightsType?: string;
  headlightsAuto?: boolean;
  drlType?: string;
  taillightsType?: string;
  sunroofType?: string;
  sunroofElectric?: boolean;
  powerTailgate?: boolean;
  kickSensorTailgate?: boolean;
  doorHandlesRetractable?: boolean;
}

interface Powertrain {
  drivetrain?: string;
  frontMotorType?: string;
  frontMotorKw?: number;
  frontMotorNm?: number;
  rearMotorType?: string;
  rearMotorKw?: number;
  rearMotorNm?: number;
  totalPowerKw?: number;
  totalTorqueNm?: number;
  accel0100?: number;
  topSpeedKmh?: number;
}

interface Suspension {
  frontType?: string;
  rearType?: string;
  adaptiveSuspension?: string;
}

interface Brakes {
  frontBrakeType?: string;
  rearBrakeType?: string;
  caliperColor?: string;
}

interface Wheels {
  wheelSizeInch?: number;
  wheelMaterial?: string;
  tireSizeFront?: string;
  tireSizeRear?: string;
  spareTire?: boolean;
  spareType?: string;
}

interface Battery {
  batteryType?: string;
  batteryKwh?: number;
  batteryVoltage?: number;
  batteryChemistry?: string;
}

interface Dimensions {
  seatingCapacity?: number;
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  wheelbaseMm?: number;
  groundClearanceMm?: number;
  trunkCapacityFrontL?: number;
  trunkCapacityRearL?: number;
  curbWeightKg?: number;
  gvwKg?: number;
  turningRadiusM?: number;
}

interface EVFeatures {
  rangeNEDC?: number;
  rangeWLTP?: number;
  acChargeType?: string;
  acChargeMaxKw?: number;
  dcChargeType?: string;
  dcChargeMaxKw?: number;
  dcCharge10to80Min?: number;
  v2l?: boolean;
  v2lAccessories?: boolean;
}

interface Variant {
  id: string;
  name: string;
  fullName: string;
  priceBaht: number | null;
  batteryKwh: number | null;
  rangeKm: number | null;
  rangeStandard: string | null;
  motorCount: number;
  motorKw: number | null;
  motorHp: number | null;
  torqueNm: number | null;
  topSpeedKmh: number | null;
  accel0100: number | null;
  drivetrain: string | null;
  dcChargeKw: number | null;
  dcChargeMin: number | null;
  acChargeKw: number | null;
  chargePort: string | null;
  hasV2l: boolean;
  v2lKw: number | null;
  lengthMm: number | null;
  widthMm: number | null;
  heightMm: number | null;
  wheelbaseMm: number | null;
  groundClearanceMm: number | null;
  curbWeightKg: number | null;
  grossWeightKg: number | null;
  trunkLitres: number | null;
  warrantyVehicle: string | null;
  warrantyBattery: string | null;
  features: Record<string, string[]> | null;
  // Extended specs V2.0
  multimedia?: Multimedia | null;
  safety?: Safety | null;
  interior?: Interior | null;
  exterior?: Exterior | null;
  powertrain?: Powertrain | null;
  suspension?: Suspension | null;
  brakes?: Brakes | null;
  wheels?: Wheels | null;
  battery?: Battery | null;
  dimensions?: Dimensions | null;
  evFeatures?: EVFeatures | null;
  externalLinks?: Array<{
    type: string;
    label: string;
    url: string;
    ogImage?: string;
  }> | null;
}

interface Model {
  id: string;
  name: string;
  nameTh: string | null;
  slug: string;
  year: number | null;
  bodyType: string | null;
  seats: number | null;
  powertrain: string;
  segment: string | null;
  overview: string | null;
  imageUrl: string | null;
  brand: {
    id: string;
    name: string;
    nameTh: string | null;
    slug: string;
  };
  variants: Variant[];
}

export default function ModelDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  useEffect(() => {
    fetch(`/api/nev/models/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('Model not found');
        return r.json();
      })
      .then(data => {
        setModel(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-slate-400 text-lg">ไม่พบข้อมูลรถรุ่นนี้</p>
          <Link href="/nev" className="text-emerald-400 hover:underline mt-4 inline-block">
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  const selectedVariant = model.variants[selectedVariantIndex] || null;

  const formatNumber = (num: number | null) => {
    if (num === null) return '-';
    return num.toLocaleString('th-TH');
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return 'ติดต่อสอบถาม';
    return `฿${price.toLocaleString('th-TH')}`;
  };

  const getPowertrainStyle = (powertrain: string) => {
    switch (powertrain) {
      case 'BEV': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'PHEV': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'HEV': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'REEV': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/nev" className="hover:text-white transition-colors">NEV Database</Link>
            <span>/</span>
            <Link href={`/nev/brands/${model.brand.slug}`} className="hover:text-white transition-colors">{model.brand.name}</Link>
            <span>/</span>
            <span className="text-white font-medium">{model.name}</span>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-8">
            <div className="text-sm text-emerald-400 mb-2">{model.brand.nameTh || model.brand.name}</div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {model.brand.name} {model.name}
            </h1>
            {model.nameTh && (
              <div className="text-xl text-slate-400 mb-4">{model.nameTh}</div>
            )}
            {model.overview && (
              <p className="text-slate-400 max-w-2xl mx-auto">{model.overview}</p>
            )}
          </div>

          {/* Tags */}
          <div className="flex justify-center gap-3 flex-wrap mb-8">
            <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${getPowertrainStyle(model.powertrain)}`}>
              ⚡ {model.powertrain}
            </span>
            {model.bodyType && (
              <span className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-700/50 text-slate-300 border border-slate-600">
                {model.bodyType}
              </span>
            )}
            {model.segment && (
              <span className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-700/50 text-slate-300 border border-slate-600">
                Segment {model.segment}
              </span>
            )}
            {model.seats && (
              <span className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-700/50 text-slate-300 border border-slate-600">
                {model.seats} ที่นั่ง
              </span>
            )}
          </div>

          {/* Image */}
          <div className="max-w-3xl mx-auto aspect-[16/9] bg-slate-700/50 rounded-2xl overflow-hidden flex items-center justify-center">
            {model.imageUrl ? (
              <img src={model.imageUrl} alt={model.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-8xl opacity-30">🚗</span>
            )}
          </div>
        </div>
      </section>

      {/* Variant Selector */}
      {model.variants.length > 1 && (
        <section className="border-b border-slate-700 bg-slate-800/30 backdrop-blur-sm sticky top-[65px] z-40">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto py-4">
              {model.variants.map((variant, index) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariantIndex(index)}
                  className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                    selectedVariantIndex === index
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                      : 'bg-slate-700/50 text-slate-400 hover:text-white border border-slate-600'
                  }`}
                >
                  {variant.name}
                  {variant.priceBaht && (
                    <span className="ml-2 text-sm opacity-70">
                      ฿{(variant.priceBaht / 1000000).toFixed(2)}M
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Specs */}
      {selectedVariant && (
        <main className="container mx-auto px-4 py-16">
          {/* Price Header */}
          <div className="text-center mb-16">
            <div className="text-sm text-slate-400 mb-2">{selectedVariant.fullName}</div>
            <div className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              {formatPrice(selectedVariant.priceBaht)}
            </div>
          </div>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            <SpecCard icon="🔋" value={selectedVariant.rangeKm || '-'} unit={`กม. (${selectedVariant.rangeStandard || 'NEDC'})`} />
            <SpecCard icon="⚡" value={selectedVariant.motorHp || '-'} unit="แรงม้า" />
            <SpecCard icon="🏎️" value={selectedVariant.accel0100 || '-'} unit="วินาที (0-100)" />
            <SpecCard icon="🚀" value={selectedVariant.topSpeedKmh || '-'} unit="กม./ชม." />
          </div>

          {/* Detailed Specs */}
          <div className="space-y-12">
            {/* Battery & Range */}
            <SpecSection title="🔋 แบตเตอรี่และระยะทาง">
              <SpecRow label="ความจุแบตเตอรี่" value={selectedVariant.batteryKwh ? `${selectedVariant.batteryKwh} kWh` : '-'} />
              <SpecRow label="ระยะทาง" value={selectedVariant.rangeKm ? `${formatNumber(selectedVariant.rangeKm)} กม. (${selectedVariant.rangeStandard || 'NEDC'})` : '-'} />
              <SpecRow label="DC Fast Charging" value={selectedVariant.dcChargeKw ? `${selectedVariant.dcChargeKw} kW` : '-'} highlight />
              <SpecRow label="DC Charge (10-80%)" value={selectedVariant.dcChargeMin ? `${selectedVariant.dcChargeMin} นาที` : '-'} />
              <SpecRow label="AC Charging" value={selectedVariant.acChargeKw ? `${selectedVariant.acChargeKw} kW` : '-'} />
              <SpecRow label="พอร์ตชาร์จ" value={selectedVariant.chargePort || '-'} />
              <SpecRow label="V2L" value={selectedVariant.hasV2l ? `รองรับ${selectedVariant.v2lKw ? ` (${selectedVariant.v2lKw} kW)` : ''}` : 'ไม่รองรับ'} />
            </SpecSection>

            {/* Performance */}
            <SpecSection title="🏎️ สมรรถนะ">
              <SpecRow label="จำนวนมอเตอร์" value={selectedVariant.motorCount.toString()} />
              <SpecRow label="กำลังมอเตอร์" value={selectedVariant.motorKw ? `${selectedVariant.motorKw} kW` : '-'} />
              <SpecRow label="แรงม้า" value={selectedVariant.motorHp ? `${formatNumber(selectedVariant.motorHp)} hp` : '-'} highlight />
              <SpecRow label="แรงบิดสูงสุด" value={selectedVariant.torqueNm ? `${formatNumber(selectedVariant.torqueNm)} Nm` : '-'} highlight />
              <SpecRow label="อัตราเร่ง 0-100 กม./ชม." value={selectedVariant.accel0100 ? `${selectedVariant.accel0100} วินาที` : '-'} highlight />
              <SpecRow label="ความเร็วสูงสุด" value={selectedVariant.topSpeedKmh ? `${formatNumber(selectedVariant.topSpeedKmh)} กม./ชม.` : '-'} />
              <SpecRow label="ระบบขับเคลื่อน" value={selectedVariant.drivetrain || '-'} />
            </SpecSection>

            {/* Dimensions */}
            <SpecSection title="📐 ขนาดและน้ำหนัก">
              <SpecRow label="ความยาว" value={selectedVariant.lengthMm ? `${formatNumber(selectedVariant.lengthMm)} มม.` : '-'} />
              <SpecRow label="ความกว้าง" value={selectedVariant.widthMm ? `${formatNumber(selectedVariant.widthMm)} มม.` : '-'} />
              <SpecRow label="ความสูง" value={selectedVariant.heightMm ? `${formatNumber(selectedVariant.heightMm)} มม.` : '-'} />
              <SpecRow label="ระยะฐานล้อ" value={selectedVariant.wheelbaseMm ? `${formatNumber(selectedVariant.wheelbaseMm)} มม.` : '-'} />
              <SpecRow label="ระยะห่างจากพื้น" value={selectedVariant.groundClearanceMm ? `${formatNumber(selectedVariant.groundClearanceMm)} มม.` : '-'} />
              <SpecRow label="น้ำหนักตัวรถ" value={selectedVariant.curbWeightKg ? `${formatNumber(selectedVariant.curbWeightKg)} กก.` : '-'} />
              <SpecRow label="น้ำหนักรวม" value={selectedVariant.grossWeightKg ? `${formatNumber(selectedVariant.grossWeightKg)} กก.` : '-'} />
              <SpecRow label="พื้นที่บรรทุก" value={selectedVariant.trunkLitres ? `${formatNumber(selectedVariant.trunkLitres)} ลิตร` : '-'} />
            </SpecSection>

            {/* Warranty */}
            <SpecSection title="🛡️ การรับประกัน">
              <SpecRow label="รับประกันตัวรถ" value={selectedVariant.warrantyVehicle || '-'} highlight />
              <SpecRow label="รับประกันแบตเตอรี่" value={selectedVariant.warrantyBattery || '-'} highlight />
            </SpecSection>

            {/* Extended Specs V2.0 - Powertrain */}
            {selectedVariant.powertrain && (
              <SpecSection title="⚙️ ระบบส่งกำลัง">
                <SpecRow label="ระบบขับเคลื่อน" value={selectedVariant.powertrain.drivetrain || '-'} highlight />
                {selectedVariant.powertrain.frontMotorType && (
                  <SpecRow label="มอเตอร์หน้า" value={`${selectedVariant.powertrain.frontMotorType}${selectedVariant.powertrain.frontMotorKw ? ` (${selectedVariant.powertrain.frontMotorKw} kW / ${selectedVariant.powertrain.frontMotorNm} Nm)` : ''}`} />
                )}
                {selectedVariant.powertrain.rearMotorType && (
                  <SpecRow label="มอเตอร์หลัง" value={`${selectedVariant.powertrain.rearMotorType}${selectedVariant.powertrain.rearMotorKw ? ` (${selectedVariant.powertrain.rearMotorKw} kW / ${selectedVariant.powertrain.rearMotorNm} Nm)` : ''}`} />
                )}
                {selectedVariant.powertrain.totalPowerKw && (
                  <SpecRow label="กำลังรวม" value={`${selectedVariant.powertrain.totalPowerKw} kW (${Math.round(selectedVariant.powertrain.totalPowerKw * 1.341)} hp)`} highlight />
                )}
                {selectedVariant.powertrain.totalTorqueNm && (
                  <SpecRow label="แรงบิดรวม" value={`${selectedVariant.powertrain.totalTorqueNm} Nm`} highlight />
                )}
              </SpecSection>
            )}

            {/* Suspension */}
            {selectedVariant.suspension && (
              <SpecSection title="🔧 ระบบกันสะเทือน">
                <SpecRow label="ด้านหน้า" value={selectedVariant.suspension.frontType || '-'} />
                <SpecRow label="ด้านหลัง" value={selectedVariant.suspension.rearType || '-'} />
                {selectedVariant.suspension.adaptiveSuspension && (
                  <SpecRow label="ระบบปรับตั้ง" value={selectedVariant.suspension.adaptiveSuspension} highlight />
                )}
              </SpecSection>
            )}

            {/* Brakes */}
            {selectedVariant.brakes && (
              <SpecSection title="🛑 ระบบเบรก">
                <SpecRow label="เบรกหน้า" value={selectedVariant.brakes.frontBrakeType || '-'} />
                <SpecRow label="เบรกหลัง" value={selectedVariant.brakes.rearBrakeType || '-'} />
                {selectedVariant.brakes.caliperColor && (
                  <SpecRow label="สีคาลิปเปอร์" value={selectedVariant.brakes.caliperColor} />
                )}
              </SpecSection>
            )}

            {/* Wheels & Tires */}
            {selectedVariant.wheels && (
              <SpecSection title="🛞 ล้อและยาง">
                {selectedVariant.wheels.wheelSizeInch && (
                  <SpecRow label="ขนาดล้อ" value={`${selectedVariant.wheels.wheelSizeInch} นิ้ว (${selectedVariant.wheels.wheelMaterial || 'Alloy'})`} />
                )}
                <SpecRow label="ยางหน้า" value={selectedVariant.wheels.tireSizeFront || '-'} />
                <SpecRow label="ยางหลัง" value={selectedVariant.wheels.tireSizeRear || '-'} />
                <SpecRow label="ยางอะไหล่" value={selectedVariant.wheels.spareTire ? (selectedVariant.wheels.spareType || 'มี') : 'ไม่มี'} />
              </SpecSection>
            )}

            {/* Safety & ADAS */}
            {selectedVariant.safety && (
              <SpecSection title="🛡️ ระบบความปลอดภัยและ ADAS">
                {(selectedVariant.safety.airbagsFront || selectedVariant.safety.airbagsSide) && (
                  <SpecRow label="ถุงลมนิรภัย" value={`${(selectedVariant.safety.airbagsFront || 0) + (selectedVariant.safety.airbagsSide || 0) + (selectedVariant.safety.airbagsCurtain ? 2 : 0)} ตำแหน่ง`} highlight />
                )}
                <SpecRow label="กล้อง 360°" value={selectedVariant.safety.camera360 ? '✓' : '-'} />
                <SpecRow label="เซนเซอร์ถอย" value={selectedVariant.safety.parkingSensorsRear ? `${selectedVariant.safety.parkingSensorsRear} จุด` : '-'} />
                <SpecRow label="ESP/ESC" value={selectedVariant.safety.esc ? '✓' : '-'} />
                <SpecRow label="Adaptive Cruise" value={selectedVariant.safety.adaptiveCruise ? '✓' : '-'} highlight />
                <SpecRow label="เบรกฉุกเฉินอัตโนมัติ (AEB)" value={selectedVariant.safety.autoEmergencyBrake ? '✓' : '-'} highlight />
                <SpecRow label="แจ้งเตือนออกนอกเลน (LDW)" value={selectedVariant.safety.laneDepartureWarn ? '✓' : '-'} />
                <SpecRow label="ช่วยรักษาเลน (LKA)" value={selectedVariant.safety.laneKeepAssist ? '✓' : '-'} />
                <SpecRow label="จุดบอด (BSD)" value={selectedVariant.safety.blindSpotDetection ? '✓' : '-'} />
                <SpecRow label="ระบบเตือนข้ามหลัง (RCTA)" value={selectedVariant.safety.rearCrossTrafficAlert ? '✓' : '-'} />
                <SpecRow label="ไฟสูงอัตโนมัติ" value={selectedVariant.safety.autoHighBeam ? '✓' : '-'} />
                <SpecRow label="ตรวจจับคนขับ (DMS)" value={selectedVariant.safety.driverMonitoring ? '✓' : '-'} />
                <SpecRow label="TPMS" value={selectedVariant.safety.tpms ? '✓' : '-'} />
              </SpecSection>
            )}

            {/* Multimedia */}
            {selectedVariant.multimedia && (
              <SpecSection title="🎵 มัลติมีเดียและความสะดวกสบาย">
                {selectedVariant.multimedia.displaySize && (
                  <SpecRow label="หน้าจอ" value={`${selectedVariant.multimedia.displaySize}" ${selectedVariant.multimedia.displayType || ''}`} highlight />
                )}
                <SpecRow label="Apple CarPlay" value={selectedVariant.multimedia.appleCarPlay ? '✓' : '-'} />
                <SpecRow label="Android Auto" value={selectedVariant.multimedia.androidAuto ? '✓' : '-'} />
                {selectedVariant.multimedia.audioSystem && (
                  <SpecRow label="ระบบเสียง" value={`${selectedVariant.multimedia.audioSystem}${selectedVariant.multimedia.speakerCount ? ` (${selectedVariant.multimedia.speakerCount} ลำโพง)` : ''}`} />
                )}
                <SpecRow label="สั่งงานเสียง" value={selectedVariant.multimedia.voiceControl ? '✓' : '-'} />
                <SpecRow label="ระบบนำทาง" value={selectedVariant.multimedia.navigation ? '✓' : '-'} />
                {selectedVariant.multimedia.wirelessCharging && (
                  <SpecRow label="ชาร์จไร้สาย" value={selectedVariant.multimedia.wirelessChargingWatt ? `${selectedVariant.multimedia.wirelessChargingWatt}W` : '✓'} />
                )}
                {selectedVariant.multimedia.climateZones && (
                  <SpecRow label="แอร์" value={`${selectedVariant.multimedia.climateZones} โซน${selectedVariant.multimedia.rearVents ? ' + ช่องแอร์หลัง' : ''}`} />
                )}
                <SpecRow label="กรอง PM2.5" value={selectedVariant.multimedia.pm25Filter ? '✓' : '-'} />
              </SpecSection>
            )}

            {/* Interior */}
            {selectedVariant.interior && (
              <SpecSection title="🛋️ อุปกรณ์ภายใน">
                {selectedVariant.interior.seatMaterial && (
                  <SpecRow label="วัสดุเบาะ" value={selectedVariant.interior.seatMaterial} highlight />
                )}
                <SpecRow label="เบาะคนขับไฟฟ้า" value={selectedVariant.interior.driverSeatPower ? `${selectedVariant.interior.driverSeatAdjustments || ''} ทิศทาง` : '-'} />
                <SpecRow label="เบาะระบายอากาศ" value={selectedVariant.interior.driverSeatVentilation ? '✓' : '-'} />
                <SpecRow label="Memory Seat" value={selectedVariant.interior.driverSeatMemory ? '✓' : '-'} />
                <SpecRow label="HUD" value={selectedVariant.interior.hudDisplay ? '✓' : '-'} highlight />
                <SpecRow label="กระจกมองหลังตัดแสงอัตโนมัติ" value={selectedVariant.interior.rearviewMirrorAutoDim ? '✓' : '-'} />
                <SpecRow label="กระจกข้างพับอัตโนมัติ" value={selectedVariant.interior.sideMirrorsFold ? '✓' : '-'} />
                {selectedVariant.interior.ambientLighting && (
                  <SpecRow label="ไฟ Ambient" value={selectedVariant.interior.ambientLightingType || '✓'} />
                )}
                {selectedVariant.interior.isofixPoints && (
                  <SpecRow label="ISOFIX" value={`${selectedVariant.interior.isofixPoints} จุด`} />
                )}
              </SpecSection>
            )}

            {/* Exterior */}
            {selectedVariant.exterior && (
              <SpecSection title="🚗 อุปกรณ์ภายนอก">
                {selectedVariant.exterior.headlightsType && (
                  <SpecRow label="ไฟหน้า" value={`${selectedVariant.exterior.headlightsType}${selectedVariant.exterior.headlightsAuto ? ' (Auto)' : ''}`} highlight />
                )}
                {selectedVariant.exterior.drlType && (
                  <SpecRow label="ไฟกลางวัน (DRL)" value={selectedVariant.exterior.drlType} />
                )}
                {selectedVariant.exterior.taillightsType && (
                  <SpecRow label="ไฟท้าย" value={selectedVariant.exterior.taillightsType} />
                )}
                {selectedVariant.exterior.sunroofType && (
                  <SpecRow label="ซันรูฟ" value={`${selectedVariant.exterior.sunroofType}${selectedVariant.exterior.sunroofElectric ? ' (ไฟฟ้า)' : ''}`} highlight />
                )}
                <SpecRow label="ประตูท้ายไฟฟ้า" value={selectedVariant.exterior.powerTailgate ? '✓' : '-'} />
                <SpecRow label="เซนเซอร์เตะเปิด" value={selectedVariant.exterior.kickSensorTailgate ? '✓' : '-'} />
                <SpecRow label="มือจับประตูซ่อน" value={selectedVariant.exterior.doorHandlesRetractable ? '✓' : '-'} />
              </SpecSection>
            )}

            {/* Legacy Features (fallback) */}
            {selectedVariant.features && Object.keys(selectedVariant.features).length > 0 && !selectedVariant.multimedia && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6 pb-2 border-b border-slate-700 flex items-center gap-2">
                  ✨ ฟีเจอร์เพิ่มเติม
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(selectedVariant.features).flatMap(([, items]) => 
                    (Array.isArray(items) ? items : [items]).map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                        <span className="text-emerald-400">✓</span>
                        <span className="text-slate-300 text-sm">{item}</span>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}
          </div>

          {/* External Links */}
          {selectedVariant.externalLinks && Array.isArray(selectedVariant.externalLinks) && selectedVariant.externalLinks.length > 0 && (
            <section className="mt-12 pt-8 border-t border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">
                🔗 ลิงก์ที่เกี่ยวข้อง
              </h2>
              
              {/* Group by type */}
              {['official', 'review', 'news', 'spec', 'other'].map(type => {
                const links = (selectedVariant.externalLinks || []).filter((l: any) => l.type === type);
                if (links.length === 0) return null;
                
                const typeLabels: Record<string, string> = {
                  official: '🏢 เว็บไซต์ทางการ',
                  review: '⭐ รีวิว',
                  news: '📰 ข่าว',
                  spec: '📋 สเปค',
                  other: '🔗 อื่นๆ',
                };
                
                return (
                  <div key={type} className="mb-8">
                    <h3 className="text-lg font-semibold text-slate-300 mb-4">{typeLabels[type]}</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {links.map((link: any, idx: number) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-colors"
                        >
                          {link.ogImage && (
                            <div className="aspect-video bg-slate-900 overflow-hidden">
                              <img 
                                src={link.ogImage} 
                                alt={link.label}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <div className="font-medium text-white group-hover:text-emerald-400 transition-colors">
                              {link.label}
                            </div>
                            <div className="text-sm text-slate-500 truncate mt-1">
                              {link.url.replace(/^https?:\/\//, '').split('/')[0]}
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {/* Back Link */}
          <div className="mt-16 pt-8 border-t border-slate-700">
            <Link
              href={`/nev/brands/${model.brand.slug}`}
              className="text-emerald-400 hover:underline"
            >
              ← ดูรถ {model.brand.name} ทั้งหมด
            </Link>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <p className="text-white font-semibold mb-2">NEV Database Thailand</p>
          <p className="text-slate-500 text-sm mb-4">© 2026 iMoD (Mod Media Co., Ltd.)</p>
          <p className="text-xs text-slate-600">Developer Beta 1.0</p>
        </div>
      </footer>
    </div>
  );
}

function SpecCard({ icon, value, unit }: { icon: string; value: string | number; unit: string }) {
  return (
    <div className="text-center p-6 bg-slate-800/50 border border-slate-700 rounded-2xl">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-sm text-slate-400 mt-1">{unit}</div>
    </div>
  );
}

function SpecSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-6 pb-2 border-b border-slate-700">{title}</h2>
      <div className="grid md:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

function SpecRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-center p-4 rounded-xl ${
      highlight ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-800/50 border border-slate-700'
    }`}>
      <span className="text-slate-400">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-emerald-400' : 'text-white'}`}>{value}</span>
    </div>
  );
}
