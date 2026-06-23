"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Input,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import { MainLayout } from "@/components/layouts/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { useOptimizedRouter } from "@/lib/hooks/useOptimizedRouter";
import { agentService } from "@/lib/services/agent.service";
import type { Agent, AgentStatus } from "@/lib/types/agent";

const { Text } = Typography;

const STATUS_LABEL_MAP: Record<AgentStatus, string> = {
  published: "已发布",
  draft: "草稿",
  offline: "已下线",
};

const STATUS_COLOR_MAP: Record<AgentStatus, string> = {
  published: "green",
  draft: "gold",
  offline: "default",
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AgentList = () => {
  const router = useOptimizedRouter();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const breadcrumbs = [{ title: "智能体管理" }, { title: "智能体列表" }];

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const data = await agentService.getAgents();
      setAgents(data);
    } catch (error) {
      message.error("获取智能体列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAgents();
  }, []);

  const filteredAgents = useMemo(() => {
    if (!searchKeyword.trim()) return agents;
    const keyword = searchKeyword.trim().toLowerCase();
    return agents.filter((agent) => {
      const haystack = `${agent.name} ${agent.description}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [agents, searchKeyword]);

  const handleDelete = async (id: string) => {
    const success = await agentService.deleteAgent(id);
    if (success) {
      message.success("已删除智能体");
      void fetchAgents();
    } else {
      message.error("删除失败");
    }
  };

  const handleCreate = async () => {
    try {
      setCreating(true);
      const { agentId } = await agentService.createAgent();
      router.push(`/agent/editor?id=${agentId}`);
    } catch (error) {
      message.error("创建智能体失败");
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/agent/editor?id=${id}`);
  };

  const columns: ColumnsType<Agent> = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      width: 240,
      render: (name: string, record: Agent) => (
        <div className="flex flex-col">
          <span className="text-gray-900 font-medium">{name}</span>
          {/* <Text type="secondary" className="text-xs">
            ID: {record.id}
          </Text> */}
        </div>
      ),
    },
    {
      title: "发布状态",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status: AgentStatus) => (
        <Tag color={STATUS_COLOR_MAP[status]}>{STATUS_LABEL_MAP[status]}</Tag>
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      render: (description: string) => (
        <Text type="secondary" ellipsis={{ tooltip: description }}>
          {description}
        </Text>
      ),
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 180,
      render: (dateStr: string) => (
        <span className="text-gray-500 text-sm">{formatDate(dateStr)}</span>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record.id)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除该智能体吗？"
            okText="删除"
            cancelText="取消"
            onConfirm={() => void handleDelete(record.id)}
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="智能体列表"
        subtitle="管理和配置智能体"
        breadcrumbs={breadcrumbs}
      />
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Input.Search
            allowClear
            placeholder="搜索智能体"
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            className="max-w-xs"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={creating}
            onClick={() => void handleCreate()}
          >
            创建智能体
          </Button>
        </div>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredAgents}
          pagination={{ pageSize: 8 }}
        />
      </div>
    </MainLayout>
  );
};

export default AgentList;
