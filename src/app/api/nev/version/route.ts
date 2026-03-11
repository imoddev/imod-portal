import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const versionPath = join(process.cwd(), 'NEV_VERSION.txt');
    const changelogPath = join(process.cwd(), 'NEV_CHANGELOG.md');
    
    const version = readFileSync(versionPath, 'utf-8').trim();
    const changelog = readFileSync(changelogPath, 'utf-8');
    
    // Extract latest version changes
    const latestMatch = changelog.match(/## \[([\d.]+)\] - ([\d-]+.*?)\n\n([\s\S]*?)(?=\n##|\n---)/);
    const latestChanges = latestMatch ? {
      version: latestMatch[1],
      date: latestMatch[2],
      changes: latestMatch[3].trim(),
    } : null;

    return NextResponse.json({
      version,
      latest: latestChanges,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error reading version:', error);
    return NextResponse.json(
      { error: 'Failed to read version' },
      { status: 500 }
    );
  }
}
