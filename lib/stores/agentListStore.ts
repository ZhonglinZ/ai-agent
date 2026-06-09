import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Agent, AgentStatus } from "@/lib/types/agent";
import { STORAGE_KEYS } from "@/lib/constants";
import { createSelectors } from "@/lib/stores/createSelectors";

interface AgentListState {
  agents: Agent[];
  isInitialized: boolean;

  // 查询方法
  getAgentById: (id: string) => Agent | undefined;
  getAgentsByStatus: (status: AgentStatus) => Agent[];

  // 操作方法
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;

  // 发布相关
  publishAgent: (id: string) => void;
  unpublishAgent: (id: string) => void;

  // 初始化
  initializeWithMockData: () => void;
}

/**
 * 初始 Mock 数据
 * 首次使用时填充，让用户有数据可看
 */
const INITIAL_MOCK_AGENTS: Agent[] = [
  {
    id: "agent_001",
    name: "客服助手",
    status: "published",
    description: "面向企业客服场景，支持 FAQ、工单分流与多轮对话。",
    logo: "客",
    modelId: "deepseek-r1",
    rolePrompt:
      "你是一个专业的客服助手，负责解答用户问题、处理工单分流。请保持友好、专业的态度。",
    abilities: {
      knowledgeBases: [{ id: "kb_001", name: "产品FAQ知识库" }],
      workflows: [],
    },
    conversation: {
      openingStatement: "您好！我是客服助手，有什么可以帮您的吗？",
      suggestedQuestions: ["如何退款？", "订单查询", "联系人工客服"],
    },
    createdAt: "2025-05-01T09:30:00.000Z",
    updatedAt: "2025-05-01T09:30:00.000Z",
  },
  {
    id: "agent_002",
    name: "数据分析官",
    status: "draft",
    description: "将数据表格转为洞察报告，支持自定义指标解读。",
    logo: "数",
    modelId: "gpt-4o",
    rolePrompt:
      "你是一个数据分析专家，擅长从数据中发现洞察，生成清晰的分析报告。",
    abilities: {
      knowledgeBases: [],
      workflows: [{ id: "wf_001", name: "数据分析流程" }],
    },
    conversation: {
      openingStatement: "您好！请上传您的数据，我来帮您分析。",
      suggestedQuestions: ["分析销售趋势", "生成月度报告", "对比同期数据"],
    },
    createdAt: "2025-04-28T14:12:00.000Z",
    updatedAt: "2025-04-28T14:12:00.000Z",
  },
  {
    id: "agent_003",
    name: "运营策划师",
    status: "published",
    description: "用于活动策划与内容生成，可结合历史数据生成方案。",
    logo: "运",
    modelId: "claude-3.5",
    rolePrompt: "你是一个资深运营策划师，擅长活动策划、内容创作和用户增长。",
    abilities: {
      knowledgeBases: [{ id: "kb_002", name: "运营案例库" }],
      workflows: [{ id: "wf_002", name: "活动策划流程" }],
    },
    conversation: {
      openingStatement: "您好！我是运营策划师，可以帮您策划活动、生成内容。",
      suggestedQuestions: ["策划双11活动", "写一篇推广文案", "分析竞品活动"],
    },
    createdAt: "2025-04-26T18:08:00.000Z",
    updatedAt: "2025-04-26T18:08:00.000Z",
  },
];

const useAgentListStoreBase = create<AgentListState>()(
  persist(
    (set, get) => ({
      agents: [],
      isInitialized: false,

      getAgentById: (id) => {
        return get().agents.find((agent) => agent.id === id);
      },

      getAgentsByStatus: (status) => {
        return get().agents.filter((agent) => agent.status === status);
      },

      addAgent: (agent) => {
        set((state) => ({
          agents: [agent, ...state.agents],
        }));
      },

      updateAgent: (id, updates) => {
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id
              ? { ...agent, ...updates, updatedAt: new Date().toISOString() }
              : agent,
          ),
        }));
      },

      deleteAgent: (id) => {
        set((state) => ({
          agents: state.agents.filter((agent) => agent.id !== id),
        }));
      },

      publishAgent: (id) => {
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id
              ? {
                  ...agent,
                  status: "published" as AgentStatus,
                  updatedAt: new Date().toISOString(),
                }
              : agent,
          ),
        }));
      },

      unpublishAgent: (id) => {
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id
              ? {
                  ...agent,
                  status: "offline" as AgentStatus,
                  updatedAt: new Date().toISOString(),
                }
              : agent,
          ),
        }));
      },

      initializeWithMockData: () => {
        const state = get();
        if (state.isInitialized) return;

        set({
          agents: INITIAL_MOCK_AGENTS,
          isInitialized: true,
        });
      },
    }),
    {
      name: STORAGE_KEYS.AGENT_LIST,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // 如果是首次使用（没有数据），初始化 Mock 数据
        if (state && !state.isInitialized && state.agents.length === 0) {
          state.initializeWithMockData();
        }
      },
    },
  ),
);

export const useAgentListStore = createSelectors(useAgentListStoreBase);
