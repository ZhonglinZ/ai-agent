// components/workflow/panels/RunPanel.tsx

import React, { useRef, useEffect, useState } from "react";
import { Button, Collapse, Tag } from "antd";
import type { CollapseProps } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  MinusCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useWorkflowStore } from "@/lib/stores/workflowStore";
import {
  useWorkflowRunStore,
  selectIsRunning,
  selectLogs,
} from "@/lib/stores/workflowRunStore";
import {
  NodeExecutionStatus,
  WorkflowRunStatus,
} from "@/lib/workflow/engine/types";

/**
 * 格式化时间戳
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/**
 * 格式化持续时间
 */
function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * 获取状态对应的图标
 */
function getStatusIcon(status: NodeExecutionStatus) {
  switch (status) {
    case NodeExecutionStatus.SUCCESS:
      return <CheckCircleOutlined className="text-green-500" />;
    case NodeExecutionStatus.FAILED:
      return <CloseCircleOutlined className="text-red-500" />;
    case NodeExecutionStatus.RUNNING:
      return <LoadingOutlined className="text-blue-500" spin />;
    case NodeExecutionStatus.SKIPPED:
      return <MinusCircleOutlined className="text-gray-400" />;
    case NodeExecutionStatus.PENDING:
    default:
      return <ClockCircleOutlined className="text-gray-400" />;
  }
}

/**
 * 获取工作流状态对应的标签
 */
function getWorkflowStatusTag(status: WorkflowRunStatus) {
  switch (status) {
    case WorkflowRunStatus.SUCCESS:
      return <Tag color="success">执行成功</Tag>;
    case WorkflowRunStatus.FAILED:
      return <Tag color="error">执行失败</Tag>;
    case WorkflowRunStatus.RUNNING:
      return <Tag color="processing">执行中...</Tag>;
    case WorkflowRunStatus.STOPPED:
      return <Tag color="warning">已停止</Tag>;
    case WorkflowRunStatus.PAUSED:
      return <Tag color="warning">已暂停(可续跑)</Tag>;
    case WorkflowRunStatus.IDLE:
      return <Tag color="default">待运行</Tag>;
    default:
      return <Tag color="default">待运行</Tag>;
  }
}

export const RunPanel: React.FC = () => {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(0); // 运行时长使用本地状态

  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);

  const status = useWorkflowRunStore((state) => state.status);
  const isRunning = useWorkflowRunStore(selectIsRunning);
  const nodeStatuses = useWorkflowRunStore((state) => state.nodeStatuses);
  const nodeResults = useWorkflowRunStore((state) => state.nodeResults);
  const logs = useWorkflowRunStore(selectLogs);
  const startTime = useWorkflowRunStore((state) => state.startTime);
  const endTime = useWorkflowRunStore((state) => state.endTime);

  const lastCheckpoint = useWorkflowRunStore((state) => state.lastCheckpoint);
  const startRun = useWorkflowRunStore((state) => state.startRun);
  const resumeRun = useWorkflowRunStore((state) => state.resumeRun);
  const stopRun = useWorkflowRunStore((state) => state.stopRun);
  const isPanelOpen = useWorkflowRunStore((state) => state.isPanelOpen);
  const togglePanel = useWorkflowRunStore((state) => state.togglePanel);

  const canResume =
    status === WorkflowRunStatus.PAUSED && lastCheckpoint !== null;
  // 自动滚动到最新日志
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // 更新运行时长（使用定时器避免无限循环）
  useEffect(() => {
    if (!startTime) {
      setDuration(0);
      return;
    }
    if (endTime) {
      setDuration(endTime - startTime);
      return;
    }
    if (isRunning) {
      const timer = setInterval(() => {
        setDuration(Date.now() - startTime);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, endTime, isRunning]);

  // 如果面板关闭，不渲染
  if (!isPanelOpen) return null;

  // 构建 Collapse items（直接构建，不使用 useMemo 避免依赖项问题）
  const collapseItems: CollapseProps["items"] = [];

  // 节点状态面板
  collapseItems.push({
    key: "nodes",
    label: (
      <span className="font-medium text-gray-700">
        节点状态 ({nodes.length})
      </span>
    ),
    children: (
      <div className="space-y-2 px-2 h-48 overflow-auto">
        {nodes.map((node) => {
          const nodeStatus =
            nodeStatuses[node.id] || NodeExecutionStatus.PENDING;
          const nodeResult = nodeResults.find((r) => r.nodeId === node.id);

          return (
            <div
              key={node.id}
              className={`flex items-center justify-between p-2 rounded border ${
                nodeStatus === NodeExecutionStatus.SUCCESS
                  ? "border-green-200 bg-green-50"
                  : nodeStatus === NodeExecutionStatus.FAILED
                    ? "border-red-200 bg-red-50"
                    : nodeStatus === NodeExecutionStatus.RUNNING
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                {getStatusIcon(nodeStatus)}
                <span className="text-sm text-gray-700">{node.data.label}</span>
              </div>
              {nodeResult?.duration && (
                <span className="text-xs text-gray-400">
                  {formatDuration(nodeResult.duration)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    ),
  });

  // 执行日志面板
  collapseItems.push({
    key: "logs",
    label: (
      <span className="font-medium text-gray-700">
        执行日志 ({logs.length})
      </span>
    ),
    children: (
      <div className="h-48 overflow-y-auto bg-gray-900 rounded p-2 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            暂无日志，点击运行按钮开始执行
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`py-0.5 ${
                log.type === "error"
                  ? "text-red-400"
                  : log.type === "success"
                    ? "text-green-400"
                    : "text-gray-300"
              }`}
            >
              <span className="text-gray-500">
                [{formatTimestamp(log.timestamp)}]
              </span>{" "}
              {log.message}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    ),
  });

  return (
    <div className="w-96 bg-white rounded-lg shadow-lg">
      {/* 头部 */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <h3>运行面板</h3>
          <button
            className="text-gray-400 hover:text-gray-600 text-lg"
            onClick={() => togglePanel()}
          >
            ×
          </button>
        </div>
        {getWorkflowStatusTag(status)}
        {duration > 0 && <span>耗时: {formatDuration(duration)}</span>}
      </div>

      {/* 使用 items 属性而非 children */}
      <Collapse
        defaultActiveKey={["nodes", "logs"]}
        ghost
        items={collapseItems}
      />

      {/* 操作按钮 */}
      <div className="px-4 py-3 border-t flex justify-end gap-2">
        {isRunning ? (
          <Button danger icon={<StopOutlined />} onClick={stopRun}>
            停止
          </Button>
        ) : canResume ? (
          <>
            <Button onClick={() => startRun(nodes, edges)}>重新运行</Button>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => resumeRun(nodes, edges)}
            >
              从断点继续
            </Button>
          </>
        ) : (
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => startRun(nodes, edges)}
          >
            运行
          </Button>
        )}
      </div>
    </div>
  );
};
