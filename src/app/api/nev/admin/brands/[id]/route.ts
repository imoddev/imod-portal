import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/nev-audit';

// GET - Get single brand
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brand = await prisma.nevBrand.findUnique({
      where: { id: params.id },
      include: {
        models: {
          include: {
            _count: { select: { variants: true } },
          },
        },
      },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brand' },
      { status: 500 }
    );
  }
}

// PUT - Update brand
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, nameTh, logoUrl, country, website } = body;

    const existing = await prisma.nevBrand.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    const brand = await prisma.nevBrand.update({
      where: { id: params.id },
      data: {
        name,
        nameTh,
        slug: name ? slugify(name) : existing.slug,
        logoUrl,
        country,
        website,
      },
    });

    // Audit log
    await createAuditLog({
      action: 'UPDATE',
      entityType: 'BRAND',
      entityId: brand.id,
      userName: 'Admin',
      changes: { before: existing, after: brand },
    });

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json(
      { error: 'Failed to update brand' },
      { status: 500 }
    );
  }
}

// DELETE - Delete brand
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.nevBrand.findUnique({
      where: { id: params.id },
      include: { _count: { select: { models: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    if (existing._count.models > 0) {
      return NextResponse.json(
        { error: 'Cannot delete brand with existing models' },
        { status: 400 }
      );
    }

    await prisma.nevBrand.delete({
      where: { id: params.id },
    });

    // Audit log
    await createAuditLog({
      action: 'DELETE',
      entityType: 'BRAND',
      entityId: params.id,
      userName: 'Admin',
      changes: existing,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json(
      { error: 'Failed to delete brand' },
      { status: 500 }
    );
  }
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
