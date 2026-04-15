"use client";

import React from "react";
import { CloseOutlined } from "@ant-design/icons";
import { Button, Empty } from "antd";
import { useWorkflowStore } from "@/lib/stores/workflowStore";
import { nodeRegistry } from "@/lib/workflow/nodeRegistry";
import { DynamicForm } from "./DynamicForm";
import type { NodeConfig, WorkflowNodeData } from "@/lib/workflow/types";

export const PropertyPanel: React.FC = () => {
  // 获取选中的节点 ID
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);

  // 获取选中的节点
  const selectedNode = useWorkflowStore((state) =>
    state.nodes.find((node) => node.id === selectedNodeId)
  );

  // 关闭面板 选中节点为null的时候即关闭
  const setSelectedNodeId = useWorkflowStore(
    (state) => state.setSelectedNodeId
  );

  // 如果没有选中节点，不渲染面板
  if (!selectedNodeId || !selectedNode) {
    return null;
  }

  // 获取节点配置
  const nodeConfig = nodeRegistry.get(selectedNode.type) || ({} as NodeConfig);

  /**
   * 渲染面板内容
   * 优先使用自定义面板组件，否则使用动态表单
   */
  const renderContent = () => {
    // 优先使用自定义面板组件
    if (nodeConfig?.propertyPanel) {
      const CustomPanel = nodeConfig?.propertyPanel;
      return (
        <CustomPanel
          nodeId={selectedNode.id}
          data={selectedNode.data as WorkflowNodeData}
        />
      );
    }

    // 使用 formSchema 动态渲染
    if (nodeConfig?.formSchema && nodeConfig?.formSchema.length > 0) {
      return (
        <DynamicForm
          nodeId={selectedNode.id}
          data={selectedNode.data as WorkflowNodeData}
          schema={nodeConfig?.formSchema}
        />
      );
    }

    // 没有配置表单
    return (
      <div className="p-4">
        <Empty description="暂无可配置项" />
      </div>
    );
  };

  return (
    <div
      className="w-96 bg-white rounded-lg shadow-lg border border-gray-200
                  flex flex-col h-[calc(100vh-240px)] overflow-hidden"
    >
      {/* 面板头部 */}
      <div
        className="h-12 px-4 flex items-center justify-between
                    border-b border-gray-200 flex-shrink-0
                    bg-gray-50 rounded-t-lg"
      >
        <div className="flex items-center gap-2">
          {/* 节点图标 */}
          <span className="text-lg">{nodeConfig?.icon}</span>
          {/* 节点类型名称 */}
          <span className="font-medium text-gray-800">{nodeConfig?.label}</span>
        </div>
        {/* 关闭按钮 */}
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={() => setSelectedNodeId(null)}
          className="text-gray-400 hover:text-gray-600"
        />
      </div>

      {/* 面板内容 */}
      <div className="flex-1 overflow-y-auto p-4">{renderContent()}</div>
    </div>
  );
};
