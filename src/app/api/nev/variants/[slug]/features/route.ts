import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper: Get variant ID from slug
async function getVariantId(slug: string): Promise<string | null> {
  const result = await prisma.$queryRaw`
    SELECT id FROM "NevVariant" WHERE slug = ${slug} LIMIT 1
  ` as any[];
  return result[0]?.id || null;
}

// GET /api/nev/variants/[slug]/features - รายการ Features ของ Variant นี้
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const variantId = await getVariantId(slug);
    if (!variantId) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    // ดึง features ที่ variant นี้มี
    const variantFeatures = await prisma.$queryRaw`
      SELECT 
        vf."featureId",
        vf.value,
        vf.note
      FROM "NevVariantFeature" vf
      WHERE vf."variantId" = ${variantId}
    ` as any[];

    // สร้าง map ของ feature IDs ที่มี
    const featureMap = new Map(
      variantFeatures.map((vf: any) => [vf.featureId, { value: vf.value, note: vf.note }])
    );

    return NextResponse.json({
      variantId,
      slug,
      features: Object.fromEntries(featureMap),
      featureIds: Array.from(featureMap.keys()),
    });
  } catch (error) {
    console.error('Error fetching variant features:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variant features' },
      { status: 500 }
    );
  }
}

// PUT /api/nev/variants/[slug]/features - อัปเดต Features ของ Variant
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const variantId = await getVariantId(slug);
    if (!variantId) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    const body = await request.json();
    const { features } = body; // { featureId: { checked: boolean, value?: string, note?: string } }

    if (!features || typeof features !== 'object') {
      return NextResponse.json(
        { error: 'features object is required' },
        { status: 400 }
      );
    }

    // ลบ features เดิมทั้งหมด
    await prisma.$executeRaw`
      DELETE FROM "NevVariantFeature" WHERE "variantId" = ${variantId}
    `;

    // เพิ่ม features ที่เลือก
    let addedCount = 0;
    for (const [featureId, data] of Object.entries(features)) {
      const featureData = data as { checked?: boolean; value?: string; note?: string };
      
      if (featureData.checked) {
        const id = 'c' + Math.random().toString(36).substring(2, 15);
        await prisma.$executeRaw`
          INSERT INTO "NevVariantFeature" ("id", "variantId", "featureId", "value", "note")
          VALUES (${id}, ${variantId}, ${featureId}, ${featureData.value || null}, ${featureData.note || null})
        `;
        addedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      variantId,
      slug,
      featuresAdded: addedCount,
    });
  } catch (error: any) {
    console.error('Error updating variant features:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update variant features' },
      { status: 500 }
    );
  }
}
