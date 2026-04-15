"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type NodeTypes,
  type NodeMouseHandler,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useWorkflowStore } from "@/lib/stores/workflowStore";
import { initializeNodeRegistry } from "@/lib/workflow/registerNodes";
import { WorkflowNode, NodeType } from "@/lib/workflow/types";
import { StartNode } from "@/components/workflow/nodes/StartNode";
import { EndNode } from "@/components/workflow/nodes/EndNode";
import { PropertyPanel } from "@/components/workflow/panels";

// 确保节点已注册（模块级别执行，只会执行一次）
initializeNodeRegistry();
export const EditorCanvas: React.FC = () => {
  // 从 Store 获取状态和方法
  const {
    workflow,
    nodes,
    edges,
    setNodes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNodeId,
  } = useWorkflowStore();

  /**
   * 节点类型映射
   *
   * ReactFlow 需要一个 { [nodeType]: NodeComponent } 的映射对象
   * 来渲染不同类型的节点
   *
   * useMemo 确保对象引用稳定，避免 ReactFlow 不必要的重渲染
   */
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      [NodeType.START]: StartNode,
      [NodeType.END]: EndNode,
    }),
    []
  );

  /**
   * 初始化默认节点
   *
   * 当画布为空时，创建一个开始节点和一个结束节点
   */
  useEffect(() => {
    // 如果已经有节点，不需要初始化
    if (nodes.length > 0) return;

    const initialNodes: WorkflowNode[] = [
      {
        id: "start_1",
        type: NodeType.START,
        position: { x: 100, y: 200 },
        data: {
          label: "开始",
          triggerType: "manual",
        },
      },
      {
        id: "end_1",
        type: NodeType.END,
        position: { x: 500, y: 200 },
        data: {
          label: "结束",
          endStatus: "success",
        },
      },
    ];

    setNodes(initialNodes);
  }, [nodes.length, setNodes]);

  /**
   * 处理节点点击事件
   * 设置选中的节点 ID，用于显示属性面板
   */
  const handleNodeClick: NodeMouseHandler<WorkflowNode> = useCallback(
    (_event, node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  /**
   * 处理画布空白区域点击
   * 取消节点选中状态
   */
  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  const handleNodesChange = useCallback((changes: any) => {
    onNodesChange(changes);
  }, []);

  return (
    <div className="flex-1 h-full overflow-y-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        // snapToGrid
        // snapGrid={[20, 20]}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: true,
        }}
      >
        {/* 背景网格 */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#e2e8f0"
        />

        {/* 控制栏：缩放、居中等按钮 */}
        <Controls
          showZoom={true}
          showFitView={true}
          showInteractive={false}
          position="bottom-left"
        />

        {/* 小地图：全局视图 */}
        <MiniMap
          nodeColor="#3b82f6"
          maskColor="rgba(0, 0, 0, 0.1)"
          position="bottom-right"
        />

        <Panel position="top-right" className="m-0 p-0">
          <PropertyPanel />
        </Panel>
      </ReactFlow>
    </div>
  );
};
