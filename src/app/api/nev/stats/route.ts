import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/nev/stats
 * ดึงสถิติภาพรวมของ NEV Database
 */
export async function GET() {
  try {
    const [
      totalBrands,
      totalModels,
      totalVariants,
      bevCount,
      phevCount,
      hevCount,
      latestModels,
    ] = await Promise.all([
      prisma.nevBrand.count({ where: { isActive: true } }),
      prisma.nevModel.count({ where: { isActive: true } }),
      prisma.nevVariant.count({ where: { isActive: true } }),
      prisma.nevModel.count({
        where: { powertrain: 'BEV', isActive: true },
      }),
      prisma.nevModel.count({
        where: { powertrain: 'PHEV', isActive: true },
      }),
      prisma.nevModel.count({
        where: { powertrain: 'HEV', isActive: true },
      }),
      prisma.nevModel.findMany({
        where: { isActive: true },
        include: {
          brand: true,
          variants: {
            where: { isActive: true },
            orderBy: { priceBaht: 'asc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Get price range
    const variants = await prisma.nevVariant.findMany({
      where: {
        isActive: true,
        priceBaht: { not: null },
      },
      select: { priceBaht: true },
      orderBy: { priceBaht: 'asc' },
    });

    const prices = variants
      .map((v) => v.priceBaht)
      .filter((p): p is number => p !== null);

    const priceRange = prices.length > 0
      ? {
          min: Math.min(...prices),
          max: Math.max(...prices),
        }
      : null;

    // Get average range by powertrain
    const avgRanges = await prisma.nevVariant.groupBy({
      by: ['modelId'],
      _avg: {
        rangeKm: true,
      },
      where: {
        isActive: true,
        rangeKm: { not: null },
      },
    });

    const avgRange = avgRanges.length > 0
      ? Math.round(
          avgRanges.reduce((sum, v) => sum + (v._avg.rangeKm || 0), 0) /
            avgRanges.length
        )
      : null;

    return NextResponse.json({
      totalBrands,
      totalModels,
      totalVariants,
      powertrainBreakdown: {
        BEV: bevCount,
        PHEV: phevCount,
        HEV: hevCount,
      },
      priceRange,
      avgRange,
      latestModels: latestModels.map((model) => ({
        id: model.id,
        name: model.name,
        nameTh: model.nameTh,
        brand: model.brand.name,
        powertrain: model.powertrain,
        imageUrl: model.imageUrl,
        slug: model.slug,
        startingPrice: model.variants[0]?.priceBaht,
      })),
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching NEV stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
