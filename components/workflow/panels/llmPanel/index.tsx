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

import React, { useState, useMemo } from "react";
import { Input, Tooltip, Divider, Modal } from "antd";
import {
  QuestionCircleOutlined,
  StarOutlined,
  ExpandOutlined,
} from "@ant-design/icons";
import { useWorkflowStore } from "@/lib/stores/workflowStore";
import { MODEL_OPTIONS } from "@/components/workflow/nodes/LLMNode";
import type {
  PropertyPanelProps,
  LLMNodeData,
  StartNodeData,
} from "@/lib/workflow/types";
import { NodeType } from "@/lib/workflow/types";
import { ModelParamsPanel } from "./ModalParamsPanel";
import { VariableSelector } from "./VariableSelector";
import { getAvailableVariables } from "@/lib/workflow/variableUtils";

const { TextArea } = Input;

/**
 * 变量插入按钮图标组件
 */
const VariableIcon: React.FC = () => (
  <span className="text-blue-500 font-mono text-sm">{"{x}"}</span>
);

/**
 * 大模型节点属性面板组件
 */
export const LLMPropertyPanel: React.FC<PropertyPanelProps<LLMNodeData>> = ({
  nodeId,
  data,
}) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const nodes = useWorkflowStore((state) => state.nodes);

  // 状态
  const [showModelPanel, setShowModelPanel] = useState(false);
  const [showVariableSelector, setShowVariableSelector] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 获取开始节点的输入变量
  const edges = useWorkflowStore((state) => state.edges); // 新增：获取边

  const availableVariables = useMemo(() => {
    return getAvailableVariables(nodeId, nodes, edges);
  }, [nodeId, nodes, edges]);

  // 获取当前选择的模型名称
  const selectedModel = useMemo(() => {
    return MODEL_OPTIONS.find((m) => m.id === data.model);
  }, [data.model]);

  /**
   * 更新节点数据
   */
  const handleChange = (field: keyof LLMNodeData, value: unknown) => {
    updateNodeData(nodeId, { [field]: value });
  };

  /**
   * 选择变量
   */
  const handleSelectVariable = (variableName: string) => {
    const variableRef = `{{${variableName}}}`;
    handleChange("context", variableRef);
  };

  /**
   * 在提示词中插入变量
   */
  const handleInsertVariable = (variableName: string) => {
    const variableRef = `{{${variableName}}}`;
    const currentPrompt = data.prompt || "";
    handleChange("prompt", currentPrompt + variableRef);
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
        <label className="text-sm font-medium text-gray-700">模型</label>
        <div
          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => setShowModelPanel(!showModelPanel)}
        >
          <div className="flex items-center gap-2">
            <span className="text-blue-500">✨</span>
            <span className={data.model ? "text-gray-800" : "text-gray-400"}>
              {selectedModel?.name || "选择模型"}
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
        model={data.model}
        temperatureEnabled={data.temperatureEnabled}
        temperature={data.temperature}
        topPEnabled={data.topPEnabled}
        topP={data.topP}
        onModelChange={(model) => handleChange("model", model)}
        onParamChange={(field, value) =>
          handleChange(field as keyof LLMNodeData, value)
        }
        onClose={() => setShowModelPanel(false)}
      />

      <Divider className="my-3" />

      {/* 上下文 - 带变量选择器 */}
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <label className="text-sm font-medium text-gray-700">上下文</label>
          <Tooltip title="设置传入模型的上下文变量，可以引用开始节点的输入变量">
            <QuestionCircleOutlined className="text-gray-400 text-xs cursor-help" />
          </Tooltip>
        </div>
        <div className="relative">
          <Input
            placeholder="设置变量值"
            value={data.context || ""}
            onChange={(e) => handleChange("context", e.target.value)}
            onFocus={() => setShowVariableSelector(true)}
          />
          <VariableSelector
            visible={showVariableSelector}
            onSelect={handleSelectVariable}
            onClose={() => setShowVariableSelector(false)}
            variables={availableVariables}
          />
        </div>
      </div>

      {/* 提示词 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">提示词</label>
          <div className="flex items-center gap-2">
            <Tooltip title="AI 优化提示词">
              <button className="p-1 hover:bg-gray-100 rounded text-blue-500">
                <StarOutlined className="text-sm" />
              </button>
            </Tooltip>
            <Tooltip title="插入变量">
              <button className="p-1 hover:bg-gray-100 rounded">
                <VariableIcon />
              </button>
            </Tooltip>
            <Tooltip title="全屏编辑">
              <button
                className="p-1 hover:bg-gray-100 rounded text-gray-500"
                onClick={() => setIsFullscreen(true)}
              >
                <ExpandOutlined className="text-sm" />
              </button>
            </Tooltip>
          </div>
        </div>
        <TextArea
          rows={5}
          placeholder="在这里写你的提示词..."
          value={data.prompt || ""}
          onChange={(e) => handleChange("prompt", e.target.value)}
          className="resize-none"
        />
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

      {/* 全屏编辑 Modal */}
      <Modal
        title="提示词编辑"
        open={isFullscreen}
        onCancel={() => setIsFullscreen(false)}
        footer={null}
        width="80%"
        style={{ top: 20 }}
      >
        <div className="space-y-3">
          {/* 变量快速选择 */}
          {availableVariables.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-2">
              <span className="text-xs text-gray-500">可用变量：</span>
              {availableVariables.map((variable) => (
                <button
                  key={variable.id}
                  className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  onClick={() => handleInsertVariable(variable.name)}
                >
                  {`{{${variable.name}}}`}
                </button>
              ))}
            </div>
          )}

          {/* 编辑区 */}
          <TextArea
            rows={20}
            placeholder="在这里写你的提示词..."
            value={data.prompt || ""}
            onChange={(e) => handleChange("prompt", e.target.value)}
            className="resize-none text-base"
            autoFocus
          />
        </div>
      </Modal>
    </div>
  );
};
