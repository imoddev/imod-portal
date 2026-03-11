import { NextResponse } from 'next/server';
import { mockModels, getVariantsByModel, getBrandById, getStats } from '@/lib/nev-mock-data';

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
  
  return NextResponse.json({
    ...stats,
    latestModels,
  });
}
