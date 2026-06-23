"use client";

import { useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { message } from "antd";
import { useAgentDraftStore } from "@/lib/stores/agentDraftStore";
import { agentService } from "@/lib/services/agent.service";
import { draftToAgent } from "@/lib/types/agent";
import type { AgentDraft } from "@/lib/types/agent";

const validateDraftForPublish = (
  draft: AgentDraft,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!draft.name.trim()) {
    errors.push("请填写智能体名称");
  }

  if (!draft.description.trim()) {
    errors.push("请填写智能体描述");
  }

  if (!draft.rolePrompt.trim()) {
    errors.push("请填写角色指令");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

const validateDraftForSave = (
  draft: AgentDraft,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!draft.name.trim()) {
    errors.push("请填写智能体名称");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const useAgentEditor = () => {
  const searchParams = useSearchParams();
  const agentId = searchParams.get("id");

  const draft = useAgentDraftStore.use.useDraft();
  const isDirty = useAgentDraftStore.use.useIsDirty();
  const loadFromAgent = useAgentDraftStore.use.useLoadFromAgent();
  const createNewDraft = useAgentDraftStore.use.useCreateNewDraft();
  const updateDraft = useAgentDraftStore.use.useUpdateDraft();
  const markSaved = useAgentDraftStore.use.useMarkSaved();

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (agentId) {
        const agent = await agentService.getAgentById(agentId);
        if (cancelled) return;

        if (agent) {
          loadFromAgent(agent);
        } else {
          message.error("智能体不存在");
          createNewDraft();
        }
      } else {
        createNewDraft();
      }
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, [agentId, loadFromAgent, createNewDraft]);

  const saveDraft = useCallback(async (): Promise<boolean> => {
    const validation = validateDraftForSave(draft);
    if (!validation.valid) {
      validation.errors.forEach((error) =>
        message.open({
          type: "error",
          content: error,
          duration: 2,
        }),
      );
      return false;
    }

    const isNew = draft.id === null;

    try {
      if (isNew) {
        const agent = draftToAgent(draft);
        const created = await agentService.createAgentRecord(agent);
        updateDraft({ id: created.id });
      } else {
        const existing = await agentService.getAgentById(draft.id!);
        const agent = draftToAgent(draft, existing ?? undefined);
        await agentService.saveAgent(agent);
      }

      markSaved();
      message.open({
        type: "success",
        content: "保存成功",
        duration: 2,
      });
      return true;
    } catch (error) {
      console.error("保存智能体失败:", error);
      message.error("保存失败");
      return false;
    }
  }, [draft, updateDraft, markSaved]);

  const publishAgent = useCallback(async (): Promise<{
    success: boolean;
    errors: string[];
  }> => {
    const validation = validateDraftForPublish(draft);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const isNew = draft.id === null;

    try {
      if (isNew) {
        const agent = draftToAgent({ ...draft, status: "published" });
        const created = await agentService.createAgentRecord(agent);
        updateDraft({ id: created.id, status: "published" });
      } else {
        const existing = await agentService.getAgentById(draft.id!);
        const agent = draftToAgent(
          { ...draft, status: "published" },
          existing ?? undefined,
        );
        await agentService.saveAgent(agent);
        updateDraft({ status: "published" });
      }

      markSaved();
      return { success: true, errors: [] };
    } catch (error) {
      console.error("发布智能体失败:", error);
      return { success: false, errors: ["发布失败"] };
    }
  }, [draft, updateDraft, markSaved]);

  const validateForPublish = useCallback(() => {
    return validateDraftForPublish(draft);
  }, [draft]);

  return {
    draft,
    isDirty,
    isNewAgent: draft.id === null,
    agentId: draft.id,
    saveDraft,
    publishAgent,
    validateForPublish,
  };
};
