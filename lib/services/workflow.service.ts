/**
 * 工作流服务层（浏览器端）
 * 通过封装好的 http 客户端调用 `/api/workflow` Route Handlers
 */

import { http } from './http';
import type {
  Workflow,
  UpdateWorkflowRequest,
  GetWorkflowsParams,
} from '@/lib/types/workflow';
import type { WorkflowNode, WorkflowEdge } from '@/lib/workflow/types';
import type { StoredWorkflowData } from './workflowStorage.service';

export class WorkflowService {
  private readonly baseUrl = '/workflow';

  async createWorkflow(): Promise<{ workflowId: string }> {
    const response = await http.post<{ workflowId: string }>(this.baseUrl);
    return response.data;
  }

  async getWorkflowById(id: string): Promise<Workflow | null> {
    const data = await this.getWorkflowData(id);
    if (!data) {
      return null;
    }
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      runMode: data.runMode,
      status: data.status,
      startPoint: '',
      endPoint: '',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async getWorkflows(params?: GetWorkflowsParams): Promise<Workflow[]> {
    try {
      const response = await http.get<Workflow[]>(
        this.baseUrl,
        params as Record<string, unknown>,
        { silent: true }
      );
      return response.data ?? [];
    } catch {
      return [];
    }
  }

  async updateWorkflow(
    id: string,
    data: UpdateWorkflowRequest
  ): Promise<Workflow | null> {
    try {
      const response = await http.patch<Workflow>(
        `${this.baseUrl}/${encodeURIComponent(id)}`,
        data,
        { silent: true }
      );
      return response.data ?? null;
    } catch {
      return null;
    }
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    try {
      await http.delete(`${this.baseUrl}/${encodeURIComponent(id)}`, {
        silent: true,
      });
      return true;
    } catch {
      return false;
    }
  }

  async getWorkflowData(id: string): Promise<StoredWorkflowData | null> {
    try {
      const response = await http.get<StoredWorkflowData>(
        `${this.baseUrl}/${encodeURIComponent(id)}`,
        undefined,
        { silent: true }
      );
      return response.data ?? null;
    } catch {
      return null;
    }
  }

  async saveWorkflowData(data: StoredWorkflowData): Promise<void> {
    await http.put(`${this.baseUrl}/${encodeURIComponent(data.id)}`, data);
  }

  async saveWorkflow(
    workflowId: string,
    name: string,
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
  ): Promise<void> {
    const existingData = await this.getWorkflowData(workflowId);
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const dataToSave: StoredWorkflowData = {
      id: workflowId,
      name,
      description: existingData?.description ?? '',
      runMode: existingData?.runMode ?? 'once',
      status: existingData?.status ?? 'offline',
      nodes,
      edges,
      createdAt: existingData?.createdAt ?? now,
      updatedAt: now,
    };

    await this.saveWorkflowData(dataToSave);
  }
}

export const workflowService = new WorkflowService();
