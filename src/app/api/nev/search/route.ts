import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/nev/search
 * ค้นหารถ NEV แบบครอบคลุม
 * Query params:
 * - q: Search query
 * - brand: Brand slug
 * - powertrain: BEV, PHEV, HEV
 * - bodyType: Sedan, SUV, etc.
 * - priceMin, priceMax
 * - rangeMin (km)
 * - seats
 * - limit (default: 50)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const q = searchParams.get('q');
    const brandSlug = searchParams.get('brand');
    const powertrain = searchParams.get('powertrain');
    const bodyType = searchParams.get('bodyType');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const rangeMin = searchParams.get('rangeMin');
    const seats = searchParams.get('seats');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build model where clause
    const modelWhere: any = {
      isActive: true,
    };

    if (powertrain) {
      modelWhere.powertrain = powertrain;
    }

    if (bodyType) {
      modelWhere.bodyType = bodyType;
    }

    if (seats) {
      modelWhere.seats = parseInt(seats);
    }

    if (brandSlug) {
      modelWhere.brand = {
        slug: brandSlug,
      };
    }

    if (q) {
      modelWhere.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { nameTh: { contains: q, mode: 'insensitive' } },
        { fullName: { contains: q, mode: 'insensitive' } },
        { brand: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    // Build variant where clause
    const variantWhere: any = {
      isActive: true,
    };

    if (priceMin) {
      variantWhere.priceBaht = { gte: parseInt(priceMin) };
    }

    if (priceMax) {
      if (variantWhere.priceBaht) {
        variantWhere.priceBaht.lte = parseInt(priceMax);
      } else {
        variantWhere.priceBaht = { lte: parseInt(priceMax) };
      }
    }

    if (rangeMin) {
      variantWhere.rangeKm = { gte: parseInt(rangeMin) };
    }

    const models = await prisma.nevModel.findMany({
      where: modelWhere,
      include: {
        brand: true,
        variants: {
          where: variantWhere,
          orderBy: { priceBaht: 'asc' },
          take: 3, // Top 3 variants per model
        },
      },
      take: limit,
      orderBy: [
        { isNewModel: 'desc' },
        { name: 'asc' },
      ],
    });

    // Filter out models with no matching variants (if price/range filters applied)
    const filteredModels = models.filter(
      (model) => model.variants.length > 0 || (!priceMin && !priceMax && !rangeMin)
    );

    return NextResponse.json({
      results: filteredModels,
      total: filteredModels.length,
      filters: {
        q,
        brand: brandSlug,
        powertrain,
        bodyType,
        priceMin,
        priceMax,
        rangeMin,
        seats,
      },
    });
  } catch (error) {
    console.error('Error searching NEV models:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
