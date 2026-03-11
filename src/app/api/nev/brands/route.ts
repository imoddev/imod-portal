import { NextResponse } from 'next/server';
import { mockBrands, mockModels, getVariantsByModel } from '@/lib/nev-mock-data';

export async function GET() {
  const brandsWithCount = mockBrands.map(brand => ({
    ...brand,
    _count: {
      models: mockModels.filter(m => m.brandId === brand.id).length,
    },
  }));
  
  return NextResponse.json(brandsWithCount);
}
