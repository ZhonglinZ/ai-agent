"use client";

import React from "react";
import { BranchesOutlined } from "@ant-design/icons";
import { Handle, Position } from "@xyflow/react";
import type { BranchNodeData } from "@/lib/workflow/types";

interface BranchNodeProps {
  data: BranchNodeData;
  selected?: boolean;
}

export const BranchNode: React.FC<BranchNodeProps> = ({ data, selected }) => {
  return (
    <div
      className={`
      min-w-[280px] rounded-xl shadow-sm bg-white border-2
      ${selected ? "border-blue-500 shadow-md" : "border-gray-200"}
      transition-all duration-200
    `}
    >
      {/* 输入连接点 */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />

      {/* 节点头部 */}
      <div className="flex items-center gap-3 p-3 pb-2">
        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-sm">
          <BranchesOutlined />
        </div>
        <div className="font-medium text-sm text-gray-800">{data.label}</div>
      </div>

      {/* 分支列表 */}
      <div className="px-3 pb-3 space-y-2">
        {/* 条件分支 */}
        {data.branches &&
          data.branches.length > 0 &&
          data.branches.map((branch) => (
            <div
              key={branch.id}
              className="relative bg-gray-50 rounded-lg px-3 py-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-800 font-medium">
                  {branch.label}
                </span>
              </div>

              {/* 该分支的输出连接点 */}
              <Handle
                type="source"
                position={Position.Right}
                id={branch.id} // 关键：使用分支 ID 作为 Handle ID
                className="w-3! h-3! bg-blue-500! border-2! border-white! absolute!"
                style={{
                  top: "50%",
                  right: "-18px",
                  transform: "translateY(-50%)",
                }}
              />
            </div>
          ))}

        {/* 默认分支（否则） */}
        {data.showElseBranch && (
          <div className="relative bg-gray-50 rounded-lg px-3 py-2.5">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-800 font-medium">否则</span>
              <span className="text-xs text-gray-400">
                用于定义当 if 条件不满足时应执行的逻辑。
              </span>
            </div>

            {/* 默认分支的输出连接点 */}
            <Handle
              type="source"
              position={Position.Right}
              id="else" // 固定 ID
              className="w-3! h-3! bg-blue-500! border-2! border-white! absolute!"
              style={{
                top: "50%",
                right: "-18px",
                transform: "translateY(-50%)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
