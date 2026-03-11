import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ACTIVITY_FILE = '/Users/imodteam/Desktop/NEV-Database/Upload/activity.json';

export async function GET(request: NextRequest) {
  try {
    // Check if file exists
    if (!fs.existsSync(ACTIVITY_FILE)) {
      return NextResponse.json({ activities: [] });
    }
    
    // Read activity log
    const data = fs.readFileSync(ACTIVITY_FILE, 'utf8');
    const activities = JSON.parse(data);
    
    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // Optional filter
    
    let filtered = activities;
    
    // Filter by type if provided
    if (type) {
      filtered = activities.filter((a: any) => a.type === type);
    }
    
    // Limit results
    filtered = filtered.slice(0, limit);
    
    return NextResponse.json({
      success: true,
      activities: filtered,
      total: activities.length,
      filtered: filtered.length,
    });
  } catch (error: any) {
    console.error('[Activity API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to read activity log', details: error.message },
      { status: 500 }
    );
  }
}
