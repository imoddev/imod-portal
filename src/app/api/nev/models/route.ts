import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/nev/models
 * ดึงรายการรถ NEV (รองรับ filter)
 * Query params:
 * - brandId: Filter by brand
 * - powertrain: BEV, PHEV, HEV, etc.
 * - bodyType: Sedan, SUV, MPV, etc.
 * - priceMin, priceMax: Price range
 * - search: Search in name
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const brandId = searchParams.get('brandId');
    const powertrain = searchParams.get('powertrain');
    const bodyType = searchParams.get('bodyType');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const search = searchParams.get('search');

    const where: any = {
      isActive: true,
    };

    if (brandId) {
      where.brandId = brandId;
    }

    if (powertrain) {
      where.powertrain = powertrain;
    }

    if (bodyType) {
      where.bodyType = bodyType;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameTh: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const models = await prisma.nevModel.findMany({
      where,
      include: {
        brand: true,
        variants: {
          where: { isActive: true },
          orderBy: { priceBaht: 'asc' },
        },
      },
      orderBy: [
        { isNewModel: 'desc' },
        { name: 'asc' },
      ],
    });

    // Filter by price if specified (check variants)
    let filteredModels = models;
    if (priceMin || priceMax) {
      filteredModels = models.filter((model) => {
        const prices = model.variants
          .map((v) => v.priceBaht)
          .filter((p): p is number => p !== null);
        
        if (prices.length === 0) return false;
        
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        if (priceMin && maxPrice < parseInt(priceMin)) return false;
        if (priceMax && minPrice > parseInt(priceMax)) return false;
        
        return true;
      });
    }

    return NextResponse.json(filteredModels);
  } catch (error) {
    console.error('Error fetching NEV models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/nev/models
 * เพิ่มรุ่นรถใหม่ (Admin only)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      brandId,
      name,
      nameTh,
      slug,
      year,
      bodyType,
      powertrain,
      ...rest
    } = body;

    if (!brandId || !name || !slug || !powertrain) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const model = await prisma.nevModel.create({
      data: {
        brandId,
        name,
        nameTh,
        slug,
        year,
        bodyType,
        powertrain,
        ...rest,
      },
      include: {
        brand: true,
      },
    });

    return NextResponse.json(model);
  } catch (error) {
    console.error('Error creating NEV model:', error);
    return NextResponse.json(
      { error: 'Failed to create model' },
      { status: 500 }
    );
  }
}
