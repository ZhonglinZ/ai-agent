/**
 * 节点快速选择器组件
 *
 * 从节点操作按钮弹出，显示可添加的节点列表
 * 按照节点分类分组显示
 */
"use client";

import React, { useMemo } from "react";
import {
  RobotOutlined,
  StopOutlined,
  BranchesOutlined,
  CodeOutlined,
  ApiOutlined,
} from "@ant-design/icons";
import { nodeRegistry } from "@/lib/workflow/nodeRegistry";
import { NodeType } from "@/lib/workflow/types";

interface NodeHoverMenuProps {
  /** 源节点 ID */
  sourceNodeId: string;
  /** 选择节点类型后的回调 */
  onSelect: (type: NodeType) => void;
  /** 关闭选择器 */
  onClose: () => void;
}

/**
 * 节点分类配置
 */
const nodeCategories = [
  {
    key: "basic",
    label: "基础",
    types: [NodeType.LLM, NodeType.END],
  },
  {
    key: "logic",
    label: "逻辑",
    types: [NodeType.BRANCH],
  },
  {
    key: "tools",
    label: "工具",
    types: [NodeType.CODE, NodeType.API],
  },
];

/**
 * 节点图标映射
 */
const nodeIcons: Record<NodeType, React.ReactNode> = {
  [NodeType.START]: null, // 开始节点不显示
  [NodeType.END]: <StopOutlined className="text-red-500" />,
  [NodeType.LLM]: <RobotOutlined className="text-blue-500" />,
  [NodeType.CODE]: <CodeOutlined className="text-orange-500" />,
  [NodeType.API]: <ApiOutlined className="text-green-500" />,
  [NodeType.BRANCH]: <BranchesOutlined className="text-yellow-600" />,
};

/**
 * 节点标签映射
 */
const nodeLabels: Record<NodeType, string> = {
  [NodeType.START]: "开始",
  [NodeType.END]: "结束",
  [NodeType.LLM]: "大模型",
  [NodeType.CODE]: "代码",
  [NodeType.API]: "API",
  [NodeType.BRANCH]: "分支器",
};

/**
 * 节点快速选择器
 */
export const NodeHoverMenu: React.FC<NodeHoverMenuProps> = ({
  sourceNodeId,
  onSelect,
  onClose,
}) => {
  // 获取所有可添加的节点（排除开始节点）
  const availableCategories = useMemo(() => {
    return nodeCategories
      .map((category) => ({
        ...category,
        nodes: category.types
          .filter((type) => nodeRegistry.has(type))
          .map((type) => ({
            type,
            icon: nodeIcons[type],
            label: nodeLabels[type],
          })),
      }))
      .filter((category) => category.nodes.length > 0);
  }, []);

  return (
    <div className="w-40 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden py-2">
      {availableCategories.map((category, categoryIndex) => (
        <div key={category.key}>
          {/* 分类标题 */}
          <div className="px-3 py-1 text-xs text-gray-400 font-medium">
            {category.label}
          </div>

          {/* 节点列表 */}
          {category.nodes.map((node) => (
            <div
              key={node.type}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => {
                onSelect(node.type);
                onClose();
              }}
            >
              <span className="w-5 h-5 flex items-center justify-center">
                {node.icon}
              </span>
              <span className="text-sm text-gray-700">{node.label}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
