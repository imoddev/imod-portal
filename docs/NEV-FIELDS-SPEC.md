# NEV Database - Required Fields Specification

## 📋 Overview

หน้า model detail ต้องแสดงข้อมูลครบถ้วนตาม spec sheet ของ BYD SEALION 7

---

## 🗃️ Database Fields Required

### ✅ Fields ที่มีแล้ว

```prisma
model NevVariant {
  // ... existing fields ...
  batteryKwh       Float?
  rangeKm          Int?
  rangeStandard    String?    // CLTC, WLTP, NEDC
  motorCount       Int
  motorKw          Float?
  motorHp          Int?
  torqueNm         Int?
  topSpeedKmh      Int?
  accel0100        Float?
  drivetrain       String?    // FWD, RWD, AWD
  dcChargeKw       Float?
  dcChargeMin      Int?
  acChargeKw       Float?
  chargePort       String?
  hasV2l           Boolean
  v2lKw            Float?
  lengthMm         Int?
  widthMm          Int?
  heightMm         Int?
  wheelbaseMm      Int?
  groundClearanceMm Int?
  curbWeightKg     Int?
  grossWeightKg    Int?
  trunkLitres      Int?
  warrantyVehicle  String?
  warrantyBattery  String?
  features         String?    // JSON
}
```

---

### ✅ Fields ที่เพิ่มแล้ว (ใน schema.prisma)

#### 1. ระบบกันสะเทือน (Suspension)
```prisma
suspensionFront   String?    // ระบบกันสะเทือนหน้า เช่น "MacPherson"
suspensionRear    String?    // ระบบกันสะเทือนหลัง เช่น "Multi-link"
```

#### 2. ระบบเบรก (Brakes)
```prisma
brakeFront        String?    // เบรกหน้า เช่น "Ventilated Disc"
brakeRear         String?    // เบรกหลัง เช่น "Solid Disc"
```

#### 3. ล้อและยาง (Wheels & Tires)
```prisma
wheelSizeFront    Int?       // ขนาดล้อหน้า (inch) เช่น 19
wheelSizeRear     Int?       // ขนาดล้อหลัง (inch) เช่น 20
tireSizeFront     String?    // ขนาดยางหน้า เช่น "235/50 R19"
tireSizeRear      String?    // ขนาดยางหลัง เช่น "265/45 R20"
```

#### 4. อุปกรณ์มาตรฐาน (Standard Equipment)
```prisma
exteriorEquipment String?    // JSON: อุปกรณ์ภายนอก
interiorEquipment String?    // JSON: อุปกรณ์ภายใน
safetyEquipment   String?    // JSON: ระบบความปลอดภัย
multimediaEquipment String?  // JSON: ระบบสื่อบันเทิง
```

---

## 📊 JSON Structure for Equipment

### exteriorEquipment
```json
{
  "headlights": "LED Matrix",
  "daytimeRunningLights": "LED",
  "taillights": "LED Through-type",
  "fogLights": "LED",
  "mirrors": "Electric Folding + Auto Dimming",
  "doorHandles": "Flush Electric",
  "roof": "Panoramic Glass",
  "wipers": "Rain Sensing"
}
```

### interiorEquipment
```json
{
  "steeringWheel": "Leather Wrapped",
  "steeringWheelAdjustment": "Electric 4-way",
  "seats": "Leather",
  "frontSeats": "Electric 12-way + Memory",
  "rearSeats": "60:40 Fold",
  "instrumentCluster": "10.25 inch Digital",
  "centerDisplay": "15.6 inch Touchscreen",
  "ambientLight": "64 Colors",
  "airConditioning": "Dual Zone Auto"
}
```

### safetyEquipment
```json
{
  "airbags": ["Driver", "Passenger", "Side", "Curtain", "Knee"],
  "abs": true,
  "ebd": true,
  "ba": true,
  "esp": true,
  "tcs": true,
  "hillStartAssist": true,
  "hillDescentControl": true,
  "tpms": true,
  "adas": [
    "ACC Adaptive Cruise Control",
    "AEB Autonomous Emergency Braking",
    "LDW Lane Departure Warning",
    "LKA Lane Keep Assist",
    "BSD Blind Spot Detection",
    "RCTA Rear Cross Traffic Alert",
    "DMS Driver Monitoring System"
  ]
}
```

### multimediaEquipment
```json
{
  "audioSystem": "12 Speakers",
  "audioBrand": "Dynaudio",
  "usbPorts": ["USB-A", "USB-C"],
  "wirelessCharging": true,
  "bluetooth": true,
  "appleCarplay": true,
  "androidAuto": true,
  "navigation": "Built-in GPS",
  "voiceControl": true,
  "otaUpdate": true
}
```

---

## 🤖 AI Extraction Prompt

