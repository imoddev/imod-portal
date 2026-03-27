import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Discord notification config
const DISCORD_THREAD_ID = '1487009409765736559';
const DISCORD_CHANNEL_ID = '1487009275883819199';

// API สำหรับขอให้ AI เพิ่มรถใหม่เข้าระบบ
export async function POST(request: NextRequest) {
  try {
    const { carName } = await request.json();

    if (!carName) {
      return NextResponse.json(
        { error: 'Missing car name' },
        { status: 400 }
      );
    }

    // Parse brand และ model จากชื่อ (simple version)
    const parts = carName.trim().split(' ');
    const brand = parts[0] || 'Unknown';
    const model = parts.slice(1).join(' ') || 'Unknown';

    // ตรวจสอบว่ามีรถนี้อยู่แล้วหรือไม่
    const existingCar = await prisma.nevModel.findFirst({
      where: {
        OR: [
          { name: { contains: model, mode: 'insensitive' } },
          { fullName: { contains: carName, mode: 'insensitive' } },
        ],
      },
      include: {
        brand: true,
      },
    });

    if (existingCar) {
      return NextResponse.json({
        success: false,
        message: `รถ ${existingCar.brand.name} ${existingCar.name} มีในระบบแล้ว`,
      });
    }

    // สร้าง enrichment request (ใช้ table เดียวกัน แต่ variantId = null)
    const addRequest = await prisma.nevEnrichmentRequest.create({
      data: {
        variantId: 'NEW_CAR',
        variantName: carName,
        brand: brand,
        model: model,
        status: 'pending',
        fieldsRequested: ['ALL'], // ค้นหาทุกอย่าง
        notifyThreadId: DISCORD_THREAD_ID,
        notifyChannelId: DISCORD_CHANNEL_ID,
      },
    });

    // Message สำหรับ Marcus-EV
    const message = `🆕 **เพิ่มรถใหม่เข้า NEV Database**

รถ: ${carName}
Brand: ${brand}
Model: ${model}
Request ID: \`${addRequest.id}\`

**ขั้นตอนที่ต้องทำ:**

1. ค้นหาข้อมูลรถจาก:
   - เว็บไซต์ ${brand} อย่างเป็นทางการ
   - Press Release
   - ข่าวรถยนต์ที่น่าเชื่อถือ

2. สร้าง Brand (ถ้ายังไม่มี):
   - name, nameTh, slug, country

3. สร้าง Model:
   - name, fullName, slug, year, bodyType, powertrain

4. สร้าง Variant พร้อมข้อมูลครบถ้วน:
   - ราคา, กำลัง, แบตเตอรี่, ระยะทาง
   - การชาร์จ, V2L, มิติรถ
   - ฟีเจอร์ความปลอดภัย

5. อัปเดต status → \`completed\`

6. แจ้ง Discord เมื่อเสร็จ

**ใช้ Gemini + web search + OCR Triple-Verification ครับ**`;

    // ส่งข้อความแจ้ง Discord
    try {
      await sendDiscordNotification({
        threadId: DISCORD_THREAD_ID,
        channelId: DISCORD_CHANNEL_ID,
        content: `🆕 **คำขอเพิ่มรถใหม่**\n\nรถ: ${carName}\nRequest ID: \`${addRequest.id}\`\nStatus: ⏳ รอดำเนินการ`,
      });
    } catch (error) {
      console.error('Failed to send Discord notification:', error);
    }

    return NextResponse.json({
      success: true,
      message: `บันทึกคำขอเพิ่ม ${carName} แล้ว`,
      requestId: addRequest.id,
    });
  } catch (error) {
    console.error('Add new car request failed:', error);
    return NextResponse.json(
      { error: 'Failed to send request' },
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
