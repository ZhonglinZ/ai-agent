"use client";

import React from "react";
import { PlayCircleOutlined } from "@ant-design/icons";
import { BaseNode } from "./BaseNode";
import type { StartNodeData } from "@/lib/workflow/types";

/**
 * 开始节点组件 Props
 *
 * ReactFlow 会传入这些属性：
 * - id: 节点 ID
 * - data: 节点数据（我们定义的 StartNodeData）
 * - selected: 是否被选中
 */
export interface StartNodeProps {
  id: string;
  data: StartNodeData;
  selected?: boolean;
}

/**
 * 触发类型的中文标签
 */
const triggerTypeLabels: Record<StartNodeData["triggerType"], string> = {
  manual: "手动触发",
  schedule: "定时触发",
  webhook: "Webhook 触发",
};

export const StartNode: React.FC<StartNodeProps> = ({ id, data, selected }) => {
  return (
    <BaseNode
      id={id}
      selected={selected}
      icon={<PlayCircleOutlined />}
      title={data.label}
      subtitle={triggerTypeLabels[data.triggerType]}
      color="green"
      showInput={false} // 开始节点没有输入
      showOutput={true}
    />
  );
};
