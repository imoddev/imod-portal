import { NextRequest, NextResponse } from 'next/server';

// API สำหรับขอให้ Marcus-EV ค้นหาข้อมูลเพิ่มเติม
export async function POST(request: NextRequest) {
  try {
    const { variantId, variantName, brand, model } = await request.json();

    if (!variantId || !variantName || !brand || !model) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: ส่งคำขอไป Marcus-EV ผ่าน OpenClaw sessions_send API
    // (ตอนนี้ยังไม่มี Gateway URL setup ใน production)
    
    // For now: บันทึก request และตอบกลับทันที
    console.log('NEV Data Enrichment Request:', {
      variantId,
      variantName,
      brand,
      model,
    });

    const message = `🔍 **NEV Data Enrichment Request**

รถ: ${brand} ${model} (${variantName})
Variant ID: ${variantId}

กรุณาค้นหาข้อมูลรถยนต์นี้จากเว็บไซต์อย่างเป็นทางการและอัปเดตลง NEV Database:

**ข้อมูลที่ต้องค้นหา:**
1. กำลังไฟฟ้า (kW)
2. แรงม้า (hp)
3. แรงบิด (Nm)
4. แบตเตอรี่ (kWh)
5. ชนิดแบตเตอรี่ (NMC/LFP/NCM)
6. ระยะทาง (km + มาตรฐาน WLTP/NEDC/CLTC)
7. 0-100 km/h (วินาที)
8. ความเร็วสูงสุด (km/h)
9. ระบบขับเคลื่อน (AWD/FWD/RWD)
10. การชาร์จ DC (kW + เวลา 10-80%)
11. การชาร์จ AC (kW)
12. V2L (รองรับ/ไม่รองรับ + กำลังไฟ kW)
13. การรับประกัน (แบต + รถ)
14. ฟีเจอร์ความปลอดภัย (AEB, LDW, BSM, ACC, etc.)
15. มิติรถ (ความยาว/กว้าง/สูง/ฐานล้อ mm)
16. น้ำหนัก (kg)

**แหล่งข้อมูล:**
- เว็บไซต์ ${brand} อย่างเป็นทางการ
- Press Release
- Spec Sheet / Brochure

**หลังค้นหาเสร็จ:**
1. อัปเดตข้อมูลลง \`NevVariant\` table (variantId: ${variantId})
2. ตอบกลับพร้อมข้อมูลที่อัปเดต (JSON format)

ใช้ Gemini + web search ในการค้นหาครับ`;

    // Return success immediately
    // TODO: Integrate with OpenClaw sessions_send API when Gateway is available
    return NextResponse.json({
      success: true,
      message: `📝 บันทึกคำขอสำหรับ ${brand} ${variantName} แล้ว — Marcus-EV จะประมวลผลในภายหลัง`,
      request: {
        variantId,
        variantName,
        brand,
        model,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Enrich request failed:', error);
    return NextResponse.json(
      { error: 'Failed to send enrichment request' },
      { status: 500 }
    );
  }
}
