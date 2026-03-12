import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get single model (supports both id and slug) with variants and full specs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Try to find by id first, then by slug
    let model = await prisma.nevModel.findUnique({
      where: { id },
      include: {
        brand: {
          select: { id: true, name: true, slug: true },
        },
        variants: {
          include: {
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
          orderBy: {
            priceBaht: 'asc',
          },
        },
      },
    });
    
    // If not found by id, try by slug
    if (!model) {
      model = await prisma.nevModel.findUnique({
        where: { slug: id },
        include: {
          brand: {
            select: { id: true, name: true, slug: true },
          },
          variants: {
            include: {
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
            orderBy: {
              priceBaht: 'asc',
            },
          },
        },
      });
    }

    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    return NextResponse.json(model);
  } catch (error) {
    console.error('Error fetching model:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model' },
      { status: 500 }
    );
  }
}

// PUT - Update model
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.nevModel.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    const updated = await prisma.nevModel.update({
      where: { id },
      data: {
        name: body.name,
        nameTh: body.nameTh,
        fullName: body.fullName,
        year: body.year,
        bodyType: body.bodyType,
        segment: body.segment,
        seats: body.seats,
        powertrain: body.powertrain,
        assembly: body.assembly,
        madeIn: body.madeIn,
        imageUrl: body.imageUrl,
        overview: body.overview,
        isActive: body.isActive,
        isNewModel: body.isNewModel,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating model:', error);
    return NextResponse.json(
      { error: 'Failed to update model' },
      { status: 500 }
    );
  }
}
