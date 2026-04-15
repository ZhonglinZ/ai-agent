/**
 * 节点选择器组件
 *
 * 显示所有可添加的节点类型，点击后进入放置模式
 */
"use client";

import React from "react";
import { useWorkflowStore } from "@/lib/stores/workflowStore";
import { nodeRegistry, NodeType } from "@/lib/workflow";

interface NodeSelectorProps {
  /** 选择节点后的回调（用于关闭弹窗） */
  onSelect?: () => void;
}

export const NodeSelector: React.FC<NodeSelectorProps> = ({ onSelect }) => {
  const startPlacingNode = useWorkflowStore((state) => state.startPlacingNode);

  // 获取所有可添加的节点（排除开始节点，因为只能有一个）
  const availableNodes = React.useMemo(() => {
    const allConfigs = nodeRegistry.getAll();
    return allConfigs.filter((config) => config.type !== NodeType.START);
  }, []);

  const handleNodeClick = (type: NodeType) => {
    startPlacingNode(type);
    onSelect?.();
  };

  return (
    <div className="w-64 max-h-80 overflow-y-auto">
      <div className="space-y-1">
        {availableNodes.map((config) => (
          <div
            key={config.type}
            className="flex items-start gap-3 p-3 rounded-lg cursor-pointer
                       hover:bg-gray-50 transition-colors"
            onClick={() => handleNodeClick(config.type)}
          >
            {/* 节点图标 */}
            <div
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100
                            flex items-center justify-center text-gray-600"
            >
              {config.icon}
            </div>

            {/* 节点信息 */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-sm">
                {config.label}
              </div>
              <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                {config.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
