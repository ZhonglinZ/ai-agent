/**
 * 大模型节点属性面板
 *
 * 提供大模型节点的配置表单，包括：
 * - 节点描述
 * - 模型选择（带参数设置面板）
 * - 上下文变量（带变量选择器）
 * - 提示词编辑（支持全屏）
 * - 输出变量展示
 */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Input, Tooltip, Divider } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useWorkflowStore } from "@/lib/stores/workflowStore";
import type {
  PropertyPanelProps,
  KnowledgeNodeData,
} from "@/lib/workflow/types";
import { ModelParamsPanel } from "./ModalParamsPanel";
import { getAvailableVariables } from "@/lib/workflow/variableUtils";
import { knowledgeService } from "@/lib/services/knowledgeNew.service";
import { VariableInput } from "../apiPanel/VariableSelector";

/**
 * 知识库节点属性面板组件
 */
export const KnowledgePropertyPanel: React.FC<
  PropertyPanelProps<KnowledgeNodeData>
> = ({ nodeId, data }) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const nodes = useWorkflowStore((state) => state.nodes);

  // 状态
  const [showModelPanel, setShowModelPanel] = useState(false);
  const [knowledgeBaseOptions, setKnowledgeBaseOptions] = useState<any[]>([]);

  useEffect(() => {
    const loadKnowledgeBaseOptions = async () => {
      const knowledgeBaseOptions = await knowledgeService.getKnowledgeBases();
      setKnowledgeBaseOptions(knowledgeBaseOptions);
    };
    loadKnowledgeBaseOptions();
  }, []);

  // 获取开始节点的输入变量
  const edges = useWorkflowStore((state) => state.edges); // 新增：获取边

  const availableVariables = useMemo(() => {
    return getAvailableVariables(nodeId, nodes, edges);
  }, [nodeId, nodes, edges]);

  /**
   * 更新节点数据
   */
  const handleChange = (field: keyof KnowledgeNodeData, value: unknown) => {
    updateNodeData(nodeId, { [field]: value });
  };

  return (
    <div className="space-y-5">
      {/* 节点描述 */}
      <div>
        <Input
          placeholder="添加描述..."
          variant="borderless"
          value={data.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          className="text-gray-500 px-0 hover:bg-gray-50 rounded"
        />
      </div>

      <Divider className="my-3" />

      {/* 模型选择 - 点击展开左侧浮动设置面板 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">知识库</label>
        <div
          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => setShowModelPanel(!showModelPanel)}
        >
          <div className="flex items-center gap-2">
            <span className="text-blue-500">✨</span>
            <span
              className={
                data.knowledgeBaseId ? "text-gray-800" : "text-gray-400"
              }
            >
              {data.knowledgeBaseName || "选择知识库"}
            </span>
          </div>
          <span
            className={`text-gray-400 transition-transform ${
              showModelPanel ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </div>
      </div>

      {/* 模型参数设置浮动面板 - 显示在属性面板左侧 */}
      <ModelParamsPanel
        visible={showModelPanel}
        knowledgeBaseId={data.knowledgeBaseId}
        onKnowledgeBaseIdChange={(knowledgeBaseId) => {
          handleChange("knowledgeBaseId", knowledgeBaseId);
          handleChange(
            "knowledgeBaseName",
            knowledgeBaseOptions.find((kb: any) => kb.id === knowledgeBaseId)
              ?.name,
          );
        }}
        knowledgeBaseOptions={knowledgeBaseOptions || []}
        topK={data.topK}
        scoreThreshold={data.scoreThreshold}
        onParamChange={(field, value) =>
          handleChange(field as keyof KnowledgeNodeData, value)
        }
        onClose={() => setShowModelPanel(false)}
      />

      <Divider className="my-3" />

      {/* 上下文 - 带变量选择器 */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <label className="text-sm font-medium text-gray-700">查询词</label>
          <Tooltip title="设置查询词，可以引用开始节点的输入变量">
            <QuestionCircleOutlined className="text-gray-400 text-xs cursor-help" />
          </Tooltip>
        </div>
        <div className="relative">
          <VariableInput
            value={data.query}
            onChange={(v) => handleChange("query", v)}
            placeholder="设置查询词"
            variables={availableVariables}
          />
        </div>
      </div>

      <Divider className="my-3" />

      {/* 输出 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">输出</label>
        {data.outputs && data.outputs.length > 0 ? (
          <div className="space-y-2">
            {data.outputs.map((output) => (
              <div key={output.name} className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">
                    {output.name}
                  </span>
                  <span className="text-gray-400 text-sm">{output.type}</span>
                </div>
                {output.description && (
                  <span className="text-gray-500 text-xs">
                    {output.description}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-sm">暂无输出</div>
        )}
      </div>
    </div>
  );
};
