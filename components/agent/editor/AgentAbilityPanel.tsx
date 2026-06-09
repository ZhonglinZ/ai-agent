"use client";

import React, { useEffect, useState } from "react";
import { Button } from "antd";
import {
  CheckCircleFilled,
  CloseOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useAgentDraftStore } from "@/lib/stores/agentDraftStore";
import type { AgentAbilityRef } from "@/lib/types/agent";
import type { KnowledgeBase } from "@/lib/types/knowledge";
import type { Workflow } from "@/lib/types/workflow";
import { runModeMap, statusMap } from "@/lib/types/workflow";
import { knowledgeService } from "@/lib/services/knowledge.service";
import { workflowService } from "@/lib/services/workflow.service";
import { initMockData } from "@/lib/services/knowledge.mock";
import { cn } from "@/lib/utils";
import {
  AgentAbilitySelectModal,
  type AgentAbilityOption,
} from "./AgentAbilitySelectModal";

// 统一渲染列表，支持可选的删除按钮
const renderAbilityList = (
  items: AgentAbilityRef[],
  iconLabel: string,
  iconClassName: string,
  emptyLabel: string,
  onRemove?: (id: string) => void,
) => {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-center text-xs text-gray-400">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-semibold ${iconClassName}`}
            >
              {iconLabel}
            </div>
            <span className="text-sm text-gray-800">{item.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircleFilled className="text-green-500" />
            {onRemove ? (
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => onRemove(item.id)}
                className="text-gray-400 hover:text-red-500"
              />
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
};

// 将列表页数据映射成弹窗可用结构
const mapKnowledgeOptions = (bases: KnowledgeBase[]): AgentAbilityOption[] =>
  bases.map((base) => ({
    id: base.id,
    name: base.name,
    description: base.description,
    tags: base.tags,
  }));

// 映射工作流数据，并补充状态/运行方式标签
const mapWorkflowOptions = (workflows: Workflow[]): AgentAbilityOption[] =>
  workflows.map((workflow) => {
    const runModeLabel = runModeMap[workflow.runMode];
    const statusLabel = statusMap[workflow.status];
    const description =
      workflow.description?.trim() ||
      `状态：${statusLabel} · 运行方式：${runModeLabel}`;
    return {
      id: workflow.id,
      name: workflow.name,
      description,
      tags: [runModeLabel, statusLabel],
    };
  });

interface AgentAbilityPanelProps {
  className?: string;
}

export const AgentAbilityPanel: React.FC<AgentAbilityPanelProps> = ({
  className,
}) => {
  const draft = useAgentDraftStore.use.useDraft();
  const updateDraft = useAgentDraftStore.use.useUpdateDraft();
  // 本地状态用于即时回显，并驱动弹窗选中同步
  const [activeModal, setActiveModal] = useState<
    "knowledge" | "workflow" | null
  >(null);
  const [knowledgeOptions, setKnowledgeOptions] = useState<
    AgentAbilityOption[]
  >([]);
  const [workflowOptions, setWorkflowOptions] = useState<AgentAbilityOption[]>(
    [],
  );
  const [selectedKnowledgeBases, setSelectedKnowledgeBases] = useState<
    AgentAbilityRef[]
  >([]);
  const [selectedWorkflows, setSelectedWorkflows] = useState<AgentAbilityRef[]>(
    [],
  );

  const knowledgeCount = selectedKnowledgeBases.length;
  const workflowCount = selectedWorkflows.length;

  // 从列表页数据源加载知识库
  useEffect(() => {
    initMockData();
    const bases = knowledgeService.getKnowledgeBases();
    setKnowledgeOptions(mapKnowledgeOptions(bases));
  }, []);

  // 监听 store 变化，同步本地选中状态
  useEffect(() => {
    setSelectedKnowledgeBases(draft.abilities.knowledgeBases);
  }, [draft.abilities.knowledgeBases]);

  // 同步工作流选中状态
  useEffect(() => {
    setSelectedWorkflows(draft.abilities.workflows);
  }, [draft.abilities.workflows]);

  // 异步加载工作流
  useEffect(() => {
    let active = true;
    const load = async () => {
      const workflows = await workflowService.getWorkflows();
      if (!active) return;
      setWorkflowOptions(mapWorkflowOptions(workflows));
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  // 将弹窗选择结果写回本地状态 + store
  const handleApplyKnowledgeBases = (nextSelected: AgentAbilityRef[]) => {
    setSelectedKnowledgeBases(nextSelected);
    const currentAbilities = useAgentDraftStore.getState().draft.abilities;
    updateDraft({
      abilities: {
        ...currentAbilities,
        knowledgeBases: nextSelected,
      },
    });
  };

  // 将工作流选择结果写回本地状态 + store
  const handleApplyWorkflows = (nextSelected: AgentAbilityRef[]) => {
    setSelectedWorkflows(nextSelected);
    const currentAbilities = useAgentDraftStore.getState().draft.abilities;
    updateDraft({
      abilities: {
        ...currentAbilities,
        workflows: nextSelected,
      },
    });
  };

  // 直接在列表中删除已选知识库
  const handleRemoveKnowledgeBase = (id: string) => {
    const nextSelected = selectedKnowledgeBases.filter(
      (item) => item.id !== id,
    );
    setSelectedKnowledgeBases(nextSelected);
    const currentAbilities = useAgentDraftStore.getState().draft.abilities;
    updateDraft({
      abilities: {
        ...currentAbilities,
        knowledgeBases: nextSelected,
      },
    });
  };

  // 直接在列表中删除已选工作流
  const handleRemoveWorkflow = (id: string) => {
    const nextSelected = selectedWorkflows.filter((item) => item.id !== id);
    setSelectedWorkflows(nextSelected);
    const currentAbilities = useAgentDraftStore.getState().draft.abilities;
    updateDraft({
      abilities: {
        ...currentAbilities,
        workflows: nextSelected,
      },
    });
  };

  return (
    <section
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-4 space-y-4",
        className,
      )}
    >
      <h3 className="text-sm font-semibold text-gray-900">能力</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">知识库</span>
            <span className="text-xs text-gray-400">已选 {knowledgeCount}</span>
          </div>
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setActiveModal("knowledge")}
          >
            选择
          </Button>
        </div>
        {renderAbilityList(
          selectedKnowledgeBases,
          "知",
          "bg-indigo-50 text-indigo-600",
          "暂未选择知识库，点击右侧选择",
          handleRemoveKnowledgeBase,
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">工作流</span>
            <span className="text-xs text-gray-400">已选 {workflowCount}</span>
          </div>
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setActiveModal("workflow")}
          >
            选择
          </Button>
        </div>
        {renderAbilityList(
          selectedWorkflows,
          "流",
          "bg-emerald-50 text-emerald-600",
          "暂未选择工作流，点击右侧选择",
          handleRemoveWorkflow,
        )}
      </div>

      <AgentAbilitySelectModal
        open={activeModal === "knowledge"}
        title="选择知识库"
        description="数据来源于 /knowledge/list，可多选。"
        options={knowledgeOptions}
        selected={selectedKnowledgeBases}
        onApply={handleApplyKnowledgeBases}
        onClose={() => setActiveModal(null)}
      />

      <AgentAbilitySelectModal
        open={activeModal === "workflow"}
        title="选择工作流"
        description="数据来源于 /workflow/list，可多选。"
        options={workflowOptions}
        selected={selectedWorkflows}
        onApply={handleApplyWorkflows}
        onClose={() => setActiveModal(null)}
      />
    </section>
  );
};
