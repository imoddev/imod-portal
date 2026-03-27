import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Discord notification config
const DISCORD_THREAD_ID = '1487009409765736559';
const DISCORD_CHANNEL_ID = '1487009275883819199';
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1487030874749931570/xHvPQ1OQDB6VncXBJgvWSgFdsHZm4GnsvNtghFDDAK7K65JH2jlB1YJt3VUtYM-dLrwI';

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

    // ส่งข้อความแจ้ง Discord ว่ามี request ใหม่
    let notificationSent = false;
    try {
      await sendDiscordNotification({
        threadId: DISCORD_THREAD_ID,
        content: `🔍 **NEV Data Enrichment Request**

รถ: ${brand} ${model}
Variant: ${variantName}
Request ID: \`${enrichmentRequest.id}\`
Status: ⏳ รอดำเนินการ

**แหล่งข้อมูล:**
- เว็บไซต์ ${brand} อย่างเป็นทางการ
- Press Release / Spec Sheet

**Variant ID:** \`${variantId}\``,
      });
      notificationSent = true;
      console.log(`✅ Discord notification sent (Request ID: ${enrichmentRequest.id})`);
    } catch (error: any) {
      console.error('❌ Failed to send Discord notification:', error);
      console.error('Error details:', error.message);
    }

    return NextResponse.json({
      success: true,
      message: `📝 บันทึกคำขอสำหรับ ${brand} ${variantName} แล้ว\n\nRequest ID: ${enrichmentRequest.id}\n\n${notificationSent ? '✅ แจ้ง Discord แล้ว' : '⚠️ แจ้ง Discord ล้มเหลว (ตรวจสอบ console)'}`,
      requestId: enrichmentRequest.id,
      notificationSent,
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

// Helper: Send Discord notification via Webhook
async function sendDiscordNotification({
  threadId,
  content,
}: {
  threadId: string;
  content: string;
}) {
  try {
    const response = await fetch(`${DISCORD_WEBHOOK_URL}?thread_id=${threadId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Discord webhook failed: ${response.status} ${errorText}`);
    }
    
    console.log(`✅ Discord notification sent via webhook (thread: ${threadId})`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Discord webhook error:', error.message);
    throw error;
  }
}
