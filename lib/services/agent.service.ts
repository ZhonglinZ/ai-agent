/**
 * 智能体服务层（浏览器端）
 * 通过 http 客户端调用 `/api/agent` Route Handlers
 */

import { http } from './http';
import type { Agent } from '@/lib/types/agent';

export class AgentService {
  private readonly baseUrl = '/agent';

  async createAgent(): Promise<{ agentId: string }> {
    const response = await http.post<{ agentId: string }>(this.baseUrl);
    return response.data;
  }

  async createAgentRecord(agent: Agent): Promise<Agent> {
    const response = await http.post<Agent>(this.baseUrl, agent);
    return response.data;
  }

  async getAgents(): Promise<Agent[]> {
    try {
      const response = await http.get<Agent[]>(this.baseUrl, undefined, {
        silent: true,
      });
      return response.data ?? [];
    } catch {
      return [];
    }
  }

  async getAgentById(id: string): Promise<Agent | null> {
    try {
      const response = await http.get<Agent>(
        `${this.baseUrl}/${encodeURIComponent(id)}`,
        undefined,
        { silent: true }
      );
      return response.data ?? null;
    } catch {
      return null;
    }
  }

  async updateAgent(
    id: string,
    updates: Partial<Agent>
  ): Promise<Agent | null> {
    try {
      const response = await http.patch<Agent>(
        `${this.baseUrl}/${encodeURIComponent(id)}`,
        updates,
        { silent: true }
      );
      return response.data ?? null;
    } catch {
      return null;
    }
  }

  async saveAgent(agent: Agent): Promise<void> {
    await http.put(`${this.baseUrl}/${encodeURIComponent(agent.id)}`, agent);
  }

  async deleteAgent(id: string): Promise<boolean> {
    try {
      await http.delete(`${this.baseUrl}/${encodeURIComponent(id)}`, {
        silent: true,
      });
      return true;
    } catch {
      return false;
    }
  }

  async publishAgent(id: string): Promise<Agent | null> {
    return this.updateAgent(id, { status: 'published' });
  }

  async unpublishAgent(id: string): Promise<Agent | null> {
    return this.updateAgent(id, { status: 'offline' });
  }
}

export const agentService = new AgentService();
