import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/nev-audit';

// GET - Get single variant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const variant = await prisma.nevVariant.findUnique({
      where: { id },
      include: {
        model: {
          include: {
            brand: {
              select: { name: true },
            },
          },
        },
      },
    });

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

// PUT - Update variant
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

    // Update variant
    const variant = await prisma.nevVariant.update({
      where: { id },
      data: {
        name: body.name,
        priceBaht: body.priceBaht,
        batteryKwh: body.batteryKwh,
        rangeKm: body.rangeKm,
        motorHp: body.motorHp,
        torqueNm: body.torqueNm,
        accel0100: body.accel0100,
        topSpeedKmh: body.topSpeedKmh,
        drivetrain: body.drivetrain,
        dcChargeKw: body.dcChargeKw,
        dcChargeMin: body.dcChargeMin,
        lengthMm: body.lengthMm,
        widthMm: body.widthMm,
        heightMm: body.heightMm,
        wheelbaseMm: body.wheelbaseMm,
        curbWeightKg: body.curbWeightKg,
      },
    });

    // Audit log
    await createAuditLog({
      action: 'UPDATE',
      targetType: 'VARIANT',
      targetId: variant.id,
      targetName: variant.fullName,
      userName: 'Admin',
      changes: { before: existing, after: variant },
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
