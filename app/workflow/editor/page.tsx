"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Spin, Button, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { MainLayout } from "@/components/layouts/MainLayout";
import { EditorHeader, EditorCanvas } from "@/components/workflow/editor";
import { useWorkflowStore } from "@/lib/stores/workflowStore";
import { useOptimizedRouter } from "@/lib/hooks/useOptimizedRouter";
import { workflowService } from "@/lib/services/workflow.service";

const WorkflowEditorPage = () => {
  const router = useOptimizedRouter();
  const searchParams = useSearchParams();
  // 从 URL 获取 workflowId，例如 /workflow/editor?workflowId=123
  const workflowId = searchParams.get("workflowId");

  // 从 Store 获取状态和方法
  // 注意：这里我们同时获取了 state 和 actions
  const { workflow, isLoading, setWorkflow, setLoading, reset } =
    useWorkflowStore();
  useEffect(() => {
    const fetchWorkflow = async () => {
      // 参数校验：如果没有 workflowId，直接报错并结束加载
      if (!workflowId) {
        message.error("缺少工作流 ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 调用服务层获取数据
        const data = await workflowService.getWorkflowById(workflowId);

        if (data != null) {
          // 数据存入 Store，所有子组件都可以访问
          setWorkflow(data);
        } else {
          message.error("工作流不存在");
          setWorkflow(null);
        }
      } catch (error) {
        message.error("获取工作流详情失败");
        setWorkflow(null);
      }
    };

    fetchWorkflow();

    // 清理函数：组件卸载时重置 Store 状态
    return () => {
      reset();
    };
  }, [workflowId, setWorkflow, setLoading, reset]);
  // 状态1：加载中
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <Spin size="large" tip="加载中..." />
        </div>
      </MainLayout>
    );
  }

  // 状态2：工作流不存在（可能被删除或 ID 无效）
  if (!workflow) {
    return (
      <MainLayout>
        <div className="flex flex-col justify-center items-center h-screen">
          <div className="text-gray-500 text-lg mb-4">
            工作流不存在或已被删除
          </div>
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/workflow/list")}
          >
            返回列表
          </Button>
        </div>
      </MainLayout>
    );
  }

  // 状态3：正常渲染编辑器
  return (
    <MainLayout>
      <div className="h-screen flex flex-col">
        <EditorHeader />
        <EditorCanvas />
      </div>
    </MainLayout>
  );
};

export default WorkflowEditorPage;
