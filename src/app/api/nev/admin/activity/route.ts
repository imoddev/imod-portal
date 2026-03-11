import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get recent audit logs (imports + edits)
    const logs = await prisma.nevAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        action: true,
        targetType: true,
        targetId: true,
        targetName: true,
        userName: true,
        createdAt: true,
        changes: true,
      },
    });

    const activities = logs.map(log => {
      let description = '';
      let link = null;

      if (log.action === 'IMPORT') {
        description = `${log.userName} อัปโหลดข้อมูลรถใหม่`;
        
        // Try to extract variant info from changes
        const changes = log.changes as any;
        if (changes?.created) {
          const variant = changes.created;
          description += ` (${variant.fullName || log.targetName})`;
          link = `/nev/admin/variants/${variant.id}`;
        }
      } else if (log.action === 'UPDATE') {
        description = `${log.userName} แก้ไขข้อมูล ${log.targetName}`;
        link = `/nev/admin/variants/${log.targetId}`;
      } else if (log.action === 'CREATE') {
        description = `${log.userName} เพิ่ม ${log.targetType.toLowerCase()} ใหม่: ${log.targetName}`;
        if (log.targetType === 'VARIANT') {
          link = `/nev/admin/variants/${log.targetId}`;
        }
      } else if (log.action === 'DELETE') {
        description = `${log.userName} ลบ ${log.targetType.toLowerCase()}: ${log.targetName}`;
      }

      return {
        id: log.id,
        action: log.action,
        description,
        userName: log.userName,
        createdAt: log.createdAt,
        link,
      };
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}
