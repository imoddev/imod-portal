import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const model = await prisma.nevModel.findUnique({
      where: { slug },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            nameTh: true,
            slug: true,
          },
        },
        variants: {
          where: { isActive: true },
          orderBy: { priceBaht: 'asc' },
        },
      },
    });

    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    // Parse features JSON for each variant
    const modelWithParsedFeatures = {
      ...model,
      variants: model.variants.map(v => ({
        ...v,
        features: v.features ? JSON.parse(v.features) : null,
      })),
    };

    return NextResponse.json(modelWithParsedFeatures);
  } catch (error) {
    console.error('Error fetching model:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model' },
      { status: 500 }
    );
  }
}
