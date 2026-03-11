// NEV Database Mock Data
// สำหรับ Frontend Development ก่อน Backend พร้อม

export interface Brand {
  id: string;
  name: string;
  nameTh: string;
  slug: string;
  logoUrl: string | null;
  country: string;
}

export interface Model {
  id: string;
  brandId: string;
  name: string;
  nameTh: string | null;
  slug: string;
  year: number;
  bodyType: string;
  segment: string;
  seats: number;
  powertrain: 'BEV' | 'PHEV' | 'HEV' | 'REEV' | 'ICE';
  imageUrl: string | null;
  overview: string;
}

export interface Variant {
  id: string;
  modelId: string;
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
  topSpeedKmh: number | null;
  accel0100: number | null;
  drivetrain: string | null;
  dcChargeKw: number | null;
  dcChargeMin: number | null;
  acChargeKw: number | null;
  chargePort: string | null;
  lengthMm: number | null;
  widthMm: number | null;
  heightMm: number | null;
  wheelbaseMm: number | null;
  curbWeightKg: number | null;
  trunkLitres: number | null;
  warrantyVehicle: string | null;
  warrantyBattery: string | null;
  hasV2l: boolean;
  v2lKw: number | null;
  features: Record<string, string[]> | null;
}

// Mock Brands
export const mockBrands: Brand[] = [
  { id: '1', name: 'BYD', nameTh: 'บีวายดี', slug: 'byd', logoUrl: null, country: 'China' },
  { id: '2', name: 'Tesla', nameTh: 'เทสลา', slug: 'tesla', logoUrl: null, country: 'USA' },
  { id: '3', name: 'MG', nameTh: 'เอ็มจี', slug: 'mg', logoUrl: null, country: 'UK/China' },
  { id: '4', name: 'Deepal', nameTh: 'ดีพอล', slug: 'deepal', logoUrl: null, country: 'China' },
  { id: '5', name: 'NIO', nameTh: 'นีโอ', slug: 'nio', logoUrl: null, country: 'China' },
  { id: '6', name: 'Zeekr', nameTh: 'ซีคร์', slug: 'zeekr', logoUrl: null, country: 'China' },
  { id: '7', name: 'GWM', nameTh: 'จีดับเบิลยูเอ็ม', slug: 'gwm', logoUrl: null, country: 'China' },
  { id: '8', name: 'Toyota', nameTh: 'โตโยต้า', slug: 'toyota', logoUrl: null, country: 'Japan' },
];

