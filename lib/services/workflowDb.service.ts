/**
 * 工作流数据库持久化（Prisma）
 * 行为对齐 lib/services/workflowStorage.service.ts，仅在服务端使用。
 */

import type { Workflow, WorkflowRunMode, WorkflowStatus } from '@/lib/types/workflow';
import type { WorkflowNode, WorkflowEdge } from '@/lib/workflow/types';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@/generated/prisma/client';
import type { StoredWorkflowData } from './workflowStorage.service';

function formatStoredTime(d: Date): string {
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

function generateId(): string {
  return `wf_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function rowToStoredWorkflowData(row: {
  id: string;
  name: string;
  description: string | null;
  runMode: WorkflowRunMode;
  status: WorkflowStatus;
  nodes: Prisma.JsonValue;
  edges: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}): StoredWorkflowData {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    runMode: row.runMode,
    status: row.status,
    nodes: row.nodes as unknown as WorkflowNode[],
    edges: row.edges as unknown as WorkflowEdge[],
    createdAt: formatStoredTime(row.createdAt),
    updatedAt: formatStoredTime(row.updatedAt),
  };
}

function rowToWorkflow(row: {
  id: string;
  name: string;
  description: string | null;
  runMode: WorkflowRunMode;
  status: WorkflowStatus;
  createdAt: Date;
  updatedAt: Date;
}): Workflow {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    runMode: row.runMode,
    status: row.status,
    startPoint: '',
    endPoint: '',
    createdAt: formatStoredTime(row.createdAt),
    updatedAt: formatStoredTime(row.updatedAt),
  };
}

class WorkflowDbService {
  async getWorkflowList(): Promise<Workflow[]> {
    const rows = await prisma.storedWorkflow.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map(rowToWorkflow);
  }

  async createWorkflow(): Promise<{ workflowId: string }> {
    const id = generateId();
    const now = new Date();
    await prisma.storedWorkflow.create({
      data: {
        id,
        name: '未命名工作流',
        description: '',
        runMode: 'once',
        status: 'offline',
        nodes: [],
        edges: [],
        createdAt: now,
        updatedAt: now,
      },
    });
    return { workflowId: id };
  }

  async getWorkflowData(id: string): Promise<StoredWorkflowData | null> {
    const row = await prisma.storedWorkflow.findUnique({ where: { id } });
    return row ? rowToStoredWorkflowData(row) : null;
  }

  async saveWorkflowData(data: StoredWorkflowData): Promise<void> {
    const now = new Date();
    await prisma.storedWorkflow.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description ?? '',
        runMode: data.runMode,
        status: data.status,
        nodes: data.nodes as unknown as Prisma.InputJsonValue,
        edges: data.edges as unknown as Prisma.InputJsonValue,
        updatedAt: now,
      },
    });
  }

  async getWorkflowById(id: string): Promise<Workflow | null> {
    const row = await prisma.storedWorkflow.findUnique({ where: { id } });
    return row ? rowToWorkflow(row) : null;
  }

  async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow | null> {
    const existing = await prisma.storedWorkflow.findUnique({ where: { id } });
    if (!existing) {
      return null;
    }

    const data: Prisma.StoredWorkflowUpdateInput = {
      updatedAt: new Date(),
    };
    if (updates.name !== undefined) data.name = updates.name;
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.runMode !== undefined) data.runMode = updates.runMode;
    if (updates.status !== undefined) data.status = updates.status;

    const row = await prisma.storedWorkflow.update({
      where: { id },
      data,
    });

    return rowToWorkflow(row);
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    try {
      await prisma.storedWorkflow.delete({ where: { id } });
      return true;
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'code' in e && e.code === 'P2025') {
        return false;
      }
      console.error('删除工作流失败:', e);
      return false;
    }
  }

  async clearAll(): Promise<void> {
    await prisma.storedWorkflow.deleteMany();
  }
}

export const workflowDbService = new WorkflowDbService();
