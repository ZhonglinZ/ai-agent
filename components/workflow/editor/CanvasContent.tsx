"use client";

import React, { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  BackgroundVariant,
  useReactFlow,
  type NodeTypes,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useWorkflowStore } from "@/lib/stores/workflowStore";
import { initializeNodeRegistry, NodeType } from "@/lib/workflow";
import type { WorkflowNode } from "@/lib/workflow";
import { StartNode, EndNode, CodeNode } from "@/components/workflow/nodes";
import { PropertyPanel } from "@/components/workflow/panels";
import {
  CanvasToolbar,
  PlacingNodePreview,
} from "@/components/workflow/toolbar";

// 确保节点已注册
initializeNodeRegistry();

// 节点类型映射（放在组件外部，避免重复创建）
const nodeTypes: NodeTypes = {
  [NodeType.START]: StartNode,
  [NodeType.END]: EndNode,
  [NodeType.CODE]: CodeNode,
};
/**
 * 画布内部组件
 * 需要在 ReactFlowProvider 内部才能使用 useReactFlow
 */
const CanvasContent: React.FC = () => {
  const {
    nodes,
    edges,
    setNodes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNodeId,
    placingNodeType,
    addNode,
    cancelPlacingNode,
  } = useWorkflowStore();

  // 获取 ReactFlow 实例，用于坐标转换
  const reactFlowInstance = useReactFlow();

  // 初始化默认节点
  useEffect(() => {
    if (nodes.length > 0) return;

    const initialNodes: WorkflowNode[] = [
      {
        id: "start_1",
        type: NodeType.START,
        position: { x: 100, y: 200 },
        data: { label: "开始", triggerType: "manual" },
      },
      {
        id: "end_1",
        type: NodeType.END,
        position: { x: 500, y: 200 },
        data: { label: "结束", endStatus: "success" },
      },
    ];

    setNodes(initialNodes);
  }, [nodes.length, setNodes]);

  const handleNodesChange = useCallback((changes: any) => {
    console.log("=== 节点变化 ===", changes);
    onNodesChange(changes);
  }, []);

  // 处理节点点击
  const handleNodeClick: NodeMouseHandler<WorkflowNode> = useCallback(
    (_event, node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  // 处理画布点击（核心：放置节点）
  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (placingNodeType) {
        // 将屏幕坐标转换为画布坐标
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        // 节点预览是以鼠标为中心显示的，所以放置时也要居中
        // 节点大约宽 180px，高 70px，需要偏移一半
        const nodeWidth = 180;
        const nodeHeight = 70;
        const centeredPosition = {
          x: position.x - nodeWidth / 2,
          y: position.y - nodeHeight / 2,
        };

        // 添加节点
        addNode(placingNodeType, centeredPosition);
        // 退出放置模式
        cancelPlacingNode();
      } else {
        // 正常点击，取消选中
        setSelectedNodeId(null);
      }
    },
    [
      placingNodeType,
      reactFlowInstance,
      addNode,
      cancelPlacingNode,
      setSelectedNodeId,
    ]
  );

  // 处理键盘事件（ESC 取消放置）
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && placingNodeType) {
        cancelPlacingNode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [placingNodeType, cancelPlacingNode]);

  return (
    <div
      className={`relative w-full h-full ${
        placingNodeType ? "cursor-crosshair" : ""
      }`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeDragThreshold={50}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{ type: "smoothstep", animated: false }}
        // 使用 proOptions 禁用 attribution（可选）
        proOptions={{ hideAttribution: true }}
      >
        {/* 背景网格 */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#e5e7eb"
        />

        {/* 控制栏（隐藏，用工具栏替代） */}
        <Controls
          showZoom={false}
          showFitView={false}
          showInteractive={false}
          className="hidden"
        />

        {/* 右侧属性面板 */}
        <Panel position="top-right" className="m-0 p-0">
          <PropertyPanel />
        </Panel>

        {/* 底部工具栏 */}
        <Panel position="bottom-center" className="mb-4">
          <CanvasToolbar />
        </Panel>

        {/* 放置模式提示 */}
        {placingNodeType && (
          <Panel position="top-center" className="mt-4">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg text-sm">
              点击画布放置节点，按 ESC 取消
            </div>
          </Panel>
        )}

        {/* 节点放置预览（跟随鼠标） */}
        <PlacingNodePreview />
      </ReactFlow>
    </div>
  );
};

export default CanvasContent;
