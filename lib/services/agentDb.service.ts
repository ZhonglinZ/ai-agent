/**
 * 智能体数据库持久化（Prisma）
 * 行为对齐原 agent 列表/编辑持久化逻辑，仅在服务端使用。
 */

import type {
  Agent,
  AgentStatus,
  AgentAbilities,
  AgentConversationConfig,
  AgentModelId,
} from '@/lib/types/agent';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@/generated/prisma/client';

const EMPTY_ABILITIES: AgentAbilities = {
  knowledgeBases: [],
  workflows: [],
};

const EMPTY_CONVERSATION: AgentConversationConfig = {
  openingStatement: '',
  suggestedQuestions: [],
};

function generateId(): string {
  return `agent_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function rowToAgent(row: {
  id: string;
  name: string;
  description: string;
  logo: string;
  status: AgentStatus;
  modelId: string;
  rolePrompt: string;
  abilities: Prisma.JsonValue;
  conversation: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}): Agent {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    logo: row.logo,
    status: row.status,
    modelId: row.modelId as AgentModelId,
    rolePrompt: row.rolePrompt,
    abilities: row.abilities as unknown as AgentAbilities,
    conversation: row.conversation as unknown as AgentConversationConfig,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

class AgentDbService {
  async getAgentList(): Promise<Agent[]> {
    const rows = await prisma.agent.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map(rowToAgent);
  }

  async getAgentsByStatus(status: AgentStatus): Promise<Agent[]> {
    const rows = await prisma.agent.findMany({
      where: { status },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map(rowToAgent);
  }

  async getAgentById(id: string): Promise<Agent | null> {
    const row = await prisma.agent.findUnique({ where: { id } });
    return row ? rowToAgent(row) : null;
  }

  /** 创建空白智能体（对齐 workflow 的 createWorkflow） */
  async createEmptyAgent(): Promise<{ agentId: string }> {
    const id = generateId();
    const now = new Date();
    await prisma.agent.create({
      data: {
        id,
        name: '未命名智能体',
        description: '',
        logo: 'A',
        status: 'draft',
        modelId: 'deepseek-r1',
        rolePrompt: '',
        abilities: EMPTY_ABILITIES as unknown as Prisma.InputJsonValue,
        conversation: EMPTY_CONVERSATION as unknown as Prisma.InputJsonValue,
        createdAt: now,
        updatedAt: now,
      },
    });
    return { agentId: id };
  }

  /** 创建完整智能体记录 */
  async createAgent(agent: Agent): Promise<Agent> {
    const now = new Date();
    const row = await prisma.agent.create({
      data: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        logo: agent.logo,
        status: agent.status,
        modelId: agent.modelId,
        rolePrompt: agent.rolePrompt,
        abilities: agent.abilities as unknown as Prisma.InputJsonValue,
        conversation: agent.conversation as unknown as Prisma.InputJsonValue,
        createdAt: agent.createdAt ? new Date(agent.createdAt) : now,
        updatedAt: agent.updatedAt ? new Date(agent.updatedAt) : now,
      },
    });
    return rowToAgent(row);
  }

  /** 整份保存（对齐 draftToAgent 后的完整 Agent） */
  async saveAgent(agent: Agent): Promise<void> {
    const now = new Date();
    await prisma.agent.update({
      where: { id: agent.id },
      data: {
        name: agent.name,
        description: agent.description,
        logo: agent.logo,
        status: agent.status,
        modelId: agent.modelId,
        rolePrompt: agent.rolePrompt,
        abilities: agent.abilities as unknown as Prisma.InputJsonValue,
        conversation: agent.conversation as unknown as Prisma.InputJsonValue,
        updatedAt: agent.updatedAt ? new Date(agent.updatedAt) : now,
      },
    });
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | null> {
    const existing = await prisma.agent.findUnique({ where: { id } });
    if (!existing) {
      return null;
    }

    const data: Prisma.AgentUpdateInput = {
      updatedAt: new Date(),
    };
    if (updates.name !== undefined) data.name = updates.name;
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.logo !== undefined) data.logo = updates.logo;
    if (updates.status !== undefined) data.status = updates.status;
    if (updates.modelId !== undefined) data.modelId = updates.modelId;
    if (updates.rolePrompt !== undefined) data.rolePrompt = updates.rolePrompt;
    if (updates.abilities !== undefined) {
      data.abilities = updates.abilities as unknown as Prisma.InputJsonValue;
    }
    if (updates.conversation !== undefined) {
      data.conversation = updates.conversation as unknown as Prisma.InputJsonValue;
    }

    const row = await prisma.agent.update({
      where: { id },
      data,
    });

    return rowToAgent(row);
  }

  async publishAgent(id: string): Promise<Agent | null> {
    return this.updateAgent(id, { status: 'published' });
  }

  async unpublishAgent(id: string): Promise<Agent | null> {
    return this.updateAgent(id, { status: 'offline' });
  }

  async deleteAgent(id: string): Promise<boolean> {
    try {
      await prisma.agent.delete({ where: { id } });
      return true;
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'code' in e && e.code === 'P2025') {
        return false;
      }
      console.error('删除智能体失败:', e);
      return false;
    }
  }

  async clearAll(): Promise<void> {
    await prisma.agent.deleteMany();
  }
}

export const agentDbService = new AgentDbService();
