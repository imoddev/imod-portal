# NEV Database Schema V2.0

**Based on:** BYD SEALION 7 Specification (Complete Brochure Analysis)  
**Date:** March 12, 2026  
**Goal:** Standardize all EV specs following BYD's categorization

---

## หมวดหมู่ข้อมูล (11 Categories)

### 1. **Multimedia & Convenience** (ระบบบันเทิงและความสะดวกสบาย)
### 2. **Safety Systems** (ระบบความปลอดภัย)
### 3. **Interior Equipment** (อุปกรณ์ภายใน)
### 4. **Exterior Equipment** (อุปกรณ์ภายนอก)
### 5. **EV Energy Features** (พลังงานใหม่)
### 6. **Battery** (แบตเตอรี่ขับเคลื่อน)
### 7. **Suspension** (ระบบกันสะเทือน)
### 8. **Brake System** (ระบบเบรก)
### 9. **Wheels & Tires** (ล้อและยาง)
### 10. **Powertrain & Performance** (ระบบส่งกำลังและสมรรถนะ)
### 11. **Dimensions & Weight** (ขนาดและน้ำหนัก)

---

## Prisma Schema (Extended)

```prisma
// ===========================
// 1. Multimedia & Convenience
// ===========================
model NevMultimedia {
  id                  String  @id @default(cuid())
  variantId           String  @unique
  variant             NevVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  
  // Display
  displaySize         Float?   // 15.6 นิ้ว
  displayType         String?  // "Rotating touchscreen"
  displayResolution   String?  // Optional
  
  // Connectivity
  bluetooth           Boolean  @default(false)
  appleCarPlay        Boolean  @default(false)
  androidAuto         Boolean  @default(false)
  
  // Audio
  audioSystem         String?  // "DYNAUDIO"
  speakerCount        Int?     // 12
  
  // Features
  voiceControl        Boolean  @default(false)
  voiceLanguages      String?  // "Thai, English" (comma-separated)
  navigation          Boolean  @default(false)
  musicStreaming      Boolean  @default(false)
  
  // Ports
  usbCFront           Int?     // จำนวนช่อง USB-C ด้านหน้า
  usbAFront           Int?     // จำนวนช่อง USB-A ด้านหน้า
  usbCRear            Int?     // จำนวนช่อง USB-C ด้านหลัง
  usbARear            Int?     // จำนวนช่อง USB-A ด้านหลัง
  powerOutlet12V      Boolean  @default(false)
  wirelessCharging    Boolean  @default(false)
  wirelessChargingWatt Float?  // 50W
  
  // OTA & Smart Features
  otaUpdate           Boolean  @default(false)
  keylessEntry        Boolean  @default(false)
  keylessStart        Boolean  @default(false)
  nfcCard             Boolean  @default(false)
  digitalKey          Boolean  @default(false)
  
  // Climate
  climateZones        Int?     // 2
  rearVents           Boolean  @default(false)
  ionizer             Boolean  @default(false)
  pm25Filter          Boolean  @default(false)
  pm25FilterType      String?  // "CN95"
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

// ===========================
// 2. Safety Systems
// ===========================
model NevSafety {
  id                  String  @id @default(cuid())
  variantId           String  @unique
  variant             NevVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  
  // Airbags
  airbagsFront        Int?     // 2
  airbagsSide         Int?     // 2
  airbagsCurtain      Boolean  @default(false)
  airbagsCenter       Boolean  @default(false)  // ถุงลมระหว่างคนขับและผู้โดยสาร
  airbagsRearSide     Boolean  @default(false)
  
  // Seatbelts
  seatbeltPretensioner Boolean @default(false)
  seatbeltReminderFront Boolean @default(false)
  seatbeltReminderRear Boolean @default(false)
  
  // Child Safety
  childLockElectric   Boolean  @default(false)
  
  // Camera & Sensors
  camera360           Boolean  @default(false)
  parkingSensorsFront Int?     // 2
  parkingSensorsRear  Int?     // 4
  
  // Stability Control
  esc                 Boolean  @default(false)  // ESC
  tcs                 Boolean  @default(false)  // TCS
  ebd                 Boolean  @default(false)  // EBD
  hhc                 Boolean  @default(false)  // HHC
  avh                 Boolean  @default(false)  // AVH
  
  // ADAS
  adaptiveCruise      Boolean  @default(false)  // ACC
  intelligentCruise   Boolean  @default(false)  // ICC
  trafficSignRecog    Boolean  @default(false)  // TSR
  speedLimitAlert     Boolean  @default(false)  // ISLI
  speedLimitControl   Boolean  @default(false)  // ISLC
  
  autoEmergencyBrake  Boolean  @default(false)  // AEB
  forwardCollisionWarn Boolean @default(false)  // FCW
  rearCollisionWarn   Boolean  @default(false)  // RCW
  
  laneDepartureWarn   Boolean  @default(false)  // LDW
  laneKeepAssist      Boolean  @default(false)  // LDP/LKA
  emergencyLaneKeep   Boolean  @default(false)  // ELKA
  
  frontCrossTrafficAlert Boolean @default(false) // FCTA
  frontCrossTrafficBrake Boolean @default(false) // FCTB
  rearCrossTrafficAlert Boolean @default(false)  // RCTA
  rearCrossTrafficBrake Boolean @default(false)  // RCTB
  
  autoHighBeam        Boolean  @default(false)  // HMA
  blindSpotDetection  Boolean  @default(false)  // BSD
  doorOpenWarning     Boolean  @default(false)  // DOW
  driverMonitoring    Boolean  @default(false)  // DMS
  tpms                Boolean  @default(false)  // TPMS
  
  // AWD-specific
  itac                Boolean  @default(false)  // Intelligent Torque Adaptation Control
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

// ===========================
// 3. Interior Equipment
// ===========================
model NevInterior {
  id                  String  @id @default(cuid())
  variantId           String  @unique
  variant             NevVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  
  // Steering
  steeringMultifunction Boolean @default(false)
  steeringPowerAssist String?  // "DP-EPS"
  steeringMaterial    String?  // "NAPPA Leather"
  
  // Display
  hudDisplay          Boolean  @default(false)  // W-HUD
  instrumentCluster   String?  // "10.25\" LCD"
  
  // Mirrors
  rearviewMirrorAutoDim Boolean @default(false)
  sideM

irrorsAutoDim  Boolean @default(false)
  sideMirrorsFold     Boolean  @default(false)
  sideMirrorsHeated   Boolean  @default(false)
  sideMirrorsMemory   Boolean  @default(false)
  sideMirrorsAutoTilt Boolean  @default(false)  // เมื่อถอยหลัง
  
  // Seating
  seatMaterial        String?  // "NAPPA Leather"
  
  // Front seats
  driverSeatPower     Boolean  @default(false)
  driverSeatAdjustments Int?   // 8-way
  driverSeatLumbar    Boolean  @default(false)
  driverSeatMemory    Boolean  @default(false)
  driverSeatVentilation Boolean @default(false)
  
  passengerSeatPower  Boolean  @default(false)
  passengerSeatAdjustments Int? // 6-way
  
  welcomeSeat         Boolean  @default(false)
  
  // Rear seats
  rearSeatFold        String?  // "60/40"
  rearSeatArmrest     Boolean  @default(false)
  rearSeatCupholders  Int?     // 2
  
  // ISOFIX
  isofixPoints        Int?     // 2
  
  // Storage
  sunglassHolder      Boolean  @default(false)
  cupholdersFront     Int?
  vanityMirrors       Boolean  @default(false)
  
  // Lighting
  ambientLighting     Boolean  @default(false)
  ambientLightingType String?  // "RGB Dynamic Mood Lights"
  readingLightsFront  Int?
  readingLightsRear   Int?
  trunkLight          Boolean  @default(false)
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

// ===========================
// 4. Exterior Equipment
// ===========================
model NevExterior {
  id                  String  @id @default(cuid())
  variantId           String  @unique
  variant             NevVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  
  // Lighting
  headlightsType      String?  // "LED"
  headlightsAuto      Boolean  @default(false)
  headlightsFollowMeHome Boolean @default(false)
  drlType             String?  // "LED"
  taillightsType      String?  // "LED"
  
  rearFogLights       Boolean  @default(false)
  turnSignalsSequential Boolean @default(false)
  thirdBrakeLight     Boolean  @default(false)
  thirdBrakeLightType String?  // "LED"
  
  // Roof
  sunroofType         String?  // "Panoramic glass"
  sunroofElectric     Boolean  @default(false)
  sunroofCurtain      Boolean  @default(false)
  
  // Doors & Access
  doorHandlesRetractable Boolean @default(false)
  powerTailgate       Boolean  @default(false)
  kickSensorTailgate  Boolean  @default(false)
  
  // Mirrors
  sideMirrorsPower    Boolean  @default(false)
  sideMirrorsFold     Boolean  @default(false)
  sideMirrorsHeated   Boolean  @default(false)
  sideMirrorsMemory   Boolean  @default(false)
  sideMirrorsAutoTilt Boolean  @default(false)
  
  // Windows
  windowsFrontLaminated Boolean @default(false)  // 2 layers
  windowsRearPrivacy  Boolean  @default(false)
  windowsRearDefrost  Boolean  @default(false)
  
  // Wipers
  wipersFrontAuto     Boolean  @default(false)
  wipersRear          Boolean  @default(false)
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

// ===========================
// 5. EV Energy Features
// ===========================
model NevEVFeatures {
  id                  String  @id @default(cuid())
  variantId           String  @unique
  variant             NevVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  
  // Range
  rangeNEDC           Float?   // 567 km
  rangeWLTP           Float?   // Optional
  rangeEPA            Float?   // Optional
  
  // Charging Mode 2 (Portable)
  chargerMode2        Boolean  @default(false)
  
  // AC Charging
  acChargeType        String?  // "Type 2"
  acChargeMaxKw       Float?   // 11 kW
  
  // DC Fast Charging
  dcChargeType        String?  // "CCS2"
  dcChargeMaxKw       Float?   // 150 kW
  dcCharge10to80Min   Float?   // Optional: minutes to charge 10-80%
  
  // V2L (Vehicle to Load)
  v2l                 Boolean  @default(false)
  v2lAccessories      Boolean  @default(false)
  
  // Regenerative Braking
  regenerativeBrake   Boolean  @default(false)
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

// ===========================
// 6. Battery
// ===========================
model NevBatteryDetails {
  id                  String  @id @default(cuid())
  variantId           String  @unique
  variant             NevVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  
  batteryType         String?  // "BYD Blade Battery"
  batteryKwh          Float?   // 82.5 kWh
  batteryVoltage      Float?   // Optional: 800V
  batteryChemistry    String?  // "LFP" (Lithium Iron Phosphate)
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

// ===========================
// 7. Suspension
// ===========================
model NevSuspension {
  id                  String  @id @default(cuid())
  variantId           String  @unique
  variant             NevVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  
  frontType           String?  // "Independent"
  rearType            String?  // "Multi-link"
  adaptiveSuspension  String?  // "FSD" (Frequency Selective Damping)
  adaptiveFrontRear   String?  // "Front & Rear"
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

// ===========================
// 8. Brake System
// ===========================
model NevBrakeSystem {
  id                  String  @id @default(cuid())
  variantId           String  @unique
  variant             NevVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  
  frontBrakeType      String?  // "Ventilated disc with dual air channels"
  rearBrakeType       String?  // "Ventilated disc"
  
  caliperColor        String?  // "-" (Premium), "Red" (AWD Performance)
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

// ===========================
// 9. Wheels & Tires
// ===========================
model NevWheelsTires {
  id                  String  @id @default(cuid())
  variantId           String  @unique
  variant             NevVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  
  wheelSizeInch       Float?   // 19, 20
  wheelMaterial       String?  // "Alloy"
  
  tireSizeFront       String?  // "235/60 R19"
  tireSizeRear        String?  // "255/45 R19" or same as front
  
  spareTire           Boolean  @default(false)
  spareType           String?  // "Emergency repair kit"
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

// ===========================
// 10. Powertrain & Performance
// ===========================
model NevPowertrain {
  id                  String  @id @default(cuid())
  variantId           String  @unique
  variant             NevVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  
  drivetrain          String?  // "RWD", "AWD"
  
  // Front motor
  frontMotorType      String?  // "Synchronous" or null
  frontMotorKw        Float?   // 160 kW (AWD only)
  frontMotorNm        Float?   // 310 Nm (AWD only)
  
  // Rear motor
  rearMotorType       String?  // "Permanent Magnet Synchronous"
  rearMotorKw         Float?   // 230 kW
  rearMotorNm         Float?   // 380 Nm
  
  // Combined
  totalPowerKw        Float?   // 230 (RWD), 390 (AWD)
  totalTorqueNm       Float?   // 380 (RWD), 690 (AWD)
  
  // Performance
  accel0100           Float?   // 6.7s (RWD), 4.5s (AWD)
  topSpeedKmh         Float?   // Optional
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

// ===========================
// 11. Dimensions & Weight
// ===========================
model NevDimensions {
  id                  String  @id @default(cuid())
  variantId           String  @unique
  variant             NevVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  
  seatingCapacity     Int?     // 5
  
  lengthMm            Float?   // 4830
  widthMm             Float?   // 1925
  heightMm            Float?   // 1620
  wheelbaseMm         Float?   // 2930
  
  groundClearanceMm   Float?   // 157 (Premium), 163 (AWD)
  groundClearanceLoadedMm Float? // 140
  
  turningRadiusM      Float?   // 5.85
  
  trunkCapacityFrontL Float?   // 58 (AWD only)
  trunkCapacityRearL  Float?   // 500
  
  curbWeightKg        Float?   // 2225 (Premium), 2340 (AWD)
  gvwKg               Float?   // 2635 (Premium), 2750 (AWD)
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

// ===========================
// Core Tables (Existing)
// ===========================

model NevBrand {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  nameTh      String?
  logoUrl     String?
  description String?
  models      NevModel[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug])
}

model NevModel {
  id          String   @id @default(cuid())
  slug        String   @unique
  brandId     String
  brand       NevBrand @relation(fields: [brandId], references: [id], onDelete: Cascade)
  
  name        String
  nameTh      String?
  imageUrl    String?
  powertrain  String?  // "BEV", "PHEV", "HEV"
  
  description String?
  variants    NevVariant[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug])
  @@index([brandId])
}

model NevVariant {
  id          String   @id @default(cuid())
  modelId     String
  model       NevModel @relation(fields: [modelId], references: [id], onDelete: Cascade)
  
  name        String
  nameTh      String?
  imageUrl    String?
  
  // Basic specs (kept for backward compatibility)
  priceBaht   Float?
  batteryKwh  Float?
  rangeKm     Float?
  motorHp     Float?
  torqueNm    Float?
  accel0100   Float?
  topSpeedKmh Float?
  drivetrain  String?  // "FWD", "RWD", "AWD"
  dcChargeKw  Float?
  dcChargeMin Float?
  lengthMm    Float?
  widthMm     Float?
  heightMm    Float?
  wheelbaseMm Float?
  curbWeightKg Float?
  
  // Relations to detailed specs
  multimedia  NevMultimedia?
  safety      NevSafety?
  interior    NevInterior?
  exterior    NevExterior?
  evFeatures  NevEVFeatures?
  battery     NevBatteryDetails?
  suspension  NevSuspension?
  brakes      NevBrakeSystem?
  wheels      NevWheelsTires?
  powertrain  NevPowertrain?
  dimensions  NevDimensions?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([modelId])
}
```

---

## Summary

### Total Fields: ~200+ fields across 11 categories

### Key Improvements:
1. **Organized by category** — matching BYD's brochure structure
2. **Boolean fields** — for yes/no features (●/−)
3. **Nullable fields** — allow variants to have partial data
4. **Relations** — one-to-one from NevVariant
5. **Backward compatible** — existing fields kept in NevVariant

### Next Steps:
1. Run Prisma migration
2. Update API routes for each category
3. AJ White: Design frontend UI matching BYD's layout
4. Marcus-EV: Update AI extraction to populate all categories

