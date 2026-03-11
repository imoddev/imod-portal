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

    // Get all variants for calculations
    const variants = await prisma.nevVariant.findMany({
      select: {
        priceBaht: true,
        rangeKm: true,
        powertrain: true,
      },
    });

    // Powertrain breakdown
    const powertrainBreakdown = {
      BEV: variants.filter(v => v.powertrain === 'BEV').length,
      PHEV: variants.filter(v => v.powertrain === 'PHEV').length,
      HEV: variants.filter(v => v.powertrain === 'HEV').length,
    };

    // Price range
    const prices = variants
      .map(v => v.priceBaht)
      .filter((p): p is number => p !== null);
    
    const priceRange = prices.length > 0 
      ? { min: Math.min(...prices), max: Math.max(...prices) }
      : null;

    // Average range
    const ranges = variants
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

    return NextResponse.json({
      totalBrands,
      totalModels,
      totalVariants,
      powertrainBreakdown,
      priceRange,
      avgRange,
      latestModels,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