// Mock Models
export const mockModels: Model[] = [
  {
    id: 'm1',
    brandId: '1',
    name: 'Dolphin',
    nameTh: 'ดอลฟิน',
    slug: 'byd-dolphin',
    year: 2026,
    bodyType: 'Hatchback',
    segment: 'B',
    seats: 5,
    powertrain: 'BEV',
    imageUrl: null,
    overview: 'รถยนต์ไฟฟ้า 100% แฮทช์แบ็ก B-Segment ขับเคลื่อนล้อหน้า ประกอบในไทย (CKD)',
  },
  {
    id: 'm2',
    brandId: '1',
    name: 'Seal',
    nameTh: 'ซีล',
    slug: 'byd-seal',
    year: 2026,
    bodyType: 'Sedan',
    segment: 'D',
    seats: 5,
    powertrain: 'BEV',
    imageUrl: null,
    overview: 'สปอร์ตซีดาน BEV D-Segment ขับเคลื่อนล้อหลัง เทคโนโลยี e-Platform 3.0 + CTB',
  },
  {
    id: 'm3',
    brandId: '1',
    name: 'Atto 3',
    nameTh: 'แอตโต้ 3',
    slug: 'byd-atto-3',
    year: 2026,
    bodyType: 'SUV',
    segment: 'C',
    seats: 5,
    powertrain: 'BEV',
    imageUrl: null,
    overview: 'รถยนต์ไฟฟ้า 100% SUV C-Segment ขับเคลื่อนล้อหน้า ประกอบในไทย (CKD)',
  },
  {
    id: 'm4',
    brandId: '2',
    name: 'Model 3',
    nameTh: 'โมเดล 3',
    slug: 'tesla-model-3',
    year: 2026,
    bodyType: 'Sedan',
    segment: 'D',
    seats: 5,
    powertrain: 'BEV',
    imageUrl: null,
    overview: 'รถยนต์ไฟฟ้าซีดาน D-Segment จาก Tesla',
  },
  {
    id: 'm5',
    brandId: '2',
    name: 'Model Y',
    nameTh: 'โมเดล วาย',
    slug: 'tesla-model-y',
    year: 2026,
    bodyType: 'SUV',
    segment: 'D',
    seats: 5,
    powertrain: 'BEV',
    imageUrl: null,
    overview: 'รถยนต์ไฟฟ้า SUV D-Segment จาก Tesla',
  },
  {
    id: 'm6',
    brandId: '3',
    name: 'MG4',
    nameTh: 'เอ็มจี 4',
    slug: 'mg4',
    year: 2026,
    bodyType: 'Hatchback',
    segment: 'C',
    seats: 5,
    powertrain: 'BEV',
    imageUrl: null,
    overview: 'รถยนต์ไฟฟ้า 100% แฮทช์แบ็ก C-Segment',
  },
  {
    id: 'm7',
    brandId: '4',
    name: 'S05',
    nameTh: 'เอส 05',
    slug: 'deepal-s05',
    year: 2026,
    bodyType: 'SUV',
    segment: 'C',
    seats: 5,
    powertrain: 'BEV',
    imageUrl: null,
    overview: 'รถยนต์ไฟฟ้า SUV C-Segment จาก Deepal',
  },
  {
    id: 'm8',
    brandId: '4',
    name: 'S07',
    nameTh: 'เอส 07',
    slug: 'deepal-s07',
    year: 2026,
    bodyType: 'SUV',
    segment: 'D',
    seats: 5,
    powertrain: 'BEV',
    imageUrl: null,
    overview: 'รถยนต์ไฟฟ้า SUV D-Segment จาก Deepal',
  },
];

