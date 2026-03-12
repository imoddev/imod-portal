/**
 * NEV Master Features List
 * For checkbox-based feature selection in admin UI
 */

export interface FeatureItem {
  code: string;
  label: string;
  labelTh: string;
}

export interface FeatureCategory {
  id: string;
  label: string;
  labelTh: string;
  features: FeatureItem[];
}

/**
 * Safety Features (40 items)
 * Grouped into 4 categories: Passive, Active, ADAS, Advanced ADAS
 */
export const SAFETY_FEATURES: FeatureCategory[] = [
  {
    id: 'passive',
    label: 'Passive Safety',
    labelTh: 'ความปลอดภัยเชิงรับ',
    features: [
      { code: 'airbags_front', label: 'Front Airbags', labelTh: 'ถุงลมหน้า' },
      { code: 'airbags_side', label: 'Side Airbags', labelTh: 'ถุงลมด้านข้าง' },
      { code: 'airbags_curtain', label: 'Curtain Airbags', labelTh: 'ถุงลมม่าน' },
      { code: 'airbags_knee', label: 'Knee Airbags', labelTh: 'ถุงลมเข่า' },
      { code: 'seatbelt_pretensioner', label: 'Seatbelt Pretensioners', labelTh: 'ตัวดึงสายเข็มขัด' },
      { code: 'isofix', label: 'ISOFIX Child Seat Anchors', labelTh: 'จุดยึดเบาะเด็ก' },
      { code: 'anti_theft', label: 'Anti-theft System', labelTh: 'ระบบป้องกันโจรกรรม' },
    ],
  },
  {
    id: 'active',
    label: 'Active Safety',
    labelTh: 'ความปลอดภัยเชิงรุก',
    features: [
      { code: 'abs', label: 'ABS', labelTh: 'ABS' },
      { code: 'ebd', label: 'EBD', labelTh: 'EBD' },
      { code: 'ba', label: 'Brake Assist', labelTh: 'ช่วยเบรก' },
      { code: 'esc', label: 'ESC / ESP', labelTh: 'ควบคุมการทรงตัว' },
      { code: 'tcs', label: 'TCS', labelTh: 'ควบคุมแรงยึดเกาะ' },
      { code: 'hsa', label: 'Hill Start Assist', labelTh: 'ช่วยออกตัวขึ้นเนิน' },
      { code: 'hdc', label: 'Hill Descent Control', labelTh: 'ช่วยลงเนิน' },
      { code: 'tpms', label: 'TPMS', labelTh: 'เตือนลมยาง' },
      { code: 'door_open_warning', label: 'Door Open Warning', labelTh: 'เตือนประตูเปิด' },
    ],
  },
  {
    id: 'adas',
    label: 'ADAS',
    labelTh: 'ระบบช่วยขับขี่อัจฉริยะ',
    features: [
      { code: 'camera_360', label: '360° Camera System', labelTh: 'กล้องมองรอบคัน' },
      { code: 'parking_sensors_front', label: 'Front Parking Sensors', labelTh: 'เซ็นเซอร์จอดหน้า' },
      { code: 'parking_sensors_rear', label: 'Rear Parking Sensors', labelTh: 'เซ็นเซอร์จอดหลัง' },
      { code: 'parking_assist', label: 'Parking Assist', labelTh: 'ช่วยจอดรถ' },
      { code: 'fcw', label: 'Forward Collision Warning', labelTh: 'เตือนชนด้านหน้า' },
      { code: 'aeb', label: 'Automatic Emergency Braking', labelTh: 'เบรกฉุกเฉินอัตโนมัติ' },
      { code: 'ldw', label: 'Lane Departure Warning', labelTh: 'เตือนออกนอกเลน' },
      { code: 'lka', label: 'Lane Keep Assist', labelTh: 'ช่วยรักษาเลน' },
      { code: 'lca', label: 'Lane Centering Assist', labelTh: 'จัดกึ่งกลางเลน' },
      { code: 'bsm', label: 'Blind Spot Monitoring', labelTh: 'เตือนจุดอับสายตา' },
      { code: 'rcta', label: 'Rear Cross Traffic Alert', labelTh: 'เตือนรถตัดด้านหลัง' },
      { code: 'acc', label: 'Adaptive Cruise Control', labelTh: 'ควบคุมความเร็วอัตโนมัติ' },
      { code: 'ica', label: 'Intelligent Cruise Assist', labelTh: 'ระบบช่วยขับอัจฉริยะ' },
      { code: 'traffic_jam_assist', label: 'Traffic Jam Assist', labelTh: 'ช่วยขับรถติด' },
      { code: 'auto_high_beam', label: 'Auto High Beam', labelTh: 'ปรับไฟสูงอัตโนมัติ' },
      { code: 'night_vision', label: 'Night Vision', labelTh: 'มองเห็นในความมืด' },
      { code: 'driver_monitoring', label: 'Driver Monitoring System', labelTh: 'ตรวจจับความเหนื่อยล้า' },
      { code: 'speed_limit_recognition', label: 'Speed Limit Recognition', labelTh: 'อ่านป้ายจำกัดความเร็ว' },
      { code: 'traffic_sign_recognition', label: 'Traffic Sign Recognition', labelTh: 'อ่านป้ายจราจร' },
    ],
  },
  {
    id: 'advanced_adas',
    label: 'Advanced ADAS (Level 2+)',
    labelTh: 'ระบบขับขี่อัจฉริยะขั้นสูง',
    features: [
      { code: 'highway_pilot', label: 'Highway Pilot', labelTh: 'ขับอัตโนมัติบนทางด่วน' },
      { code: 'auto_lane_change', label: 'Auto Lane Change', labelTh: 'เปลี่ยนเลนอัตโนมัติ' },
      { code: 'automatic_parking', label: 'Automatic Parking', labelTh: 'จอดรถอัตโนมัติ' },
      { code: 'remote_parking', label: 'Remote Parking', labelTh: 'จอดรถด้วยรีโมท' },
      { code: 'reverse_assist', label: 'Reverse Assist', labelTh: 'ช่วยถอยหลังตามเส้นทางเดิม' },
    ],
  },
];

/**
 * Get all safety feature codes (for validation)
 */
export function getAllSafetyFeatureCodes(): string[] {
  return SAFETY_FEATURES.flatMap(cat => cat.features.map(f => f.code));
}

/**
 * Get safety feature label by code
 */
export function getSafetyFeatureLabel(code: string, lang: 'en' | 'th' = 'en'): string {
  for (const category of SAFETY_FEATURES) {
    const feature = category.features.find(f => f.code === code);
    if (feature) {
      return lang === 'th' ? feature.labelTh : feature.label;
    }
  }
  return code;
}

/**
 * Group selected features by category
 */
export function groupSafetyFeatures(selectedCodes: string[]): Record<string, FeatureItem[]> {
  const grouped: Record<string, FeatureItem[]> = {};
  
  for (const category of SAFETY_FEATURES) {
    const categoryFeatures = category.features.filter(f => 
      selectedCodes.includes(f.code)
    );
    if (categoryFeatures.length > 0) {
      grouped[category.labelTh] = categoryFeatures;
    }
  }
  
  return grouped;
}

/**
 * Validate feature codes against master list
 */
export function validateSafetyFeatures(codes: string[]): {
  valid: string[];
  invalid: string[];
} {
  const allCodes = getAllSafetyFeatureCodes();
  const valid = codes.filter(c => allCodes.includes(c));
  const invalid = codes.filter(c => !allCodes.includes(c));
  
  return { valid, invalid };
}
