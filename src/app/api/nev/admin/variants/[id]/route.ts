import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/nev-audit';

// GET - Get single variant with all 11 categories (supports both id and slug)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Try to find by id first, then by slug
    let variant = await prisma.nevVariant.findUnique({
      where: { id },
      include: {
        model: {
          include: {
            brand: {
              select: { name: true, slug: true },
            },
          },
        },
        multimedia: true,
        safety: true,
        interior: true,
        exterior: true,
        powertrain: true,
        battery: true,
        evFeatures: true,
        suspension: true,
        brakes: true,
        wheels: true,
        dimensions: true,
      },
    });
    
    // If not found by id, try by slug
    if (!variant) {
      variant = await prisma.nevVariant.findUnique({
        where: { slug: id },
        include: {
          model: {
            include: {
              brand: {
                select: { name: true, slug: true },
              },
            },
          },
          multimedia: true,
          safety: true,
          interior: true,
          exterior: true,
          powertrain: true,
          battery: true,
          evFeatures: true,
          suspension: true,
          brakes: true,
          wheels: true,
          dimensions: true,
        },
      });
    }

    if (!variant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    return NextResponse.json(variant);
  } catch (error) {
    console.error('Error fetching variant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variant' },
      { status: 500 }
    );
  }
}

// PUT - Update variant with all 11 categories
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.nevVariant.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    // Update variant basic info
    const variant = await prisma.nevVariant.update({
      where: { id },
      data: {
        name: body.name,
        priceBaht: body.priceBaht,
        priceNote: body.priceNote,
        batteryKwh: body.batteryKwh,
        rangeKm: body.rangeKm,
        rangeStandard: body.rangeStandard,
        motorKw: body.motorKw,
        motorHp: body.motorHp,
        torqueNm: body.torqueNm,
        accel0100: body.accel0100,
        topSpeedKmh: body.topSpeedKmh,
        drivetrain: body.drivetrain,
        dcChargeKw: body.dcChargeKw,
        dcChargeMin: body.dcChargeMin,
        imageUrl: body.imageUrl,
        // External Links
        externalLinks: body.externalLinks ?? undefined,
      },
    });

    // Update 11 categories (upsert)
    if (body.powertrain) {
      await prisma.nevPowertrain.upsert({
        where: { variantId: id },
        update: body.powertrain,
        create: { variantId: id, ...body.powertrain },
      });
    }

    if (body.battery) {
      await prisma.nevBatteryDetails.upsert({
        where: { variantId: id },
        update: body.battery,
        create: { variantId: id, ...body.battery },
      });
    }

    if (body.evFeatures) {
      await prisma.nevEVFeatures.upsert({
        where: { variantId: id },
        update: body.evFeatures,
        create: { variantId: id, ...body.evFeatures },
      });
    }

    if (body.dimensions) {
      await prisma.nevDimensions.upsert({
        where: { variantId: id },
        update: body.dimensions,
        create: { variantId: id, ...body.dimensions },
      });
    }

    if (body.suspension) {
      await prisma.nevSuspension.upsert({
        where: { variantId: id },
        update: body.suspension,
        create: { variantId: id, ...body.suspension },
      });
    }

    if (body.brakes) {
      await prisma.nevBrakeSystem.upsert({
        where: { variantId: id },
        update: body.brakes,
        create: { variantId: id, ...body.brakes },
      });
    }

    if (body.wheels) {
      await prisma.nevWheelsTires.upsert({
        where: { variantId: id },
        update: body.wheels,
        create: { variantId: id, ...body.wheels },
      });
    }

    if (body.safety) {
      await prisma.nevSafety.upsert({
        where: { variantId: id },
        update: body.safety,
        create: { variantId: id, ...body.safety },
      });
    }

    if (body.multimedia) {
      await prisma.nevMultimedia.upsert({
        where: { variantId: id },
        update: body.multimedia,
        create: { variantId: id, ...body.multimedia },
      });
    }

    if (body.interior) {
      await prisma.nevInterior.upsert({
        where: { variantId: id },
        update: body.interior,
        create: { variantId: id, ...body.interior },
      });
    }

    if (body.exterior) {
      await prisma.nevExterior.upsert({
        where: { variantId: id },
        update: body.exterior,
        create: { variantId: id, ...body.exterior },
      });
    }

    // Audit log
    await createAuditLog({
      action: 'UPDATE',
      targetType: 'VARIANT',
      targetId: variant.id,
      targetName: variant.fullName,
      userName: 'Admin',
      changes: { before: existing, after: body },
    });

    return NextResponse.json(variant);
  } catch (error) {
    console.error('Error updating variant:', error);
    return NextResponse.json(
      { error: 'Failed to update variant' },
      { status: 500 }
    );
  }
}

// DELETE - Delete variant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.nevVariant.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    await prisma.nevVariant.delete({
      where: { id },
    });

    // Audit log
    await createAuditLog({
      action: 'DELETE',
      targetType: 'VARIANT',
      targetId: id,
      targetName: existing.fullName,
      userName: 'Admin',
      changes: existing,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting variant:', error);
    return NextResponse.json(
      { error: 'Failed to delete variant' },
      { status: 500 }
    );
  }
}
