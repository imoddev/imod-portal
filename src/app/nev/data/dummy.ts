// Dummy Data สำหรับ NEV Database
// Developer: AJ White (Lucus #008)
// Version: 1.0.0-beta.1

export interface Brand {
  id: string;
  name: string;
  nameTh: string | null;
  slug: string;
  logoUrl: string | null;
  country: string | null;
  totalModels: number;
}

export interface Variant {
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
  topSpeedKmh: number | null;
  accel0100: number | null;
  drivetrain: string | null;
  dcChargeKw: number | null;
  dcChargeMin: number | null;
  acChargeKw: number | null;
  warrantyVehicle: string | null;
  warrantyBattery: string | null;
  features: string | null;
}

export interface Model {
  id: string;
  name: string;
  nameTh: string | null;
  slug: string;
  fullName: string | null;
  year: number | null;
  bodyType: string | null;
  segment: string | null;
  seats: number | null;
  powertrain: string; // BEV, PHEV, HEV, REEV, ICE
  assembly: string | null;
  madeIn: string | null;
  imageUrl: string | null;
  overview: string | null;
  highlights: string[];
  brand: Brand;
  variants: Variant[];
}

// Dummy Brands
export const dummyBrands: Brand[] = [
  {
    id: 'brand-1',
    name: 'BYD',
    nameTh: 'บีวายดี',
    slug: 'byd',
    logoUrl: null,
    country: 'China',
    totalModels: 12,
  },
  {
    id: 'brand-2',
    name: 'Tesla',
    nameTh: 'เทสลา',
    slug: 'tesla',
    logoUrl: null,
    country: 'USA',
    totalModels: 4,
  },
  {
    id: 'brand-3',
    name: 'MG',
    nameTh: 'เอ็มจี',
    slug: 'mg',
    logoUrl: null,
    country: 'UK/China',
    totalModels: 8,
  },
  {
    id: 'brand-4',
    name: 'NIO',
    nameTh: 'นีโอ',
    slug: 'nio',
    logoUrl: null,
    country: 'China',
    totalModels: 5,
  },
  {
    id: 'brand-5',
    name: 'Deepal',
    nameTh: 'ดีพอล',
    slug: 'deepal',
    logoUrl: null,
    country: 'China',
    totalModels: 6,
  },
  {
    id: 'brand-6',
    name: 'GWM',
    nameTh: 'จีดับเบิ้ลยูแอม',
    slug: 'gwm',
    logoUrl: null,
    country: 'China',
    totalModels: 7,
  },
  {
    id: 'brand-7',
    name: 'Zeekr',
    nameTh: 'ซีเคอร์',
    slug: 'zeekr',
    logoUrl: null,
    country: 'China',
    totalModels: 3,
  },
  {
    id: 'brand-8',
    name: 'Volvo',
    nameTh: 'โวลโว่',
    slug: 'volvo',
    logoUrl: null,
    country: 'Sweden',
    totalModels: 5,
  },
];

