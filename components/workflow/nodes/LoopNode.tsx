/**
 * 循环节点组件
 *
 * 对外 1 入 1 出；双击可进入子图画布编辑循环体
 */
"use client";

import React, { useState } from "react";
import { DownOutlined, RetweetOutlined, RightOutlined } from "@ant-design/icons";
import { Position } from "@xyflow/react";
import type { LoopNodeData } from "@/lib/workflow/types";
import { CustomHandle } from "./CustomHandle";

interface LoopNodeProps {
  id: string;
  data: LoopNodeData;
  selected?: boolean;
}

export const LoopNode: React.FC<LoopNodeProps> = ({ data, selected }) => {
  const [showOutputs, setShowOutputs] = useState(true);
  const maxIterations = data.maxIterations || 5;
  const outputs = data.outputs || [];
  const hasBreak = Boolean(data.breakCondition?.trim());

  return (
    <div
      className={`
        min-w-[220px] rounded-xl shadow-sm bg-white border-2
        ${selected ? "border-blue-500 shadow-md" : "border-gray-200"}
        transition-all duration-200
      `}
    >
      <CustomHandle type="target" position={Position.Left} />

      <div className="flex items-center gap-3 p-3 pb-2">
        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-sm">
          <RetweetOutlined />
        </div>
        <div className="min-w-0">
          <div className="font-medium text-sm text-gray-800 truncate">
            {data.label || "循环"}
          </div>
          <div className="text-xs text-gray-400">双击编辑循环体</div>
        </div>
      </div>

      <div className="mx-3 mb-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
        <div className="text-xs text-gray-500 mb-1">最大迭代</div>
        <div className="text-sm text-gray-800">最多 {maxIterations} 次</div>
        {hasBreak && (
          <div className="mt-1 text-xs text-gray-400 truncate">
            退出：{data.breakCondition}
          </div>
        )}
      </div>

      <div className="mx-3 mb-3">
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

        {showOutputs && (
          <div className="mt-1 space-y-1">
            {outputs.length === 0 ? (
              <div className="text-xs text-gray-400">未配置输出</div>
            ) : (
              outputs.map((output) => (
                <div
                  key={output.id}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="text-gray-800 font-medium">
                    {output.name || "未命名"}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <CustomHandle type="source" position={Position.Right} />
    </div>
  );
};
