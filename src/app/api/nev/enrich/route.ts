import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Discord notification config
const DISCORD_THREAD_ID = '1487009409765736559';
const DISCORD_CHANNEL_ID = '1487009275883819199';

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

    // ตรวจสอบว่ามี request ค้างอยู่หรือไม่
    const existingRequest = await prisma.nevEnrichmentRequest.findFirst({
      where: {
        variantId,
        status: { in: ['pending', 'processing'] },
      },
    });

    if (existingRequest) {
      return NextResponse.json({
        success: false,
        message: `มีคำขอสำหรับ ${variantName} อยู่แล้ว — กำลังประมวลผล...`,
      });
    }

    // สร้าง request ใหม่
    const enrichmentRequest = await prisma.nevEnrichmentRequest.create({
      data: {
        variantId,
        variantName,
        brand,
        model,
        status: 'pending',
        fieldsRequested: [
          'power', 'horsepower', 'torque',
          'battery', 'batteryType', 'range',
          'acceleration', 'topSpeed', 'drivetrain',
          'chargingDC', 'chargingAC', 'v2l',
          'warranty', 'safety',
          'length', 'width', 'height', 'wheelbase', 'weight',
          'seats', 'trunk',
        ],
        notifyThreadId: DISCORD_THREAD_ID,
        notifyChannelId: DISCORD_CHANNEL_ID,
      },
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

    // ส่งข้อความแจ้ง Discord ว่ามี request ใหม่
    try {
      await sendDiscordNotification({
        threadId: DISCORD_THREAD_ID,
        channelId: DISCORD_CHANNEL_ID,
        content: `🔍 **NEV Data Enrichment Request**\n\nรถ: ${brand} ${model}\nVariant: ${variantName}\nRequest ID: \`${enrichmentRequest.id}\`\nStatus: ⏳ รอดำเนินการ`,
      });
    } catch (error) {
      console.error('Failed to send Discord notification:', error);
    }

    return NextResponse.json({
      success: true,
      message: `📝 บันทึกคำขอสำหรับ ${brand} ${variantName} แล้ว\n\nRequest ID: ${enrichmentRequest.id}\n\nระบบจะแจ้งเตือนผ่าน Discord เมื่อเสร็จสิ้น`,
      requestId: enrichmentRequest.id,
    });
  } catch (error: any) {
    console.error('Enrich request failed:', error);
    
    // แสดง error ที่ชัดเจน
    const errorMessage = error.message || error.toString() || 'Failed to send enrichment request';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Helper: Send Discord notification
async function sendDiscordNotification({
  threadId,
  channelId,
  content,
}: {
  threadId: string;
  channelId: string;
  content: string;
}) {
  const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
  
  const response = await fetch(`${GATEWAY_URL}/api/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'send',
      channel: 'discord',
      target: channelId,
      message: content,
      threadId: threadId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send Discord notification');
  }

  return response.json();
}
