import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditLogData {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT' | 'EXPORT';
  targetType: 'BRAND' | 'MODEL' | 'VARIANT';
  targetId: string;
  targetName?: string;
  userId?: string;
  userName?: string;
  changes?: any;
}

export async function createAuditLog(data: AuditLogData) {
  return prisma.nevAuditLog.create({
    data: {
      action: data.action,
      targetType: data.targetType,
      targetId: data.targetId,
      targetName: data.targetName,
      userId: data.userId,
      userName: data.userName,
      changes: data.changes ? JSON.stringify(data.changes) : null,
    },
  });
}

export interface AuditLogOptions {
  targetType?: string;
  targetId?: string;
  action?: string;
  limit?: number;
  offset?: number;
}

export async function getAuditLogs(options: AuditLogOptions = {}) {
  const where: any = {};
  
  if (options?.targetType) where.targetType = options.targetType;
  if (options?.targetId) where.targetId = options.targetId;
  if (options?.action) where.action = options.action;

  return prisma.nevAuditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
  });
}
