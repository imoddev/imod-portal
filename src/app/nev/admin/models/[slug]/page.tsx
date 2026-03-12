'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Extended specs interfaces matching Schema V2.0
interface Multimedia {
  id: string;
  displaySize?: number | null;
  displayType?: string | null;
  appleCarPlay?: boolean;
  androidAuto?: boolean;
  audioSystem?: string | null;
  speakerCount?: number | null;
  voiceControl?: boolean;
  navigation?: boolean;
  wirelessCharging?: boolean;
  wirelessChargingWatt?: number | null;
  climateZones?: number | null;
  rearVents?: boolean;
  pm25Filter?: boolean;
  usbCFront?: number | null;
  usbCRear?: number | null;
}

interface Safety {
  id: string;
  airbagsFront?: number | null;
  airbagsSide?: number | null;
  airbagsCurtain?: boolean;
  camera360?: boolean;
  parkingSensorsFront?: number | null;
  parkingSensorsRear?: number | null;
  esc?: boolean;
  tcs?: boolean;
  ebd?: boolean;
  adaptiveCruise?: boolean;
  autoEmergencyBrake?: boolean;
  forwardCollisionWarn?: boolean;
  rearCollisionWarn?: boolean;
  laneDepartureWarn?: boolean;
  laneKeepAssist?: boolean;
  blindSpotDetection?: boolean;
  rearCrossTrafficAlert?: boolean;
  doorOpenWarning?: boolean;
  driverMonitoring?: boolean;
  tpms?: boolean;
}

interface Interior {
  id: string;
  seatMaterial?: string | null;
  driverSeatPower?: boolean;
  driverSeatAdjustments?: number | null;
  driverSeatVentilation?: boolean;
  driverSeatMemory?: boolean;
  hudDisplay?: boolean;
  rearviewMirrorAutoDim?: boolean;
  sideMirrorsFold?: boolean;
  ambientLighting?: boolean;
  ambientLightingType?: string | null;
  isofixPoints?: number | null;
}

interface Exterior {
  id: string;
  headlightsType?: string | null;
  headlightsAuto?: boolean;
  drlType?: string | null;
  taillightsType?: string | null;
  sunroofType?: string | null;
  sunroofElectric?: boolean;
  powerTailgate?: boolean;
  kickSensorTailgate?: boolean;
  doorHandlesRetractable?: boolean;
}

interface Powertrain {
  id: string;
  drivetrain?: string | null;
  frontMotorType?: string | null;
  frontMotorKw?: number | null;
  frontMotorNm?: number | null;
  rearMotorType?: string | null;
  rearMotorKw?: number | null;
  rearMotorNm?: number | null;
  totalPowerKw?: number | null;
  totalTorqueNm?: number | null;
  accel0100?: number | null;
  topSpeedKmh?: number | null;
}

interface Suspension {
  id: string;
  frontType?: string | null;
  rearType?: string | null;
  adaptiveSuspension?: string | null;
}

interface Brakes {
  id: string;
  frontBrakeType?: string | null;
  rearBrakeType?: string | null;
  caliperColor?: string | null;
}

interface Wheels {
  id: string;
  wheelSizeInch?: number | null;
  wheelMaterial?: string | null;
  tireSizeFront?: string | null;
  tireSizeRear?: string | null;
  spareTire?: boolean;
  spareType?: string | null;
}

interface Battery {
  id: string;
  batteryType?: string | null;
  batteryKwh?: number | null;
  batteryVoltage?: number | null;
  batteryChemistry?: string | null;
}

interface Dimensions {
  id: string;
  seatingCapacity?: number | null;
  lengthMm?: number | null;
  widthMm?: number | null;
  heightMm?: number | null;
  wheelbaseMm?: number | null;
  groundClearanceMm?: number | null;
  trunkCapacityFrontL?: number | null;
  trunkCapacityRearL?: number | null;
  curbWeightKg?: number | null;
  gvwKg?: number | null;
  turningRadiusM?: number | null;
}

interface EVFeatures {
  id: string;
  rangeNEDC?: number | null;
  rangeWLTP?: number | null;
  rangeEPA?: number | null;
  acChargeType?: string | null;
  acChargeMaxKw?: number | null;
  dcChargeType?: string | null;
  dcChargeMaxKw?: number | null;
  dcCharge10to80Min?: number | null;
  v2l?: boolean;
  v2lAccessories?: boolean;
  regenerativeBrake?: boolean;
}

