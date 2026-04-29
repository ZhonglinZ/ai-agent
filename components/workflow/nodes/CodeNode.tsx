/**
 * 代码节点组件
 *
 * 用于执行自定义代码（JavaScript 或 Python）
 */
"use client";

import React, { useState } from "react";
import { CodeOutlined, DownOutlined, RightOutlined } from "@ant-design/icons";
import type { CodeNodeData } from "@/lib/workflow/types";
import { Position } from "@xyflow/react";
import { CustomHandle } from "./CustomHandle";

interface CodeNodeProps {
  id: string;
  data: CodeNodeData;
  selected?: boolean;
}

/**
 * 代码节点组件
 */
export const CodeNode: React.FC<CodeNodeProps> = ({ id, data, selected }) => {
  const [showInputs, setShowInputs] = useState(true);
  const [showOutputs, setShowOutputs] = useState(true);

  return (
    <div
      className={`
      min-w-[220px] rounded-xl shadow-sm bg-white border-2 
      ${selected ? "border-blue-500 shadow-md" : "border-gray-200"}
      transition-all duration-200
    `}
    >
      {/* 输入连接点 */}
      <CustomHandle type="target" position={Position.Left} />

      {/* 节点头部 */}
      <div className="flex items-center gap-3 p-3 pb-2">
        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white">
          <CodeOutlined />
        </div>
        <div className="font-medium text-sm text-gray-800">{data.label}</div>
      </div>

      {/* 输入变量区域（可折叠） */}
      {data.inputs?.length > 0 && (
        <div className="mx-3 mb-2">
          <div
            className="flex items-center gap-1 cursor-pointer py-1"
            onClick={() => setShowInputs(!showInputs)}
          >
            <span className="text-xs text-gray-600 font-medium">输入</span>
            {showInputs ? <DownOutlined /> : <RightOutlined />}
          </div>
          {showInputs && (
            <div className="mt-1 space-y-1">
              {data.inputs.map((input) => (
                <div
                  key={input.id}
                  className="text-xs text-gray-800 font-medium"
                >
                  {input.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 输出变量区域（可折叠） */}
      {data.outputs?.length > 0 && (
        <div className="mx-3 mb-2">
          <div
            className="flex items-center gap-1 cursor-pointer py-1"
            onClick={() => setShowOutputs(!showOutputs)}
          >
            <span className="text-xs text-gray-600 font-medium">输出</span>
            {showOutputs ? <DownOutlined /> : <RightOutlined />}
          </div>
          {showOutputs && (
            <div className="mt-1 space-y-1">
              {data.outputs.map((output) => (
                <div
                  key={output.type}
                  className="text-xs text-gray-800 font-medium"
                >
                  {output.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 输出连接点 */}
      <CustomHandle type="source" position={Position.Right} />
    </div>
  );
};
