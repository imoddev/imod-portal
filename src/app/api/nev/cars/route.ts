import { NextResponse } from 'next/server';
import { getAllEVCars } from '@/lib/nev-api';

export async function GET() {
  try {
    const cars = await getAllEVCars();
    return NextResponse.json(cars);
  } catch (error) {
    console.error('Error fetching EV cars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch EV cars' },
      { status: 500 }
    );
  }
}
