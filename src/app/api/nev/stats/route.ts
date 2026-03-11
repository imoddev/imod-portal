import { NextResponse } from 'next/server';
import { mockModels, mockVariants, getVariantsByModel, getBrandById, getStats } from '@/lib/nev-mock-data';

export async function GET() {
  const stats = getStats();
  
  // Get latest models (first 6)
  const latestModels = mockModels.slice(0, 6).map(model => {
    const brand = getBrandById(model.brandId);
    const variants = getVariantsByModel(model.id);
    
    return {
      ...model,
      brand: brand ? { name: brand.name, slug: brand.slug } : null,
      variants: variants.map(v => ({
        priceBaht: v.priceBaht,
        batteryKwh: v.batteryKwh,
        rangeKm: v.rangeKm,
        motorHp: v.motorHp,
      })),
    };
  });

  // Powertrain breakdown
  const powertrainBreakdown = {
    BEV: mockModels.filter(m => m.powertrain === 'BEV').length,
    PHEV: mockModels.filter(m => m.powertrain === 'PHEV').length,
    HEV: mockModels.filter(m => m.powertrain === 'HEV').length,
  };

  // Price range
  const prices = mockVariants
    .map(v => v.priceBaht)
    .filter((p): p is number => p !== null);
  
  const priceRange = prices.length > 0 
    ? { min: Math.min(...prices), max: Math.max(...prices) }
    : null;

  // Average range
  const ranges = mockVariants
    .map(v => v.rangeKm)
    .filter((r): r is number => r !== null);
  
  const avgRange = ranges.length > 0
    ? Math.round(ranges.reduce((a, b) => a + b, 0) / ranges.length)
    : null;
  
  return NextResponse.json({
    ...stats,
    latestModels,
    powertrainBreakdown,
    priceRange,
    avgRange,
    lastUpdated: new Date().toISOString(),
  });
}
