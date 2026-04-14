"use client";

import React from "react";
import { StopOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { BaseNode } from "./BaseNode";
import type { EndNodeData } from "@/lib/workflow/types";

export interface EndNodeProps {
  id: string;
  data: EndNodeData;
  selected?: boolean;
}

const statusConfig = {
  success: {
    icon: <CheckCircleOutlined />,
    label: "成功结束",
    color: "green" as const,
  },
  failure: {
    icon: <StopOutlined />,
    label: "失败结束",
    color: "red" as const,
  },
};

export const EndNode: React.FC<EndNodeProps> = ({ id, data, selected }) => {
  const config = statusConfig[data.endStatus];

  return (
    <BaseNode
      id={id}
      selected={selected}
      icon={config.icon}
      title={data.label}
      subtitle={config.label}
      color={config.color}
      showInput={true}
      showOutput={false} // 结束节点没有输出
    />
  );
};
