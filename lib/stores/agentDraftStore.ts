import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";
import type { Agent, AgentDraft } from "@/lib/types/agent";
import { agentToDraft } from "@/lib/types/agent";
import { STORAGE_KEYS } from "@/lib/constants";
import { createSelectors } from "@/lib/stores/createSelectors";

interface AgentDraftState {
  draft: AgentDraft;
  isDirty: boolean;
  lastSavedAt: string | null;

  // 原有方法
  setDraft: (draft: AgentDraft, options?: { markSaved?: boolean }) => void;
  updateDraft: (updates: Partial<AgentDraft>) => void;
  markSaved: (timestamp?: string) => void;
  setDirty: (dirty: boolean) => void;
  resetDraft: () => void;

  // 新增方法
  loadFromAgent: (agent: Agent) => void;
  createNewDraft: () => void;
  isNewDraft: () => boolean;
}

const createTimestamp = () => new Date().toISOString();

const createEmptyDraft = (): AgentDraft => ({
  id: null,
  name: "未命名智能体",
  description: "",
  logo: "A",
  status: "draft",
  modelId: "deepseek-r1",
  rolePrompt: "",
  abilities: {
    knowledgeBases: [],
    workflows: [],
  },
  conversation: {
    openingStatement: "",
    suggestedQuestions: [],
  },
  updatedAt: null,
});

const useAgentDraftStoreBase = create<AgentDraftState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        draft: createEmptyDraft(),
        isDirty: false,
        lastSavedAt: null,

        setDraft: (draft, options) => {
          const markSaved = options?.markSaved ?? true;
          set({
            draft,
            isDirty: !markSaved,
            lastSavedAt: markSaved
              ? (draft.updatedAt ?? createTimestamp())
              : null,
          });
        },

        updateDraft: (updates) => {
          const timestamp = createTimestamp();
          set((state) => ({
            draft: {
              ...state.draft,
              ...updates,
              updatedAt: timestamp,
            },
            isDirty: true,
          }));
        },

        markSaved: (timestamp) => {
          const savedAt = timestamp ?? createTimestamp();
          set({ isDirty: false, lastSavedAt: savedAt });
        },

        setDirty: (dirty) => set({ isDirty: dirty }),

        resetDraft: () =>
          set({
            draft: createEmptyDraft(),
            isDirty: false,
            lastSavedAt: null,
          }),

        // 新增：从已有智能体加载数据到草稿
        loadFromAgent: (agent) => {
          const draft = agentToDraft(agent);
          set({
            draft,
            isDirty: false,
            lastSavedAt: agent.updatedAt,
          });
        },

        // 新增：创建新草稿
        createNewDraft: () => {
          set({
            draft: createEmptyDraft(),
            isDirty: false,
            lastSavedAt: null,
          });
        },

        // 新增：判断是否是新建的草稿
        isNewDraft: () => {
          return get().draft.id === null;
        },
      }),
      {
        name: STORAGE_KEYS.AGENT_DRAFT,
        version: 1,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          draft: state.draft,
          lastSavedAt: state.lastSavedAt,
        }),
      },
    ),
  ),
);

export const useAgentDraftStore = createSelectors(useAgentDraftStoreBase);