เมื่อ AI ย่อยข้อมูลจาก PDF/รูปภาพ ต้อง **หาข้อมูลเหล่านี้มากรอกให้ครบ**:

```
คุณต้อง extract ข้อมูลจากเอกสารให้ครบถ้วนตามหัวข้อเหล่านี้:

1. **ขนาดและน้ำหนัก**
   - จำนวนที่นั่ง
   - ความยาว/กว้าง/สูง (mm)
   - ระยะฐานล้อ (mm)
   - ระยะห่างจากพื้น (mm)
   - น้ำหนักตัวรถ (kg)
   - น้ำหนักรวม (kg)
   - พื้นที่บรรทุก (litres)

2. **ระบบส่งกำลังและสมรรถนะ**
   - ระบบขับเคลื่อน (FWD/RWD/AWD)
   - จำนวนมอเตอร์
   - กำลังมอเตอร์ (kW/hp)
   - แรงบิด (Nm)
   - อัตราเร่ง 0-100 km/h (วินาที)
   - ความเร็วสูงสุด (km/h)

3. **แบตเตอรี่และระยะทาง**
   - ความจุแบตเตอรี่ (kWh)
   - ประเภทแบตเตอรี่
   - ระยะทาง (km) + มาตรฐาน (CLTC/WLTP/NEDC)
   - DC Fast Charging (kW)
   - DC Charge 10-80% (นาที)
   - AC Charging (kW)
   - พอร์ตชาร์จ
   - V2L (ใช่/ไม่ใช่ + kW)

4. **ระบบกันสะเทือน**
   - หน้า: MacPherson / Multi-link / อื่นๆ
   - หลัง: Multi-link / Torsion Beam / อื่นๆ

5. **ระบบเบรก**
   - หน้า: Ventilated Disc / Solid Disc / อื่นๆ
   - หลัง: Ventilated Disc / Solid Disc / Drum / อื่นๆ

6. **ล้อและยาง**
   - ขนาดล้อหน้า (inch)
   - ขนาดล้อหลัง (inch)
   - ขนาดยางหน้า (เช่น 235/50 R19)
   - ขนาดยางหลัง (เช่น 265/45 R20)

7. **อุปกรณ์มาตรฐานภายนอก**
   - ไฟหน้า (LED Matrix / LED / Halogen)
   - ไฟกลางวัน (DRL)
   - ไฟท้าย
   - ไฟตัดหมอก
   - กระจกมองหลัง
   - มือจับประตู
   - หลังคา (Panoramic / Solid)
   - ไฟฉีดน้ำฝน

8. **อุปกรณ์มาตรฐานภายใน**
   - พวงมาลัย
   - การปรับพวงมาลัย
   - เบาะนั่ง
   - เบาะหน้า (ปรับไฟฟ้า + Memory)
   - เบาะหลัง (พับได้)
   - จอแสดงผลหน้า
   - จอกลาง
   - ไฟบรรยากาศ
   - เครื่องปรับอากาศ

9. **ระบบความปลอดภัย**
   - ถุงลมนิรภัย (ทุกตำแหน่ง)
   - ABS, EBD, BA, ESP, TCS
   - Hill Start Assist, Hill Descent Control
   - TPMS
   - ADAS (ACC, AEB, LDW, LKA, BSD, RCTA, DMS ฯลฯ)

10. **ระบบสื่อบันเทิง**
    - ระบบเสียง (จำนวนลำโพง + แบรนด์)
    - USB Ports
    - Wireless Charging
    - Bluetooth
    - Apple CarPlay / Android Auto
    - Navigation
    - Voice Control
    - OTA Update

11. **การรับประกัน**
    - รับประกันตัวรถ
    - รับประกันแบตเตอรี่
```

---

## ✅ Action Items

### Lucus (Backend/DB)
1. [x] เพิ่ม fields ใน `schema.prisma` - **Done! Fields มีครบแล้ว**
2. [ ] Run `npx prisma migrate dev` (ถ้ายังไม่ได้ run)
3. [ ] Update AI extraction prompt ให้หาข้อมูลครบตาม spec
4. [ ] Update API `/api/nev/admin/variants/[id]` ให้ return fields ใหม่
5. [ ] **Fix AI extraction logic** - "MG IM" → แยกเป็น brand="MG", model="IM5"

### AJ White (Frontend)
1. [x] ออกแบบ UI หน้า model detail ให้แสดงทุกหัวข้อ
2. [ ] แก้หน้า `/nev/admin/brands` - ใช้ dark theme + modern layout
3. [ ] แก้หน้า `/nev/admin/variants` - ใช้ dark theme + modern layout
4. [ ] แก้หน้า `/nev/admin/variants/[id]` - เพิ่ม fields ครบตาม BYD spec

---

## 📅 Created: 2026-03-11
## 👤 Created by: AJ White
## 🔔 For: @Lucus
