import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get counts
    const [totalBrands, totalModels, totalVariants] = await Promise.all([
      prisma.nevBrand.count(),
      prisma.nevModel.count(),
      prisma.nevVariant.count(),
    ]);

    // Get all models with powertrain info
    const models = await prisma.nevModel.findMany({
      select: {
        powertrain: true,
        variants: {
          select: {
            priceBaht: true,
            rangeKm: true,
          },
        },
      },
    });

    // Powertrain breakdown (from models)
    const powertrainBreakdown = {
      BEV: models.filter(m => m.powertrain === 'BEV').length,
      PHEV: models.filter(m => m.powertrain === 'PHEV').length,
      HEV: models.filter(m => m.powertrain === 'HEV').length,
    };

    // Collect all variants from all models
    const allVariants = models.flatMap(m => m.variants);

    // Price range
    const prices = allVariants
      .map(v => v.priceBaht)
      .filter((p): p is number => p !== null);
    
    const priceRange = prices.length > 0 
      ? { min: Math.min(...prices), max: Math.max(...prices) }
      : null;

    // Average range
    const ranges = allVariants
      .map(v => v.rangeKm)
      .filter((r): r is number => r !== null);
    
    const avgRange = ranges.length > 0
      ? Math.round(ranges.reduce((a, b) => a + b, 0) / ranges.length)
      : null;

    // Get latest models with brand and variants
    const latestModels = await prisma.nevModel.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        brand: {
          select: { name: true, slug: true },
        },
        variants: {
          select: {
            priceBaht: true,
            batteryKwh: true,
            rangeKm: true,
            motorHp: true,
          },
        },
      },
    });

    const response = NextResponse.json({
      totalBrands,
      totalModels,
      totalVariants,
      powertrainBreakdown,
      priceRange,
      avgRange,
      latestModels,
      lastUpdated: new Date().toISOString(),
    });
    
    // Cache for 5 minutes
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return response;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
