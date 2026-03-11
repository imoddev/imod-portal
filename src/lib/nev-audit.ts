import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditLogData {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT' | 'EXPORT';
  entityType: 'BRAND' | 'MODEL' | 'VARIANT';
  entityId: string;
  userId?: string;
  userName?: string;
  changes?: any;
  metadata?: any;
}

export async function createAuditLog(data: AuditLogData) {
  return prisma.nevAuditLog.create({
    data: {
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      userId: data.userId,
      userName: data.userName,
      changes: data.changes ? JSON.stringify(data.changes) : null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    },
  });
}

export interface AuditLogOptions {
  entityType?: string;
  entityId?: string;
  action?: string;
  limit?: number;
  offset?: number;
}

export async function getAuditLogs(options: AuditLogOptions = {}) {
  const where: any = {};
  
  if (options?.entityType) where.entityType = options.entityType;
  if (options?.entityId) where.entityId = options.entityId;
  if (options?.action) where.action = options.action;

  return prisma.nevAuditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
  });
}