// Mock Variants
export const mockVariants: Variant[] = [
  // BYD Dolphin variants
  {
    id: 'v1',
    modelId: 'm1',
    name: 'Dynamic',
    fullName: 'BYD Dolphin Dynamic',
    slug: 'byd-dolphin-dynamic',
    priceBaht: 799000,
    batteryKwh: 44.9,
    rangeKm: 410,
    rangeStandard: 'NEDC',
    motorKw: 70,
    motorHp: 95,
    torqueNm: 180,
    topSpeedKmh: 150,
    accel0100: 10.9,
    drivetrain: 'FWD',
    dcChargeKw: 60,
    dcChargeMin: 30,
    acChargeKw: 7,
    chargePort: 'CCS2',
    lengthMm: 4290,
    widthMm: 1770,
    heightMm: 1570,
    wheelbaseMm: 2700,
    curbWeightKg: 1560,
    trunkLitres: 345,
    warrantyVehicle: '6 ปี / 150,000 กม.',
    warrantyBattery: '8 ปี / 160,000 กม.',
    hasV2l: false,
    v2lKw: null,
    features: {
      adas: ['ACC', 'AEB', 'LDW', 'BSD'],
      comfort: ['Sunroof', 'Wireless Charging', 'Ventilated Seats'],
      safety: ['6 Airbags', 'ABS', 'EBD', 'ESC'],
    },
  },
  {
    id: 'v2',
    modelId: 'm1',
    name: 'Extended Range',
    fullName: 'BYD Dolphin Extended Range',
    slug: 'byd-dolphin-extended-range',
    priceBaht: 859000,
    batteryKwh: 60.4,
    rangeKm: 490,
    rangeStandard: 'NEDC',
    motorKw: 150,
    motorHp: 204,
    torqueNm: 310,
    topSpeedKmh: 160,
    accel0100: 7.0,
    drivetrain: 'FWD',
    dcChargeKw: 80,
    dcChargeMin: 26,
    acChargeKw: 11,
    chargePort: 'CCS2',
    lengthMm: 4290,
    widthMm: 1770,
    heightMm: 1570,
    wheelbaseMm: 2700,
    curbWeightKg: 1680,
    trunkLitres: 345,
    warrantyVehicle: '6 ปี / 150,000 กม.',
    warrantyBattery: '8 ปี / 160,000 กม.',
    hasV2l: true,
    v2lKw: 3.3,
    features: {
      adas: ['ACC', 'AEB', 'LDW', 'BSD', 'LCA', 'RCTA'],
      comfort: ['Panoramic Sunroof', 'Wireless Charging', 'Ventilated Seats', 'Heated Seats'],
      safety: ['6 Airbags', 'ABS', 'EBD', 'ESC', 'HBA'],
    },
  },
  // BYD Seal variants
  {
    id: 'v3',
    modelId: 'm2',
    name: 'Dynamic RWD',
    fullName: 'BYD Seal Dynamic RWD',
    slug: 'byd-seal-dynamic-rwd',
    priceBaht: 1329999,
    batteryKwh: 61.4,
    rangeKm: 510,
    rangeStandard: 'CLTC',
    motorKw: 170,
    motorHp: 231,
    torqueNm: 330,
    topSpeedKmh: 180,
    accel0100: 7.5,
    drivetrain: 'RWD',
    dcChargeKw: 110,
    dcChargeMin: 26,
    acChargeKw: 11,
    chargePort: 'CCS2',
    lengthMm: 4800,
    widthMm: 1875,
    heightMm: 1460,
    wheelbaseMm: 2920,
    curbWeightKg: 1920,
    trunkLitres: 400,
    warrantyVehicle: '6 ปี / 150,000 กม.',
    warrantyBattery: '8 ปี / 160,000 กม.',
    hasV2l: true,
    v2lKw: 3.3,
    features: {
      adas: ['ACC', 'AEB', 'LDW', 'BSD', 'LCA', 'RCTA', 'TJA'],
      comfort: ['Panoramic Glass Roof', '12.8" Rotating Display', 'DYNAUDIO Sound'],
      safety: ['7 Airbags', 'ABS', 'EBD', 'ESC', 'HBA'],
    },
  },
  {
    id: 'v4',
    modelId: 'm2',
    name: 'Premium RWD',
    fullName: 'BYD Seal Premium RWD',
    slug: 'byd-seal-premium-rwd',
    priceBaht: 1529999,
    batteryKwh: 82.5,
    rangeKm: 650,
    rangeStandard: 'CLTC',
    motorKw: 230,
    motorHp: 313,
    torqueNm: 360,
    topSpeedKmh: 200,
    accel0100: 5.9,
    drivetrain: 'RWD',
    dcChargeKw: 150,
    dcChargeMin: 26,
    acChargeKw: 11,
    chargePort: 'CCS2',
    lengthMm: 4800,
    widthMm: 1875,
    heightMm: 1460,
    wheelbaseMm: 2920,
    curbWeightKg: 2010,
    trunkLitres: 400,
    warrantyVehicle: '6 ปี / 150,000 กม.',
    warrantyBattery: '8 ปี / 160,000 กม.',
    hasV2l: true,
    v2lKw: 3.3,
    features: {
      adas: ['ACC', 'AEB', 'LDW', 'BSD', 'LCA', 'RCTA', 'TJA', 'APA'],
      comfort: ['Panoramic Glass Roof', '15.6" Rotating Display', 'DYNAUDIO 12-Speaker'],
      safety: ['7 Airbags', 'ABS', 'EBD', 'ESC', 'HBA'],
    },
  },
  {
    id: 'v5',
    modelId: 'm2',
    name: 'Performance AWD',
    fullName: 'BYD Seal Performance AWD',
    slug: 'byd-seal-performance-awd',
    priceBaht: 1729999,
    batteryKwh: 82.5,
    rangeKm: 580,
    rangeStandard: 'CLTC',
    motorKw: 390,
    motorHp: 530,
    torqueNm: 670,
    topSpeedKmh: 220,
    accel0100: 3.8,
    drivetrain: 'AWD',
    dcChargeKw: 150,
    dcChargeMin: 26,
    acChargeKw: 11,
    chargePort: 'CCS2',
    lengthMm: 4800,
    widthMm: 1875,
    heightMm: 1460,
    wheelbaseMm: 2920,
    curbWeightKg: 2140,
    trunkLitres: 400,
    warrantyVehicle: '6 ปี / 150,000 กม.',
    warrantyBattery: '8 ปี / 160,000 กม.',
    hasV2l: true,
    v2lKw: 3.3,
    features: {
      adas: ['ACC', 'AEB', 'LDW', 'BSD', 'LCA', 'RCTA', 'TJA', 'APA', 'NOP'],
      comfort: ['Panoramic Glass Roof', '15.6" Rotating Display', 'DYNAUDIO 12-Speaker', 'Sport Seats'],
      safety: ['7 Airbags', 'ABS', 'EBD', 'ESC', 'HBA'],
    },
  },
  // Tesla Model 3 variants
  {
    id: 'v6',
    modelId: 'm4',
    name: 'Standard Range RWD',
    fullName: 'Tesla Model 3 Standard Range RWD',
    slug: 'tesla-model-3-standard-range',
    priceBaht: 1599000,
    batteryKwh: 60,
    rangeKm: 513,
    rangeStandard: 'WLTP',
    motorKw: 200,
    motorHp: 271,
    torqueNm: 350,
    topSpeedKmh: 225,
    accel0100: 6.1,
    drivetrain: 'RWD',
    dcChargeKw: 170,
    dcChargeMin: 15,
    acChargeKw: 11,
    chargePort: 'Tesla',
    lengthMm: 4720,
    widthMm: 1848,
    heightMm: 1442,
    wheelbaseMm: 2875,
    curbWeightKg: 1765,
    trunkLitres: 425,
    warrantyVehicle: '4 ปี / 80,000 กม.',
    warrantyBattery: '8 ปี / 192,000 กม.',
    hasV2l: false,
    v2lKw: null,
    features: {
      adas: ['Autopilot', 'AEB', 'LDW', 'BSD'],
      comfort: ['15" Touchscreen', 'Premium Audio', 'Glass Roof'],
      safety: ['8 Airbags', 'ABS', 'EBD', 'ESC'],
    },
  },
  {
    id: 'v7',
    modelId: 'm4',
    name: 'Long Range AWD',
    fullName: 'Tesla Model 3 Long Range AWD',
    slug: 'tesla-model-3-long-range',
    priceBaht: 1899000,
    batteryKwh: 75,
    rangeKm: 629,
    rangeStandard: 'WLTP',
    motorKw: 366,
    motorHp: 498,
    torqueNm: 440,
    topSpeedKmh: 233,
    accel0100: 4.4,
    drivetrain: 'AWD',
    dcChargeKw: 250,
    dcChargeMin: 15,
    acChargeKw: 11,
    chargePort: 'Tesla',
    lengthMm: 4720,
    widthMm: 1848,
    heightMm: 1442,
    wheelbaseMm: 2875,
    curbWeightKg: 1844,
    trunkLitres: 425,
    warrantyVehicle: '4 ปี / 80,000 กม.',
    warrantyBattery: '8 ปี / 192,000 กม.',
    hasV2l: false,
    v2lKw: null,
    features: {
      adas: ['Autopilot', 'AEB', 'LDW', 'BSD', 'Navigate on Autopilot'],
      comfort: ['15" Touchscreen', 'Premium Audio 14-Speaker', 'Glass Roof', 'Heated Seats All'],
      safety: ['8 Airbags', 'ABS', 'EBD', 'ESC'],
    },
  },
  // Tesla Model Y variants
  {
    id: 'v8',
    modelId: 'm5',
    name: 'Standard Range RWD',
    fullName: 'Tesla Model Y Standard Range RWD',
    slug: 'tesla-model-y-standard-range',
    priceBaht: 1799000,
    batteryKwh: 60,
    rangeKm: 455,
    rangeStandard: 'WLTP',
    motorKw: 200,
    motorHp: 271,
    torqueNm: 350,
    topSpeedKmh: 217,
    accel0100: 6.9,
    drivetrain: 'RWD',
    dcChargeKw: 170,
    dcChargeMin: 15,
    acChargeKw: 11,
    chargePort: 'Tesla',
    lengthMm: 4750,
    widthMm: 1921,
    heightMm: 1624,
    wheelbaseMm: 2890,
    curbWeightKg: 1908,
    trunkLitres: 854,
    warrantyVehicle: '4 ปี / 80,000 กม.',
    warrantyBattery: '8 ปี / 192,000 กม.',
    hasV2l: false,
    v2lKw: null,
    features: {
      adas: ['Autopilot', 'AEB', 'LDW', 'BSD'],
      comfort: ['15" Touchscreen', 'Premium Audio', 'Glass Roof'],
      safety: ['8 Airbags', 'ABS', 'EBD', 'ESC'],
    },
  },
  // MG4 variants
  {
    id: 'v9',
    modelId: 'm6',
    name: 'Standard',
    fullName: 'MG4 Standard',
    slug: 'mg4-standard',
    priceBaht: 1049000,
    batteryKwh: 51,
    rangeKm: 350,
    rangeStandard: 'WLTP',
    motorKw: 125,
    motorHp: 170,
    torqueNm: 250,
    topSpeedKmh: 160,
    accel0100: 7.9,
    drivetrain: 'RWD',
    dcChargeKw: 50,
    dcChargeMin: 35,
    acChargeKw: 7,
    chargePort: 'CCS2',
    lengthMm: 4287,
    widthMm: 1836,
    heightMm: 1516,
    wheelbaseMm: 2705,
    curbWeightKg: 1645,
    trunkLitres: 363,
    warrantyVehicle: '5 ปี / 100,000 กม.',
    warrantyBattery: '8 ปี / 180,000 กม.',
    hasV2l: true,
    v2lKw: 2.2,
    features: {
      adas: ['ACC', 'AEB', 'LDW'],
      comfort: ['10.25" Display', 'Wireless Charging'],
      safety: ['6 Airbags', 'ABS', 'EBD', 'ESC'],
    },
  },
  {
    id: 'v10',
    modelId: 'm6',
    name: 'Long Range',
    fullName: 'MG4 Long Range',
    slug: 'mg4-long-range',
    priceBaht: 1249000,
    batteryKwh: 64,
    rangeKm: 450,
    rangeStandard: 'WLTP',
    motorKw: 150,
    motorHp: 204,
    torqueNm: 350,
    topSpeedKmh: 160,
    accel0100: 7.2,
    drivetrain: 'RWD',
    dcChargeKw: 87,
    dcChargeMin: 26,
    acChargeKw: 11,
    chargePort: 'CCS2',
    lengthMm: 4287,
    widthMm: 1836,
    heightMm: 1516,
    wheelbaseMm: 2705,
    curbWeightKg: 1730,
    trunkLitres: 363,
    warrantyVehicle: '5 ปี / 100,000 กม.',
    warrantyBattery: '8 ปี / 180,000 กม.',
    hasV2l: true,
    v2lKw: 2.2,
    features: {
      adas: ['ACC', 'AEB', 'LDW', 'BSD', 'RCTA'],
      comfort: ['10.25" Display', 'Wireless Charging', 'Heated Seats'],
      safety: ['6 Airbags', 'ABS', 'EBD', 'ESC'],
    },
  },
  {
    id: 'v11',
    modelId: 'm6',
    name: 'XPOWER',
    fullName: 'MG4 XPOWER',
    slug: 'mg4-xpower',
    priceBaht: 1449000,
    batteryKwh: 64,
    rangeKm: 400,
    rangeStandard: 'WLTP',
    motorKw: 320,
    motorHp: 435,
    torqueNm: 600,
    topSpeedKmh: 200,
    accel0100: 3.8,
    drivetrain: 'AWD',
    dcChargeKw: 87,
    dcChargeMin: 26,
    acChargeKw: 11,
    chargePort: 'CCS2',
    lengthMm: 4287,
    widthMm: 1836,
    heightMm: 1516,
    wheelbaseMm: 2705,
    curbWeightKg: 1800,
    trunkLitres: 363,
    warrantyVehicle: '5 ปี / 100,000 กม.',
    warrantyBattery: '8 ปี / 180,000 กม.',
    hasV2l: true,
    v2lKw: 2.2,
    features: {
      adas: ['ACC', 'AEB', 'LDW', 'BSD', 'RCTA'],
      comfort: ['10.25" Display', 'Wireless Charging', 'Heated Seats', 'Sport Seats'],
      safety: ['6 Airbags', 'ABS', 'EBD', 'ESC'],
    },
  },
];

