/**
 * 知识库节点组件
 *
 * 用于调用知识库生成内容
 * 显示知识库信息和输出变量列表
 */
"use client";

import React, { useState } from "react";
import { DownOutlined, RightOutlined, BookOutlined } from "@ant-design/icons";
import { Position } from "@xyflow/react";
import type { KnowledgeNodeData } from "@/lib/workflow/types";
import { CustomHandle } from "./CustomHandle";

interface KnowledgeNodeProps {
  id: string;
  data: KnowledgeNodeData;
  selected?: boolean;
}

/**
 * 大模型节点组件
 */
export const KnowledgeNode: React.FC<KnowledgeNodeProps> = ({
  id,
  data,
  selected,
}) => {
  const [showOutputs, setShowOutputs] = useState(true);
  const { knowledgeBaseName } = data;
  return (
    <div
      className={`
        min-w-[220px] rounded-xl shadow-sm
        bg-white
        border-2
        ${selected ? "border-blue-500 shadow-md" : "border-gray-200"}
        transition-all duration-200
      `}
    >
      {/* 输入连接点 */}
      <CustomHandle type="target" position={Position.Left} />

      {/* 节点头部 */}
      <div className="flex items-center gap-3 p-3 pb-2">
        {/* 图标 */}
        <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center text-white text-sm">
          <BookOutlined />
        </div>

        {/* 标题 */}
        <div className="font-medium text-sm text-gray-800">知识库</div>
      </div>

      {/* 模型信息区域 */}
      <div className="mx-3 mb-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
        <div className="text-xs text-gray-500 mb-1">知识库名称</div>
        <div
          className={`text-sm ${
            knowledgeBaseName ? "text-gray-800" : "text-gray-400"
          }`}
        >
          {knowledgeBaseName}
        </div>
      </div>

      {/* 输出区域 */}
      <div className="mx-3 mb-3">
        {/* 输出标题（可折叠） */}
        <div
          className="flex items-center gap-1 cursor-pointer select-none py-1"
          onClick={() => setShowOutputs(!showOutputs)}
        >
          <span className="text-xs text-gray-600 font-medium">输出</span>
          {showOutputs ? (
            <DownOutlined className="text-[10px] text-gray-400" />
          ) : (
            <RightOutlined className="text-[10px] text-gray-400" />
          )}
        </div>

        {/* 输出变量列表 */}
        {showOutputs && data.outputs && data.outputs.length > 0 && (
          <div className="mt-1 space-y-1">
            {data.outputs.map((output) => (
              <div
                key={output.name}
                className="flex items-center gap-2 text-xs"
              >
                <span className="text-gray-800 font-medium">{output.name}</span>
                <span className="text-gray-400">{output.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 输出连接点 */}
      <CustomHandle type="source" position={Position.Right} />
    </div>
  );
};
