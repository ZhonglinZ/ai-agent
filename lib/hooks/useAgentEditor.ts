"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { message } from "antd";
import { useAgentDraftStore } from "@/lib/stores/agentDraftStore";
import { useAgentListStore } from "@/lib/stores/agentListStore";
import { draftToAgent } from "@/lib/types/agent";
import type { AgentDraft } from "@/lib/types/agent";

/**
 * 校验草稿是否可以发布
 */
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

/**
 * 校验草稿是否可以保存（比发布宽松）
 */
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

  const getAgentById = useAgentListStore.use.useGetAgentById();
  const addAgent = useAgentListStore.use.useAddAgent();
  const updateAgent = useAgentListStore.use.useUpdateAgent();

  const initializedRef = useRef(false);

  // 初始化：根据 URL 参数加载数据
  useEffect(() => {
    // 防止重复初始化
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (agentId) {
      // 编辑模式：加载已有智能体
      const agent = getAgentById(agentId);
      if (agent) {
        loadFromAgent(agent);
      } else {
        message.error("智能体不存在");
        createNewDraft();
      }
    } else {
      // 新建模式：创建空白草稿
      createNewDraft();
    }
  }, [agentId, getAgentById, loadFromAgent, createNewDraft]);

  // 保存草稿
  const saveDraft = useCallback(() => {
    const validation = validateDraftForSave(draft);
    if (!validation.valid) {
      validation.errors.forEach((error) => message.error(error));
      return false;
    }

    const isNew = draft.id === null;
    const agent = draftToAgent(
      draft,
      isNew ? undefined : getAgentById(draft.id!),
    );

    if (isNew) {
      // 新建：添加到列表
      addAgent(agent);
      // 更新草稿的 ID
      updateDraft({ id: agent.id });
    } else {
      // 编辑：更新列表中的数据
      updateAgent(agent.id, agent);
    }

    markSaved();
    message.success("保存成功");
    return true;
  }, [draft, getAgentById, addAgent, updateAgent, updateDraft, markSaved]);

  // 发布智能体
  const publishAgent = useCallback(() => {
    const validation = validateDraftForPublish(draft);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const isNew = draft.id === null;
    const existingAgent = isNew ? undefined : getAgentById(draft.id!);
    const agent = draftToAgent(
      { ...draft, status: "published" },
      existingAgent,
    );

    if (isNew) {
      addAgent(agent);
      updateDraft({ id: agent.id, status: "published" });
    } else {
      updateAgent(agent.id, agent);
      updateDraft({ status: "published" });
    }

    markSaved();
    return { success: true, errors: [] };
  }, [draft, getAgentById, addAgent, updateAgent, updateDraft, markSaved]);

  // 校验发布
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
