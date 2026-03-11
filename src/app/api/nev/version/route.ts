import { NextResponse } from 'next/server';

// Version info (hardcoded for Vercel compatibility)
const NEV_VERSION = '2.0.0';
const NEV_RELEASE_DATE = '2026-03-12';

export async function GET() {
  return NextResponse.json({
    version: NEV_VERSION,
    latest: {
      version: NEV_VERSION,
      date: NEV_RELEASE_DATE,
      changes: 'Schema V2.0 with 11 extended spec categories',
    },
    updatedAt: new Date().toISOString(),
  });
}
