"use client";

import React, { useState, useEffect } from "react";
import { Button, Tag, Space, Modal, message } from "antd";
import { PlusOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { MainLayout } from "@/components/layouts/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { useOptimizedRouter } from "@/lib/hooks/useOptimizedRouter";
import { workflowService } from "@/lib/services/workflow.service";
import { Workflow, runModeMap, statusMap } from "@/lib/types/workflow";

const WorkflowList = () => {
  const router = useOptimizedRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const breadcrumbs = [{ title: "工作流管理" }, { title: "工作流列表" }];

  // 获取工作流列表
  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const data = await workflowService.getWorkflows();
      setWorkflows(data);
    } catch (error) {
      message.error("获取工作流列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  // 新建工作流
  const handleCreate = async () => {
    try {
      setCreating(true);
      const { workflowId } = await workflowService.createWorkflow();
      router.push(`/workflow/editor?workflowId=${workflowId}`);
    } catch (error) {
      message.error("创建工作流失败");
    } finally {
      setCreating(false);
    }
  };

  // 查看详情
  const handleViewDetail = (record: Workflow) => {
    router.push(`/workflow/editor?workflowId=${record.id}`);
  };

  // 删除工作流
  const handleDelete = (record: Workflow) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除工作流 "${record.name}" 吗？`,
      okText: "确认",
      cancelText: "取消",
      onOk: async () => {
        const success = await workflowService.deleteWorkflow(record.id);
        if (success) {
          message.success("删除成功");
          // 刷新列表
          fetchWorkflows();
        } else {
          message.error("删除失败");
        }
      },
    });
  };

  const columns: ColumnsType<Workflow> = [
    {
      title: "工作流名称",
      dataIndex: "name",
      key: "name",
      width: 180,
    },
    {
      title: "运行方式",
      dataIndex: "runMode",
      key: "runMode",
      width: 120,
      render: (runMode: Workflow["runMode"]) => (
        <Tag color={runMode === "periodic" ? "blue" : "green"}>
          {runModeMap[runMode]}
        </Tag>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: Workflow["status"]) => (
        <Tag color={status === "online" ? "success" : "default"}>
          {statusMap[status]}
        </Tag>
      ),
    },
    {
      title: "起点",
      dataIndex: "startPoint",
      key: "startPoint",
      width: 150,
    },
    {
      title: "终点",
      dataIndex: "endPoint",
      key: "endPoint",
      width: 150,
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="工作流列表"
        subtitle="管理和配置工作流"
        breadcrumbs={breadcrumbs}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={creating}
            onClick={handleCreate}
          >
            新建工作流
          </Button>
        }
      />
      <DataTable
        columns={columns}
        dataSource={workflows}
        rowKey="id"
        loading={loading}
        pagination={{
          total: workflows.length,
          pageSize: 10,
          current: 1,
        }}
      />
    </MainLayout>
  );
};

export default WorkflowList;
