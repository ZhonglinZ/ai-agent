import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { Agent, AgentDraft } from "@/lib/types/agent";
import { agentToDraft } from "@/lib/types/agent";
import { createSelectors } from "@/lib/stores/createSelectors";

interface AgentDraftState {
  draft: AgentDraft;
  isDirty: boolean;
  lastSavedAt: string | null;

  updateDraft: (updates: Partial<AgentDraft>) => void;
  markSaved: (timestamp?: string) => void;
  setDirty: (dirty: boolean) => void;
  resetDraft: () => void;
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
  subscribeWithSelector((set, get) => ({
    draft: createEmptyDraft(),
    isDirty: false,
    lastSavedAt: null,

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

    loadFromAgent: (agent) => {
      const draft = agentToDraft(agent);
      set({
        draft,
        isDirty: false,
        lastSavedAt: agent.updatedAt,
      });
    },

    createNewDraft: () => {
      set({
        draft: createEmptyDraft(),
        isDirty: false,
        lastSavedAt: null,
      });
    },

    isNewDraft: () => {
      return get().draft.id === null;
    },
  })),
);

export const useAgentDraftStore = createSelectors(useAgentDraftStoreBase);
