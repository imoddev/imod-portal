'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FeatureCheckboxList } from '@/components/nev/FeatureCheckboxList';

interface Variant {
  id: string;
  name: string;
  fullName: string;
  slug: string;
  modelId: string;
  priceBaht: number | null;
  priceNote: string | null;
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
  imageUrl: string | null;
  model: {
    id: string;
    name: string;
    slug: string;
    brand: {
      name: string;
      slug: string;
    };
  };
  multimedia?: any;
  safety?: any;
  interior?: any;
  exterior?: any;
  powertrain?: any;
  battery?: any;
  evFeatures?: any;
  suspension?: any;
  brakes?: any;
  wheels?: any;
  dimensions?: any;
}

export default function EditVariantPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [variant, setVariant] = useState<Variant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    params.then(p => {
      fetch(`/api/nev/admin/variants/${p.slug}`)
        .then(r => r.json())
        .then(data => {
          if (data.error) {
            setVariant(null);
          } else {
            setVariant(data);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, [params]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variant) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/nev/admin/variants/${variant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Basic info
          name: variant.name,
          priceBaht: variant.priceBaht,
          priceNote: variant.priceNote,
          batteryKwh: variant.batteryKwh,
          rangeKm: variant.rangeKm,
          rangeStandard: variant.rangeStandard,
          motorKw: variant.motorKw,
          motorHp: variant.motorHp,
          torqueNm: variant.torqueNm,
          accel0100: variant.accel0100,
          topSpeedKmh: variant.topSpeedKmh,
          drivetrain: variant.drivetrain,
          dcChargeKw: variant.dcChargeKw,
          dcChargeMin: variant.dcChargeMin,
          imageUrl: variant.imageUrl,
          // 11 Categories
          powertrain: variant.powertrain,
          battery: variant.battery,
          evFeatures: variant.evFeatures,
          dimensions: variant.dimensions,
          suspension: variant.suspension,
          brakes: variant.brakes,
          wheels: variant.wheels,
          safety: variant.safety,
          multimedia: variant.multimedia,
          interior: variant.interior,
          exterior: variant.exterior,
        }),
      });

      if (res.ok) {
        alert('✅ บันทึกสำเร็จ!');
        router.push(`/nev/admin/models/${variant.model.slug}`);
      } else {
        const data = await res.json();
        alert(`❌ เกิดข้อผิดพลาด: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setSaving(false);
    }
  };

  const updateBasic = (field: keyof Variant, value: any) => {
    setVariant(v => v ? { ...v, [field]: value } : null);
  };

  const updateCategory = (category: string, field: string, value: any) => {
    setVariant(v => {
      if (!v) return null;
      const cat = (v as any)[category] || {};
      return {
        ...v,
        [category]: {
          ...cat,
          [field]: value,
        },
      };
    });
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

  if (!variant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-400 mb-4">❌ ไม่พบข้อมูล</p>
          <Link href="/nev/admin/models" className="text-emerald-400 hover:underline">
            ← กลับไปหน้ารายการ
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'basic', label: '📋 ข้อมูลพื้นฐาน', icon: '📋' },
    { id: 'features', label: '✅ ฟีเจอร์ (Checkbox)', icon: '✅' },
    { id: 'powertrain', label: '🚗 Powertrain', icon: '🚗' },
    { id: 'battery', label: '🔋 Battery', icon: '🔋' },
    { id: 'evFeatures', label: '⚡ EV Features', icon: '⚡' },
    { id: 'dimensions', label: '📏 Dimensions', icon: '📏' },
    { id: 'suspension', label: '🛞 Suspension', icon: '🛞' },
    { id: 'brakes', label: '🛑 Brakes', icon: '🛑' },
    { id: 'wheels', label: '⚙️ Wheels', icon: '⚙️' },
    { id: 'safety', label: '🛡️ Safety', icon: '🛡️' },
    { id: 'multimedia', label: '📱 Multimedia', icon: '📱' },
    { id: 'interior', label: '🪑 Interior', icon: '🪑' },
    { id: 'exterior', label: '💡 Exterior', icon: '💡' },
  ];

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
                {' › '}
                <Link 
                  href={`/nev/admin/models/${variant.model.slug}`}
                  className="hover:text-emerald-400"
                >
                  {variant.model.brand.name} {variant.model.name}
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-white">
                ✏️ แก้ไข: {variant.fullName}
              </h1>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/nev/admin/models/${variant.model.slug}`}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                ← ยกเลิก
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white rounded-lg transition-colors font-semibold"
              >
                {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึก'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-slate-800/30 border-b border-slate-700 sticky top-[88px] z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 pt-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {tab.icon} {tab.label.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSave} className="max-w-5xl mx-auto">
          
          {/* Features Checkbox */}
          {activeTab === 'features' && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <FeatureCheckboxList 
                variantSlug={variant.slug}
                onSave={() => alert('✅ บันทึกฟีเจอร์สำเร็จ!')}
              />
            </div>
          )}

          {/* Basic Info */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <FormSection title="📋 ข้อมูลพื้นฐาน">
                <InputField
                  label="ชื่อรุ่นย่อย"
                  value={variant.name}
                  onChange={(v) => updateBasic('name', v)}
                />
                <InputField
                  label="ราคา (บาท)"
                  type="number"
                  value={variant.priceBaht}
                  onChange={(v) => updateBasic('priceBaht', v ? parseInt(v) : null)}
                />
                <InputField
                  label="หมายเหตุราคา"
                  value={variant.priceNote}
                  onChange={(v) => updateBasic('priceNote', v)}
                />
                <InputField
                  label="แบตเตอรี่ (kWh)"
                  type="number"
                  value={variant.batteryKwh}
                  onChange={(v) => updateBasic('batteryKwh', v ? parseFloat(v) : null)}
                />
                <InputField
                  label="ระยะทาง (km)"
                  type="number"
                  value={variant.rangeKm}
                  onChange={(v) => updateBasic('rangeKm', v ? parseInt(v) : null)}
                />
                <InputField
                  label="มาตรฐานระยะทาง"
                  value={variant.rangeStandard}
                  onChange={(v) => updateBasic('rangeStandard', v)}
                  placeholder="NEDC, WLTP, EPA"
                />
                <InputField
                  label="กำลังไฟ (HP)"
                  type="number"
                  value={variant.motorHp}
                  onChange={(v) => updateBasic('motorHp', v ? parseInt(v) : null)}
                />
                <InputField
                  label="แรงบิด (Nm)"
                  type="number"
                  value={variant.torqueNm}
                  onChange={(v) => updateBasic('torqueNm', v ? parseInt(v) : null)}
                />
                <InputField
                  label="0-100 km/h (วินาที)"
                  type="number"
                  step="0.1"
                  value={variant.accel0100}
                  onChange={(v) => updateBasic('accel0100', v ? parseFloat(v) : null)}
                />
                <InputField
                  label="ความเร็วสูงสุด (km/h)"
                  type="number"
                  value={variant.topSpeedKmh}
                  onChange={(v) => updateBasic('topSpeedKmh', v ? parseInt(v) : null)}
                />
                <InputField
                  label="Drivetrain"
                  value={variant.drivetrain}
                  onChange={(v) => updateBasic('drivetrain', v)}
                  placeholder="FWD, RWD, AWD"
                />
                <InputField
                  label="DC Charging (kW)"
                  type="number"
                  value={variant.dcChargeKw}
                  onChange={(v) => updateBasic('dcChargeKw', v ? parseInt(v) : null)}
                />
                <InputField
                  label="DC Charging Time (min)"
                  type="number"
                  value={variant.dcChargeMin}
                  onChange={(v) => updateBasic('dcChargeMin', v ? parseInt(v) : null)}
                />
                <InputField
                  label="Image URL"
                  value={variant.imageUrl}
                  onChange={(v) => updateBasic('imageUrl', v)}
                  placeholder="https://example.com/image.jpg"
                />
              </FormSection>
            </div>
          )}

          {/* Powertrain */}
          {activeTab === 'powertrain' && (
            <FormSection title="🚗 Powertrain & Performance">
              <InputField
                label="Drivetrain"
                value={variant.powertrain?.drivetrain}
                onChange={(v) => updateCategory('powertrain', 'drivetrain', v)}
              />
              <InputField
                label="Front Motor Type"
                value={variant.powertrain?.frontMotorType}
                onChange={(v) => updateCategory('powertrain', 'frontMotorType', v)}
              />
              <InputField
                label="Front Motor Power (kW)"
                type="number"
                value={variant.powertrain?.frontMotorKw}
                onChange={(v) => updateCategory('powertrain', 'frontMotorKw', v ? parseFloat(v) : null)}
              />
              <InputField
                label="Rear Motor Type"
                value={variant.powertrain?.rearMotorType}
                onChange={(v) => updateCategory('powertrain', 'rearMotorType', v)}
              />
              <InputField
                label="Rear Motor Power (kW)"
                type="number"
                value={variant.powertrain?.rearMotorKw}
                onChange={(v) => updateCategory('powertrain', 'rearMotorKw', v ? parseFloat(v) : null)}
              />
              <InputField
                label="Total Power (kW)"
                type="number"
                value={variant.powertrain?.totalPowerKw}
                onChange={(v) => updateCategory('powertrain', 'totalPowerKw', v ? parseFloat(v) : null)}
              />
              <InputField
                label="Total Torque (Nm)"
                type="number"
                value={variant.powertrain?.totalTorqueNm}
                onChange={(v) => updateCategory('powertrain', 'totalTorqueNm', v ? parseFloat(v) : null)}
              />
              <InputField
                label="0-100 km/h (s)"
                type="number"
                step="0.1"
                value={variant.powertrain?.accel0100}
                onChange={(v) => updateCategory('powertrain', 'accel0100', v ? parseFloat(v) : null)}
              />
              <InputField
                label="Top Speed (km/h)"
                type="number"
                value={variant.powertrain?.topSpeedKmh}
                onChange={(v) => updateCategory('powertrain', 'topSpeedKmh', v ? parseInt(v) : null)}
              />
            </FormSection>
          )}

          {/* Battery */}
          {activeTab === 'battery' && (
            <FormSection title="🔋 Battery Details">
              <InputField
                label="Battery Type"
                value={variant.battery?.batteryType}
                onChange={(v) => updateCategory('battery', 'batteryType', v)}
              />
              <InputField
                label="Capacity (kWh)"
                type="number"
                value={variant.battery?.batteryKwh}
                onChange={(v) => updateCategory('battery', 'batteryKwh', v ? parseFloat(v) : null)}
              />
              <InputField
                label="Voltage (V)"
                type="number"
                value={variant.battery?.batteryVoltage}
                onChange={(v) => updateCategory('battery', 'batteryVoltage', v ? parseInt(v) : null)}
              />
              <InputField
                label="Chemistry"
                value={variant.battery?.batteryChemistry}
                onChange={(v) => updateCategory('battery', 'batteryChemistry', v)}
                placeholder="LFP, NCM, NCA"
              />
            </FormSection>
          )}

          {/* EV Features */}
          {activeTab === 'evFeatures' && (
            <FormSection title="⚡ EV Features & Charging">
              <InputField
                label="Range NEDC (km)"
                type="number"
                value={variant.evFeatures?.rangeNEDC}
                onChange={(v) => updateCategory('evFeatures', 'rangeNEDC', v ? parseInt(v) : null)}
              />
              <InputField
                label="Range WLTP (km)"
                type="number"
                value={variant.evFeatures?.rangeWLTP}
                onChange={(v) => updateCategory('evFeatures', 'rangeWLTP', v ? parseInt(v) : null)}
              />
              <InputField
                label="AC Charge Max (kW)"
                type="number"
                value={variant.evFeatures?.acChargeMaxKw}
                onChange={(v) => updateCategory('evFeatures', 'acChargeMaxKw', v ? parseFloat(v) : null)}
              />
              <InputField
                label="DC Charge Max (kW)"
                type="number"
                value={variant.evFeatures?.dcChargeMaxKw}
                onChange={(v) => updateCategory('evFeatures', 'dcChargeMaxKw', v ? parseFloat(v) : null)}
              />
              <InputField
                label="DC 10-80% (min)"
                type="number"
                value={variant.evFeatures?.dcCharge10to80Min}
                onChange={(v) => updateCategory('evFeatures', 'dcCharge10to80Min', v ? parseInt(v) : null)}
              />
              <CheckboxField
                label="V2L Support"
                checked={variant.evFeatures?.v2l || false}
                onChange={(v) => updateCategory('evFeatures', 'v2l', v)}
              />
              <CheckboxField
                label="Regenerative Brake"
                checked={variant.evFeatures?.regenerativeBrake || false}
                onChange={(v) => updateCategory('evFeatures', 'regenerativeBrake', v)}
              />
            </FormSection>
          )}

          {/* Dimensions */}
          {activeTab === 'dimensions' && (
            <FormSection title="📏 Dimensions & Weight">
              <InputField
                label="Seating Capacity"
                type="number"
                value={variant.dimensions?.seatingCapacity}
                onChange={(v) => updateCategory('dimensions', 'seatingCapacity', v ? parseInt(v) : null)}
              />
              <InputField
                label="Length (mm)"
                type="number"
                value={variant.dimensions?.lengthMm}
                onChange={(v) => updateCategory('dimensions', 'lengthMm', v ? parseInt(v) : null)}
              />
              <InputField
                label="Width (mm)"
                type="number"
                value={variant.dimensions?.widthMm}
                onChange={(v) => updateCategory('dimensions', 'widthMm', v ? parseInt(v) : null)}
              />
              <InputField
                label="Height (mm)"
                type="number"
                value={variant.dimensions?.heightMm}
                onChange={(v) => updateCategory('dimensions', 'heightMm', v ? parseInt(v) : null)}
              />
              <InputField
                label="Wheelbase (mm)"
                type="number"
                value={variant.dimensions?.wheelbaseMm}
                onChange={(v) => updateCategory('dimensions', 'wheelbaseMm', v ? parseInt(v) : null)}
              />
              <InputField
                label="Ground Clearance (mm)"
                type="number"
                value={variant.dimensions?.groundClearanceMm}
                onChange={(v) => updateCategory('dimensions', 'groundClearanceMm', v ? parseInt(v) : null)}
              />
              <InputField
                label="Curb Weight (kg)"
                type="number"
                value={variant.dimensions?.curbWeightKg}
                onChange={(v) => updateCategory('dimensions', 'curbWeightKg', v ? parseInt(v) : null)}
              />
              <InputField
                label="Trunk Capacity Rear (L)"
                type="number"
                value={variant.dimensions?.trunkCapacityRearL}
                onChange={(v) => updateCategory('dimensions', 'trunkCapacityRearL', v ? parseInt(v) : null)}
              />
            </FormSection>
          )}

          {/* Suspension */}
          {activeTab === 'suspension' && (
            <FormSection title="🛞 Suspension System">
              <InputField
                label="Front Type"
                value={variant.suspension?.frontType}
                onChange={(v) => updateCategory('suspension', 'frontType', v)}
              />
              <InputField
                label="Rear Type"
                value={variant.suspension?.rearType}
                onChange={(v) => updateCategory('suspension', 'rearType', v)}
              />
              <InputField
                label="Adaptive Suspension"
                value={variant.suspension?.adaptiveSuspension}
                onChange={(v) => updateCategory('suspension', 'adaptiveSuspension', v)}
              />
            </FormSection>
          )}

          {/* Brakes */}
          {activeTab === 'brakes' && (
            <FormSection title="🛑 Brake System">
              <InputField
                label="Front Brake Type"
                value={variant.brakes?.frontBrakeType}
                onChange={(v) => updateCategory('brakes', 'frontBrakeType', v)}
              />
              <InputField
                label="Rear Brake Type"
                value={variant.brakes?.rearBrakeType}
                onChange={(v) => updateCategory('brakes', 'rearBrakeType', v)}
              />
              <InputField
                label="Caliper Color"
                value={variant.brakes?.caliperColor}
                onChange={(v) => updateCategory('brakes', 'caliperColor', v)}
              />
            </FormSection>
          )}

          {/* Wheels */}
          {activeTab === 'wheels' && (
            <FormSection title="⚙️ Wheels & Tires">
              <InputField
                label="Wheel Size (inch)"
                type="number"
                value={variant.wheels?.wheelSizeInch}
                onChange={(v) => updateCategory('wheels', 'wheelSizeInch', v ? parseInt(v) : null)}
              />
              <InputField
                label="Wheel Material"
                value={variant.wheels?.wheelMaterial}
                onChange={(v) => updateCategory('wheels', 'wheelMaterial', v)}
              />
              <InputField
                label="Front Tire Size"
                value={variant.wheels?.tireSizeFront}
                onChange={(v) => updateCategory('wheels', 'tireSizeFront', v)}
              />
              <InputField
                label="Rear Tire Size"
                value={variant.wheels?.tireSizeRear}
                onChange={(v) => updateCategory('wheels', 'tireSizeRear', v)}
              />
              <CheckboxField
                label="Spare Tire"
                checked={variant.wheels?.spareTire || false}
                onChange={(v) => updateCategory('wheels', 'spareTire', v)}
              />
            </FormSection>
          )}

          {/* Safety */}
          {activeTab === 'safety' && (
            <FormSection title="🛡️ Safety Systems">
              <InputField
                label="Airbags Front"
                type="number"
                value={variant.safety?.airbagsFront}
                onChange={(v) => updateCategory('safety', 'airbagsFront', v ? parseInt(v) : null)}
              />
              <InputField
                label="Airbags Side"
                type="number"
                value={variant.safety?.airbagsSide}
                onChange={(v) => updateCategory('safety', 'airbagsSide', v ? parseInt(v) : null)}
              />
              <CheckboxField
                label="Airbags Curtain"
                checked={variant.safety?.airbagsCurtain || false}
                onChange={(v) => updateCategory('safety', 'airbagsCurtain', v)}
              />
              <CheckboxField
                label="360° Camera"
                checked={variant.safety?.camera360 || false}
                onChange={(v) => updateCategory('safety', 'camera360', v)}
              />
              <CheckboxField
                label="ESC"
                checked={variant.safety?.esc || false}
                onChange={(v) => updateCategory('safety', 'esc', v)}
              />
              <CheckboxField
                label="Adaptive Cruise Control"
                checked={variant.safety?.adaptiveCruise || false}
                onChange={(v) => updateCategory('safety', 'adaptiveCruise', v)}
              />
              <CheckboxField
                label="Auto Emergency Brake"
                checked={variant.safety?.autoEmergencyBrake || false}
                onChange={(v) => updateCategory('safety', 'autoEmergencyBrake', v)}
              />
              <CheckboxField
                label="Lane Departure Warning"
                checked={variant.safety?.laneDepartureWarn || false}
                onChange={(v) => updateCategory('safety', 'laneDepartureWarn', v)}
              />
              <CheckboxField
                label="Blind Spot Detection"
                checked={variant.safety?.blindSpotDetection || false}
                onChange={(v) => updateCategory('safety', 'blindSpotDetection', v)}
              />
              <CheckboxField
                label="TPMS"
                checked={variant.safety?.tpms || false}
                onChange={(v) => updateCategory('safety', 'tpms', v)}
              />
            </FormSection>
          )}

          {/* Multimedia */}
          {activeTab === 'multimedia' && (
            <FormSection title="📱 Multimedia & Convenience">
              <InputField
                label="Display Size (inch)"
                type="number"
                value={variant.multimedia?.displaySize}
                onChange={(v) => updateCategory('multimedia', 'displaySize', v ? parseFloat(v) : null)}
              />
              <InputField
                label="Display Type"
                value={variant.multimedia?.displayType}
                onChange={(v) => updateCategory('multimedia', 'displayType', v)}
              />
              <CheckboxField
                label="Apple CarPlay"
                checked={variant.multimedia?.appleCarPlay || false}
                onChange={(v) => updateCategory('multimedia', 'appleCarPlay', v)}
              />
              <CheckboxField
                label="Android Auto"
                checked={variant.multimedia?.androidAuto || false}
                onChange={(v) => updateCategory('multimedia', 'androidAuto', v)}
              />
              <InputField
                label="Audio System"
                value={variant.multimedia?.audioSystem}
                onChange={(v) => updateCategory('multimedia', 'audioSystem', v)}
              />
              <InputField
                label="Speaker Count"
                type="number"
                value={variant.multimedia?.speakerCount}
                onChange={(v) => updateCategory('multimedia', 'speakerCount', v ? parseInt(v) : null)}
              />
              <CheckboxField
                label="Wireless Charging"
                checked={variant.multimedia?.wirelessCharging || false}
                onChange={(v) => updateCategory('multimedia', 'wirelessCharging', v)}
              />
              <InputField
                label="Climate Zones"
                type="number"
                value={variant.multimedia?.climateZones}
                onChange={(v) => updateCategory('multimedia', 'climateZones', v ? parseInt(v) : null)}
              />
            </FormSection>
          )}

          {/* Interior */}
          {activeTab === 'interior' && (
            <FormSection title="🪑 Interior Equipment">
              <InputField
                label="Seat Material"
                value={variant.interior?.seatMaterial}
                onChange={(v) => updateCategory('interior', 'seatMaterial', v)}
              />
              <CheckboxField
                label="Driver Seat Power"
                checked={variant.interior?.driverSeatPower || false}
                onChange={(v) => updateCategory('interior', 'driverSeatPower', v)}
              />
              <InputField
                label="Driver Seat Adjustments"
                type="number"
                value={variant.interior?.driverSeatAdjustments}
                onChange={(v) => updateCategory('interior', 'driverSeatAdjustments', v ? parseInt(v) : null)}
              />
              <CheckboxField
                label="Driver Seat Ventilation"
                checked={variant.interior?.driverSeatVentilation || false}
                onChange={(v) => updateCategory('interior', 'driverSeatVentilation', v)}
              />
              <CheckboxField
                label="HUD Display"
                checked={variant.interior?.hudDisplay || false}
                onChange={(v) => updateCategory('interior', 'hudDisplay', v)}
              />
              <CheckboxField
                label="Ambient Lighting"
                checked={variant.interior?.ambientLighting || false}
                onChange={(v) => updateCategory('interior', 'ambientLighting', v)}
              />
              <InputField
                label="ISOFIX Points"
                type="number"
                value={variant.interior?.isofixPoints}
                onChange={(v) => updateCategory('interior', 'isofixPoints', v ? parseInt(v) : null)}
              />
            </FormSection>
          )}

          {/* Exterior */}
          {activeTab === 'exterior' && (
            <FormSection title="💡 Exterior Equipment">
              <InputField
                label="Headlights Type"
                value={variant.exterior?.headlightsType}
                onChange={(v) => updateCategory('exterior', 'headlightsType', v)}
              />
              <CheckboxField
                label="Headlights Auto"
                checked={variant.exterior?.headlightsAuto || false}
                onChange={(v) => updateCategory('exterior', 'headlightsAuto', v)}
              />
              <InputField
                label="DRL Type"
                value={variant.exterior?.drlType}
                onChange={(v) => updateCategory('exterior', 'drlType', v)}
              />
              <InputField
                label="Taillights Type"
                value={variant.exterior?.taillightsType}
                onChange={(v) => updateCategory('exterior', 'taillightsType', v)}
              />
              <InputField
                label="Sunroof Type"
                value={variant.exterior?.sunroofType}
                onChange={(v) => updateCategory('exterior', 'sunroofType', v)}
              />
              <CheckboxField
                label="Power Tailgate"
                checked={variant.exterior?.powerTailgate || false}
                onChange={(v) => updateCategory('exterior', 'powerTailgate', v)}
              />
              <CheckboxField
                label="Retractable Door Handles"
                checked={variant.exterior?.doorHandlesRetractable || false}
                onChange={(v) => updateCategory('exterior', 'doorHandlesRetractable', v)}
              />
            </FormSection>
          )}

          {/* Save Button (bottom) */}
          <div className="mt-8 flex justify-end gap-3">
            <Link
              href={`/nev/admin/models/${variant.model.slug}`}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              ← ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white rounded-lg transition-colors font-semibold text-lg"
            >
              {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึกการเปลี่ยนแปลง'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

// Helper Components
function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
      <h2 className="text-xl font-bold text-white mb-6">{title}</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  step,
  placeholder,
}: {
  label: string;
  value: any;
  onChange: (value: string) => void;
  type?: string;
  step?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1">{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        step={step}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:border-emerald-500 focus:outline-none text-white"
      />
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 col-span-2 md:col-span-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 bg-slate-900 border-slate-700 rounded focus:ring-emerald-500 focus:ring-offset-slate-800"
      />
      <label className="text-sm text-slate-300">{label}</label>
    </div>
  );
}