interface Variant {
  id: string;
  name: string;
  fullName: string;
  slug: string;
  priceBaht: number | null;
  batteryKwh: number | null;
  rangeKm: number | null;
  rangeStandard: string | null;
  motorKw: number | null;
  motorHp: number | null;
  torqueNm: number | null;
  accel0100: number | null;
  topSpeedKmh: number | null;
  drivetrain: string | null;
  dcChargeKw: number | null;
  dcChargeMin: number | null;
  multimedia?: Multimedia | null;
  safety?: Safety | null;
  interior?: Interior | null;
  exterior?: Exterior | null;
  powertrain?: Powertrain | null;
  battery?: Battery | null;
  evFeatures?: EVFeatures | null;
  suspension?: Suspension | null;
  brakes?: Brakes | null;
  wheels?: Wheels | null;
  dimensions?: Dimensions | null;
}

interface Model {
  id: string;
  name: string;
  nameTh: string | null;
  slug: string;
  year: number | null;
  imageUrl: string | null;
  brand: {
    id: string;
    name: string;
    slug: string;
  };
  variants: Variant[];
}

export default function AdminModelDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedVariant, setExpandedVariant] = useState<string | null>(null);

  useEffect(() => {
    params.then(p => {
      fetch(`/api/nev/admin/models/${p.slug}`)
        .then(r => r.json())
        .then(data => {
          if (data.error) {
            setModel(null);
          } else {
            setModel(data);
            // Expand first variant by default
            if (data.variants && data.variants.length > 0) {
              setExpandedVariant(data.variants[0].id);
            }
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, [params]);

  const formatValue = (value: any, unit?: string): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return unit ? `${value} ${unit}` : value.toString();
    if (typeof value === 'string' && value.trim() === '') return 'N/A';
    return value.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-400">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-400 mb-4">❌ ไม่พบข้อมูล</p>
          <Link 
            href="/nev/admin/models" 
            className="text-emerald-400 hover:underline"
          >
            ← กลับไปหน้ารายการ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400 mb-1">
                <Link href="/nev/admin" className="hover:text-emerald-400">Admin</Link>
                {' › '}
                <Link href="/nev/admin/models" className="hover:text-emerald-400">Models</Link>
              </div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                {model.imageUrl && (
                  <img 
                    src={model.imageUrl} 
                    alt={model.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div>
                  <div>{model.brand.name} {model.name}</div>
                  <div className="text-sm text-slate-400 font-normal">
                    {model.variants.length} รุ่นย่อย
                  </div>
                </div>
              </h1>
            </div>
            <Link
              href={`/nev/models/${model.slug}`}
              target="_blank"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <span>👁️</span>
              <span>ดูหน้าบ้าน</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Variants List */}
        <div className="space-y-6">
          {model.variants.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 border border-slate-700 text-center">
              <p className="text-slate-400 text-lg">ยังไม่มีรุ่นย่อย</p>
            </div>
          ) : (
            model.variants.map((variant) => (
              <div 
                key={variant.id}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden"
              >
                {/* Variant Header */}
                <div className="p-6 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-2">
                        {variant.name}
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">ราคา:</span>
                          <span className="ml-2 text-white font-semibold">
                            {formatValue(variant.priceBaht, '฿')}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">แบตเตอรี่:</span>
                          <span className="ml-2 text-white font-semibold">
                            {formatValue(variant.batteryKwh, 'kWh')}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">ระยะทาง:</span>
                          <span className="ml-2 text-white font-semibold">
                            {formatValue(variant.rangeKm, 'km')}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">กำลังไฟ:</span>
                          <span className="ml-2 text-white font-semibold">
                            {formatValue(variant.motorHp, 'HP')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link
                        href={`/nev/admin/variants/${variant.slug}/edit`}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <span>✏️</span>
                        <span>แก้ไข</span>
                      </Link>
                      <button
                        onClick={() => setExpandedVariant(
                          expandedVariant === variant.id ? null : variant.id
                        )}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                      >
                        {expandedVariant === variant.id ? '▲ ซ่อน' : '▼ ดูรายละเอียด'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Specs (11 Categories) */}
                {expandedVariant === variant.id && (
                  <div className="p-6 space-y-6">
                    
                    {/* 1. Powertrain & Performance */}
                    <SpecSection title="🚗 Powertrain & Performance">
                      <SpecRow label="Drivetrain" value={formatValue(variant.powertrain?.drivetrain)} />
                      <SpecRow label="Total Power" value={formatValue(variant.powertrain?.totalPowerKw, 'kW')} />
                      <SpecRow label="Total Torque" value={formatValue(variant.powertrain?.totalTorqueNm, 'Nm')} />
                      <SpecRow label="0-100 km/h" value={formatValue(variant.powertrain?.accel0100, 's')} />
                      <SpecRow label="Top Speed" value={formatValue(variant.powertrain?.topSpeedKmh, 'km/h')} />
                      <SpecRow label="Front Motor Type" value={formatValue(variant.powertrain?.frontMotorType)} />
                      <SpecRow label="Front Motor Power" value={formatValue(variant.powertrain?.frontMotorKw, 'kW')} />
                      <SpecRow label="Rear Motor Type" value={formatValue(variant.powertrain?.rearMotorType)} />
                      <SpecRow label="Rear Motor Power" value={formatValue(variant.powertrain?.rearMotorKw, 'kW')} />
                    </SpecSection>

                    {/* 2. Battery */}
                    <SpecSection title="🔋 Battery">
                      <SpecRow label="Battery Type" value={formatValue(variant.battery?.batteryType)} />
                      <SpecRow label="Capacity" value={formatValue(variant.battery?.batteryKwh, 'kWh')} />
                      <SpecRow label="Voltage" value={formatValue(variant.battery?.batteryVoltage, 'V')} />
                      <SpecRow label="Chemistry" value={formatValue(variant.battery?.batteryChemistry)} />
                    </SpecSection>

                    {/* 3. EV Features */}
                    <SpecSection title="⚡ EV Features & Charging">
                      <SpecRow label="Range (NEDC)" value={formatValue(variant.evFeatures?.rangeNEDC, 'km')} />
                      <SpecRow label="Range (WLTP)" value={formatValue(variant.evFeatures?.rangeWLTP, 'km')} />
                      <SpecRow label="AC Charging Max" value={formatValue(variant.evFeatures?.acChargeMaxKw, 'kW')} />
                      <SpecRow label="DC Charging Max" value={formatValue(variant.evFeatures?.dcChargeMaxKw, 'kW')} />
                      <SpecRow label="DC 10-80%" value={formatValue(variant.evFeatures?.dcCharge10to80Min, 'min')} />
                      <SpecRow label="V2L" value={formatValue(variant.evFeatures?.v2l)} />
                      <SpecRow label="Regenerative Brake" value={formatValue(variant.evFeatures?.regenerativeBrake)} />
                    </SpecSection>

                    {/* 4. Dimensions */}
                    <SpecSection title="📏 Dimensions & Weight">
                      <SpecRow label="Seating Capacity" value={formatValue(variant.dimensions?.seatingCapacity)} />
                      <SpecRow label="Length" value={formatValue(variant.dimensions?.lengthMm, 'mm')} />
                      <SpecRow label="Width" value={formatValue(variant.dimensions?.widthMm, 'mm')} />
                      <SpecRow label="Height" value={formatValue(variant.dimensions?.heightMm, 'mm')} />
                      <SpecRow label="Wheelbase" value={formatValue(variant.dimensions?.wheelbaseMm, 'mm')} />
                      <SpecRow label="Ground Clearance" value={formatValue(variant.dimensions?.groundClearanceMm, 'mm')} />
                      <SpecRow label="Curb Weight" value={formatValue(variant.dimensions?.curbWeightKg, 'kg')} />
                      <SpecRow label="Trunk Capacity (Rear)" value={formatValue(variant.dimensions?.trunkCapacityRearL, 'L')} />
                      <SpecRow label="Turning Radius" value={formatValue(variant.dimensions?.turningRadiusM, 'm')} />
                    </SpecSection>

                    {/* 5. Suspension */}
                    <SpecSection title="🛞 Suspension">
                      <SpecRow label="Front Type" value={formatValue(variant.suspension?.frontType)} />
                      <SpecRow label="Rear Type" value={formatValue(variant.suspension?.rearType)} />
                      <SpecRow label="Adaptive Suspension" value={formatValue(variant.suspension?.adaptiveSuspension)} />
                    </SpecSection>

                    {/* 6. Brake System */}
                    <SpecSection title="🛑 Brake System">
                      <SpecRow label="Front Brake Type" value={formatValue(variant.brakes?.frontBrakeType)} />
                      <SpecRow label="Rear Brake Type" value={formatValue(variant.brakes?.rearBrakeType)} />
                      <SpecRow label="Caliper Color" value={formatValue(variant.brakes?.caliperColor)} />
                    </SpecSection>

                    {/* 7. Wheels & Tires */}
                    <SpecSection title="⚙️ Wheels & Tires">
                      <SpecRow label="Wheel Size" value={formatValue(variant.wheels?.wheelSizeInch, '"')} />
                      <SpecRow label="Wheel Material" value={formatValue(variant.wheels?.wheelMaterial)} />
                      <SpecRow label="Front Tire Size" value={formatValue(variant.wheels?.tireSizeFront)} />
                      <SpecRow label="Rear Tire Size" value={formatValue(variant.wheels?.tireSizeRear)} />
                      <SpecRow label="Spare Tire" value={formatValue(variant.wheels?.spareTire)} />
                    </SpecSection>

                    {/* 8. Safety */}
                    <SpecSection title="🛡️ Safety Systems">
                      <SpecRow label="Airbags (Front)" value={formatValue(variant.safety?.airbagsFront)} />
                      <SpecRow label="Airbags (Side)" value={formatValue(variant.safety?.airbagsSide)} />
                      <SpecRow label="Airbags (Curtain)" value={formatValue(variant.safety?.airbagsCurtain)} />
                      <SpecRow label="360° Camera" value={formatValue(variant.safety?.camera360)} />
                      <SpecRow label="ESC" value={formatValue(variant.safety?.esc)} />
                      <SpecRow label="Adaptive Cruise Control" value={formatValue(variant.safety?.adaptiveCruise)} />
                      <SpecRow label="Auto Emergency Brake" value={formatValue(variant.safety?.autoEmergencyBrake)} />
                      <SpecRow label="Lane Departure Warning" value={formatValue(variant.safety?.laneDepartureWarn)} />
                      <SpecRow label="Blind Spot Detection" value={formatValue(variant.safety?.blindSpotDetection)} />
                      <SpecRow label="TPMS" value={formatValue(variant.safety?.tpms)} />
                    </SpecSection>

                    {/* 9. Multimedia */}
                    <SpecSection title="📱 Multimedia & Convenience">
                      <SpecRow label="Display Size" value={formatValue(variant.multimedia?.displaySize, '"')} />
                      <SpecRow label="Display Type" value={formatValue(variant.multimedia?.displayType)} />
                      <SpecRow label="Apple CarPlay" value={formatValue(variant.multimedia?.appleCarPlay)} />
                      <SpecRow label="Android Auto" value={formatValue(variant.multimedia?.androidAuto)} />
                      <SpecRow label="Audio System" value={formatValue(variant.multimedia?.audioSystem)} />
                      <SpecRow label="Speaker Count" value={formatValue(variant.multimedia?.speakerCount)} />
                      <SpecRow label="Wireless Charging" value={formatValue(variant.multimedia?.wirelessCharging)} />
                      <SpecRow label="Climate Zones" value={formatValue(variant.multimedia?.climateZones)} />
                    </SpecSection>

                    {/* 10. Interior */}
                    <SpecSection title="🪑 Interior Equipment">
                      <SpecRow label="Seat Material" value={formatValue(variant.interior?.seatMaterial)} />
                      <SpecRow label="Driver Seat Power" value={formatValue(variant.interior?.driverSeatPower)} />
                      <SpecRow label="Driver Seat Adjustments" value={formatValue(variant.interior?.driverSeatAdjustments)} />
                      <SpecRow label="Driver Seat Ventilation" value={formatValue(variant.interior?.driverSeatVentilation)} />
                      <SpecRow label="HUD Display" value={formatValue(variant.interior?.hudDisplay)} />
                      <SpecRow label="Ambient Lighting" value={formatValue(variant.interior?.ambientLighting)} />
                      <SpecRow label="ISOFIX Points" value={formatValue(variant.interior?.isofixPoints)} />
                    </SpecSection>

                    {/* 11. Exterior */}
                    <SpecSection title="💡 Exterior Equipment">
                      <SpecRow label="Headlights Type" value={formatValue(variant.exterior?.headlightsType)} />
                      <SpecRow label="Headlights Auto" value={formatValue(variant.exterior?.headlightsAuto)} />
                      <SpecRow label="DRL Type" value={formatValue(variant.exterior?.drlType)} />
                      <SpecRow label="Taillights Type" value={formatValue(variant.exterior?.taillightsType)} />
                      <SpecRow label="Sunroof Type" value={formatValue(variant.exterior?.sunroofType)} />
                      <SpecRow label="Power Tailgate" value={formatValue(variant.exterior?.powerTailgate)} />
                      <SpecRow label="Retractable Door Handles" value={formatValue(variant.exterior?.doorHandlesRetractable)} />
                    </SpecSection>

                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

// Helper Components
function SpecSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-700/30 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
      <div className="grid md:grid-cols-2 gap-3">
        {children}
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-400">{label}:</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}
