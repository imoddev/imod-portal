import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List all variants with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');
    const search = searchParams.get('search');
    const modelId = searchParams.get('modelId');

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { model: { name: { contains: search, mode: 'insensitive' } } },
        { model: { brand: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }
    if (modelId) where.modelId = modelId;

    const [variants, total] = await Promise.all([
      prisma.nevVariant.findMany({
        where,
        include: {
          model: {
            select: {
              name: true,
              brand: { select: { name: true } },
            },
          },
        },
        orderBy: [{ model: { brand: { name: 'asc' } } }, { model: { name: 'asc' } }, { name: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.nevVariant.count({ where }),
    ]);

    return NextResponse.json({
      variants,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching variants:', error);
    return NextResponse.json({ error: 'Failed to fetch variants' }, { status: 500 });
  }
}