// Helper functions
export function getBrandById(id: string): Brand | undefined {
  return mockBrands.find(b => b.id === id);
}

export function getBrandBySlug(slug: string): Brand | undefined {
  return mockBrands.find(b => b.slug === slug);
}

export function getModelsByBrand(brandId: string): Model[] {
  return mockModels.filter(m => m.brandId === brandId);
}

export function getModelById(id: string): Model | undefined {
  return mockModels.find(m => m.id === id);
}

export function getModelBySlug(slug: string): Model | undefined {
  return mockModels.find(m => m.slug === slug);
}

export function getVariantsByModel(modelId: string): Variant[] {
  return mockVariants.filter(v => v.modelId === modelId);
}

export function getVariantBySlug(slug: string): Variant | undefined {
  return mockVariants.find(v => v.slug === slug);
}

export function getStats() {
  return {
    totalBrands: mockBrands.length,
    totalModels: mockModels.length,
    totalVariants: mockVariants.length,
    bevCount: mockVariants.filter(v => {
      const model = getModelById(v.modelId);
      return model?.powertrain === 'BEV';
    }).length,
  };
}

export function searchModels(query: string): Model[] {
  const q = query.toLowerCase();
  return mockModels.filter(m => {
    const brand = getBrandById(m.brandId);
    return (
      m.name.toLowerCase().includes(q) ||
      m.nameTh?.includes(q) ||
      brand?.name.toLowerCase().includes(q) ||
      brand?.nameTh.includes(q) ||
      `${brand?.name} ${m.name}`.toLowerCase().includes(q)
    );
  });
}

// Format price
export function formatPrice(price: number | null): string {
  if (price === null) return 'N/A';
  return `฿${price.toLocaleString()}`;
}

// Format battery
export function formatBattery(kwh: number | null): string {
  if (kwh === null) return 'N/A';
  return `${kwh} kWh`;
}

// Format range
export function formatRange(km: number | null, standard: string | null): string {
  if (km === null) return 'N/A';
  return `${km} กม.${standard ? ` (${standard})` : ''}`;
}

// Format power
export function formatPower(kw: number | null, hp: number | null): string {
  if (kw === null && hp === null) return 'N/A';
  if (kw === null) return `${hp} แรงม้า`;
  if (hp === null) return `${kw} kW`;
  return `${kw} kW / ${hp} แรงม้า`;
}
