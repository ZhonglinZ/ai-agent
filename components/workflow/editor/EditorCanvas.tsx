"use client";

import React from "react";
import { useWorkflowStore } from "@/stores/workflowStore";

export const EditorCanvas: React.FC = () => {
  // 从 Store 获取工作流数据，用于显示一些基本信息
  const { workflow } = useWorkflowStore();

  return (
    <div className="flex-1 bg-gray-50 flex items-center justify-center relative overflow-hidden">
      {/* 网格背景层 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />

      {/* 内容层：使用 relative 和 z-10 确保显示在网格之上 */}
      <div className="relative z-10 text-center">
        <div className="text-gray-400 text-lg mb-4">工作流画布区域</div>
        <div className="text-gray-300 text-sm space-y-1">
          <p>工作流名称: {workflow?.name || "-"}</p>
          <p>
            运行方式: {workflow?.runMode === "once" ? "单次运行" : "周期运行"}
          </p>
          <p>状态: {workflow?.status === "online" ? "已上线" : "未上线"}</p>
        </div>
        <div className="mt-6 text-gray-300 text-xs">
          后续将集成 ReactFlow 实现节点拖拽功能
        </div>
      </div>
    </div>
  );
};
