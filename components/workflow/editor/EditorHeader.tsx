"use client";

import React from "react";
import { Button, Space, Tooltip } from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useWorkflowStore } from "@/lib/stores/workflowStore";
import { useOptimizedRouter } from "@/lib/hooks/useOptimizedRouter";

export const EditorHeader: React.FC = () => {
  const router = useOptimizedRouter();
  // 从 Store 中只取需要的字段，而不是整个 store
  // 这样可以避免不必要的重渲染（当其他字段变化时，本组件不会重渲染）
  const { workflow, isDirty } = useWorkflowStore();

  const handleBack = () => {
    // TODO: 后续可以在这里添加「有未保存修改」的确认弹窗
    router.push("/workflow/list");
  };

  const handleSave = () => {
    // TODO: 调用保存接口
    console.log("保存工作流");
  };

  const handlePublish = () => {
    // TODO: 调用发布接口
    console.log("发布工作流");
  };
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
      {/* 左侧区域 */}
      <div className="flex items-center space-x-4">
        {/* 返回按钮 */}
        <Tooltip title="返回列表">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack}>
            返回
          </Button>
        </Tooltip>

        {/* 分隔线：使用一个细长的 div 模拟 */}
        <div className="h-4 w-px bg-gray-300" />

        {/* 工作流名称和未保存提示 */}
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-800">
            {/* 使用可选链和默认值，防止 workflow 为 null 时报错 */}
            {workflow?.name || "未命名工作流"}
          </span>
          {/* 条件渲染：只有 isDirty 为 true 时才显示 */}
          {isDirty && (
            <span className="text-xs text-orange-500">（未保存）</span>
          )}
        </div>

        <span className="text-gray-400 text-sm">ID: {workflow?.id || "-"}</span>
      </div>

      {/* 右侧操作按钮 */}
      <Space>
        <Button icon={<SaveOutlined />} onClick={handleSave}>
          保存
        </Button>
        <Button type="primary" icon={<SendOutlined />} onClick={handlePublish}>
          发布
        </Button>
      </Space>
    </header>
  );
};