// Dummy Models with Variants
export const dummyModels: Model[] = [
  // BYD Dolphin
  {
    id: 'model-1',
    name: 'Dolphin',
    nameTh: 'ดอลฟิน',
    slug: 'byd-dolphin',
    fullName: 'BYD Dolphin',
    year: 2026,
    bodyType: 'Hatchback',
    segment: 'B',
    seats: 5,
    powertrain: 'BEV',
    assembly: 'CKD',
    madeIn: 'Thailand',
    imageUrl: null,
    overview: 'รถยนต์ไฟฟ้า 100% แฮทช์แบ็ก B-Segment ขับเคลื่อนล้อหน้า ประกอบในไทย (CKD)',
    highlights: ['Blade Battery', 'V2L', 'Rotary Gear Shifter'],
    brand: dummyBrands[0],
    variants: [
      {
        id: 'variant-1-1',
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
        acChargeKw: 11,
        warrantyVehicle: '6 ปี / 150,000 กม.',
        warrantyBattery: '8 ปี / 160,000 กม.',
        features: null,
      },
      {
        id: 'variant-1-2',
        name: 'Extended',
        fullName: 'BYD Dolphin Extended',
        slug: 'byd-dolphin-extended',
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
        warrantyVehicle: '6 ปี / 150,000 กม.',
        warrantyBattery: '8 ปี / 160,000 กม.',
        features: null,
      },
    ],
  },
  // BYD Seal
  {
    id: 'model-2',
    name: 'Seal',
    nameTh: 'ซีล',
    slug: 'byd-seal',
    fullName: 'BYD Seal',
    year: 2026,
    bodyType: 'Sedan',
    segment: 'D',
    seats: 5,
    powertrain: 'BEV',
    assembly: 'CBU',
    madeIn: 'China',
    imageUrl: null,
    overview: 'สปอร์ตซีดาน BEV D-Segment ขับเคลื่อนล้อหลัง เทคโนโลยี e-Platform 3.0 + CTB',
    highlights: ['e-Platform 3.0', 'Cell-to-Body (CTB)', 'iTAC System'],
    brand: dummyBrands[0],
    variants: [
      {
        id: 'variant-2-1',
        name: 'Dynamic RWD',
        fullName: 'BYD Seal Dynamic RWD',
        slug: 'byd-seal-dynamic-rwd',
        priceBaht: 1299000,
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
        dcChargeMin: 25,
        acChargeKw: 11,
        warrantyVehicle: '6 ปี / 150,000 กม.',
        warrantyBattery: '8 ปี / 160,000 กม.',
        features: null,
      },
      {
        id: 'variant-2-2',
        name: 'Premium RWD',
        fullName: 'BYD Seal Premium RWD',
        slug: 'byd-seal-premium-rwd',
        priceBaht: 1499000,
        batteryKwh: 82.5,
        rangeKm: 650,
        rangeStandard: 'CLTC',
        motorKw: 230,
        motorHp: 313,
        torqueNm: 360,
        topSpeedKmh: 180,
        accel0100: 5.9,
        drivetrain: 'RWD',
        dcChargeKw: 110,
        dcChargeMin: 24,
        acChargeKw: 11,
        warrantyVehicle: '6 ปี / 150,000 กม.',
        warrantyBattery: '8 ปี / 160,000 กม.',
        features: null,
      },
      {
        id: 'variant-2-3',
        name: 'Performance AWD',
        fullName: 'BYD Seal Performance AWD',
        slug: 'byd-seal-performance-awd',
        priceBaht: 1799000,
        batteryKwh: 82.5,
        rangeKm: 580,
        rangeStandard: 'CLTC',
        motorKw: 390,
        motorHp: 530,
        torqueNm: 670,
        topSpeedKmh: 180,
        accel0100: 3.8,
        drivetrain: 'AWD',
        dcChargeKw: 110,
        dcChargeMin: 24,
        acChargeKw: 11,
        warrantyVehicle: '6 ปี / 150,000 กม.',
        warrantyBattery: '8 ปี / 160,000 กม.',
        features: null,
      },
    ],
  },
  // Tesla Model 3
  {
    id: 'model-3',
    name: 'Model 3',
    nameTh: 'โมเดล 3',
    slug: 'tesla-model-3',
    fullName: 'Tesla Model 3',
    year: 2026,
    bodyType: 'Sedan',
    segment: 'D',
    seats: 5,
    powertrain: 'BEV',
    assembly: 'CBU',
    madeIn: 'USA/China',
    imageUrl: null,
    overview: 'ซีดานไฟฟ้าระดับพรีเมียมจาก Tesla',
    highlights: ['Autopilot', 'Supercharger Network', 'OTA Updates'],
    brand: dummyBrands[1],
    variants: [
      {
        id: 'variant-3-1',
        name: 'Standard Range',
        fullName: 'Tesla Model 3 Standard Range',
        slug: 'tesla-model-3-standard-range',
        priceBaht: 1599000,
        batteryKwh: 60,
        rangeKm: 513,
        rangeStandard: 'WLTP',
        motorKw: 194,
        motorHp: 267,
        torqueNm: 340,
        topSpeedKmh: 225,
        accel0100: 6.1,
        drivetrain: 'RWD',
        dcChargeKw: 170,
        dcChargeMin: 20,
        acChargeKw: 11,
        warrantyVehicle: '4 ปี / 80,000 กม.',
        warrantyBattery: '8 ปี / 192,000 กม.',
        features: null,
      },
      {
        id: 'variant-3-2',
        name: 'Long Range AWD',
        fullName: 'Tesla Model 3 Long Range AWD',
        slug: 'tesla-model-3-long-range-awd',
        priceBaht: 1899000,
        batteryKwh: 78,
        rangeKm: 629,
        rangeStandard: 'WLTP',
        motorKw: 366,
        motorHp: 498,
        torqueNm: 510,
        topSpeedKmh: 233,
        accel0100: 4.2,
        drivetrain: 'AWD',
        dcChargeKw: 250,
        dcChargeMin: 15,
        acChargeKw: 11,
        warrantyVehicle: '4 ปี / 80,000 กม.',
        warrantyBattery: '8 ปี / 192,000 กม.',
        features: null,
      },
    ],
  },
  // MG4
  {
    id: 'model-4',
    name: 'MG4',
    nameTh: 'เอ็มจี 4',
    slug: 'mg4',
    fullName: 'MG4',
    year: 2026,
    bodyType: 'Hatchback',
    segment: 'C',
    seats: 5,
    powertrain: 'BEV',
    assembly: 'CBU',
    madeIn: 'China',
    imageUrl: null,
    overview: 'รถยนต์ไฟฟ้า C-Segment Hatchback ความคุ้มค่าสูง',
    highlights: ['MSP Platform', 'RWD', 'One-Pedal Driving'],
    brand: dummyBrands[2],
    variants: [
      {
        id: 'variant-4-1',
        name: 'Standard',
        fullName: 'MG4 Standard',
        slug: 'mg4-standard',
        priceBaht: 949000,
        batteryKwh: 51,
        rangeKm: 350,
        rangeStandard: 'WLTP',
        motorKw: 125,
        motorHp: 170,
        torqueNm: 250,
        topSpeedKmh: 160,
        accel0100: 7.7,
        drivetrain: 'RWD',
        dcChargeKw: 87,
        dcChargeMin: 35,
        acChargeKw: 7.4,
        warrantyVehicle: '5 ปี / 100,000 กม.',
        warrantyBattery: '8 ปี / 180,000 กม.',
        features: null,
      },
      {
        id: 'variant-4-2',
        name: 'Long Range',
        fullName: 'MG4 Long Range',
        slug: 'mg4-long-range',
        priceBaht: 1149000,
        batteryKwh: 64,
        rangeKm: 450,
        rangeStandard: 'WLTP',
        motorKw: 150,
        motorHp: 204,
        torqueNm: 250,
        topSpeedKmh: 160,
        accel0100: 7.5,
        drivetrain: 'RWD',
        dcChargeKw: 87,
        dcChargeMin: 35,
        acChargeKw: 7.4,
        warrantyVehicle: '5 ปี / 100,000 กม.',
        warrantyBattery: '8 ปี / 180,000 กม.',
        features: null,
      },
    ],
  },
  // Deepal S05
  {
    id: 'model-5',
    name: 'S05',
    nameTh: 'เอส 05',
    slug: 'deepal-s05',
    fullName: 'Deepal S05',
    year: 2026,
    bodyType: 'SUV',
    segment: 'C',
    seats: 5,
    powertrain: 'BEV',
    assembly: 'CBU',
    madeIn: 'China',
    imageUrl: null,
    overview: 'SUV ไฟฟ้า C-Segment ราคาคุ้มค่า',
    highlights: ['AR-HUD', '14.6" Touchscreen', 'Level 2 ADAS'],
    brand: dummyBrands[4],
    variants: [
      {
        id: 'variant-5-1',
        name: 'BEV Standard',
        fullName: 'Deepal S05 BEV Standard',
        slug: 'deepal-s05-bev-standard',
        priceBaht: 899000,
        batteryKwh: 56.1,
        rangeKm: 475,
        rangeStandard: 'CLTC',
        motorKw: 160,
        motorHp: 218,
        torqueNm: 320,
        topSpeedKmh: 180,
        accel0100: 7.3,
        drivetrain: 'RWD',
        dcChargeKw: 80,
        dcChargeMin: 30,
        acChargeKw: 7,
        warrantyVehicle: '5 ปี / 150,000 กม.',
        warrantyBattery: '8 ปี / 160,000 กม.',
        features: null,
      },
    ],
  },
];

// Stats
export const dummyStats = {
  totalBrands: dummyBrands.length,
  totalModels: dummyModels.length,
  totalVariants: dummyModels.reduce((sum, m) => sum + m.variants.length, 0),
  latestModels: dummyModels.slice(0, 6),
};
