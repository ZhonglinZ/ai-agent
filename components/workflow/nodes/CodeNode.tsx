/**
 * 代码节点组件
 *
 * 用于执行自定义代码（JavaScript 或 Python）
 */
"use client";

import React from "react";
import { CodeOutlined } from "@ant-design/icons";
import { BaseNode } from "./BaseNode";
import type { CodeNodeData } from "@/lib/workflow/types";

/**
 * 编程语言显示文本映射
 */
const languageLabels: Record<CodeNodeData["language"], string> = {
  javascript: "JavaScript",
  python: "Python",
};

interface CodeNodeProps {
  id: string;
  data: CodeNodeData;
  selected?: boolean;
}

/**
 * 代码节点组件
 */
export const CodeNode: React.FC<CodeNodeProps> = ({ id, data, selected }) => {
  return (
    <BaseNode
      id={id}
      selected={selected}
      icon={<CodeOutlined />}
      title={data.label}
      subtitle={languageLabels[data.language]}
      color="orange"
      showInput={true}
      showOutput={true}
    />
  );
};
