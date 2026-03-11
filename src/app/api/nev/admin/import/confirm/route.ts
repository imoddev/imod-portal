import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/nev-audit';

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

export async function POST(request: NextRequest) {
  try {
    const preview = await request.json();
    const specs = preview.data?.specs;
    
    if (!specs || !specs.brand || !specs.model) {
      return NextResponse.json({ error: 'Invalid data: brand and model required' }, { status: 400 });
    }

    // Find or create brand
    let brand = await prisma.nevBrand.findFirst({
      where: { slug: slugify(specs.brand) },
    });

    if (!brand) {
      brand = await prisma.nevBrand.create({
        data: {
          name: specs.brand,
          slug: slugify(specs.brand),
        },
      });
    }

    // Find or create model
    let model = await prisma.nevModel.findFirst({
      where: {
        brandId: brand.id,
        slug: slugify(`${specs.brand}-${specs.model}`),
      },
    });

    if (!model) {
      model = await prisma.nevModel.create({
        data: {
          brandId: brand.id,
          name: specs.model,
          slug: slugify(`${specs.brand}-${specs.model}`),
          fullName: `${specs.brand} ${specs.model}`,
          powertrain: 'BEV', // Default
          year: new Date().getFullYear(),
        },
      });
    }

    // Create variant
    const variant = await prisma.nevVariant.create({
      data: {
        modelId: model.id,
        name: specs.variant || 'Standard',
        fullName: `${specs.brand} ${specs.model} ${specs.variant || 'Standard'}`,
        slug: slugify(`${specs.brand}-${specs.model}-${specs.variant || 'standard'}`),
        priceBaht: specs.priceBaht,
        batteryKwh: specs.batteryKwh,
        rangeKm: specs.rangeKm,
        motorHp: specs.motorHp,
        torqueNm: specs.torqueNm,
        accel0100: specs.accel0100,
        topSpeedKmh: specs.topSpeedKmh,
        drivetrain: specs.drivetrain,
        dcChargeKw: specs.dcChargeKw,
        dcChargeMin: specs.dcChargeMin,
        lengthMm: specs.lengthMm,
        widthMm: specs.widthMm,
        heightMm: specs.heightMm,
        wheelbaseMm: specs.wheelbaseMm,
        curbWeightKg: specs.curbWeightKg,
        dataSource: `import-${preview.source}`,
      },
    });

    // Audit log
    await createAuditLog({
      action: 'IMPORT',
      targetType: 'VARIANT',
      targetId: variant.id,
      targetName: variant.fullName,
      userName: 'Admin',
      changes: { preview, created: variant },
    });

    return NextResponse.json({
      success: true,
      variant,
      message: 'Import successful',
    });
  } catch (error) {
    console.error('Error confirming import:', error);
    return NextResponse.json(
      { error: 'Failed to confirm import' },
      { status: 500 }
    );
  }
}
