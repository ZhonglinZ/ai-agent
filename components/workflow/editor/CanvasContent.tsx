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
import {
  StartNode,
  EndNode,
  CodeNode,
  LLMNode,
} from "@/components/workflow/nodes";
import { PropertyPanel } from "@/components/workflow/panels";
import {
  CanvasToolbar,
  PlacingNodePreview,
} from "@/components/workflow/toolbar";
import { useStore } from "zustand";
import { APINode } from "../nodes/APINode";
import { BranchNode } from "../nodes/BranchNode";
import { getValidPosition } from "@/lib/workflow/collisionAlgorithm";

// 确保节点已注册
initializeNodeRegistry();

// 节点类型映射（放在组件外部，避免重复创建）
const nodeTypes: NodeTypes = {
  [NodeType.START]: StartNode,
  [NodeType.END]: EndNode,
  [NodeType.CODE]: CodeNode,
  [NodeType.LLM]: LLMNode,
  [NodeType.API]: APINode,
  [NodeType.BRANCH]: BranchNode,
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
    enableCollision,
  } = useWorkflowStore();

  // 获取 ReactFlow 实例，用于坐标转换
  const reactFlowInstance = useReactFlow();
  const temporal = useWorkflowStore.temporal.getState();
  // 记录最新坐标
  const dragRef = React.useRef<{
    id: string;
    lastValidPosition: { x: number; y: number };
  } | null>(null);

  // 初始化默认节点
  useEffect(() => {
    if (nodes.length > 0) return;

    const initialNodes: WorkflowNode[] = [
      {
        id: "start_1",
        type: NodeType.START,
        position: { x: 100, y: 200 },
        data: { label: "开始", triggerType: "manual", inputs: [] },
      },
      {
        id: "end_1",
        type: NodeType.END,
        position: { x: 500, y: 200 },
        data: { label: "结束", endStatus: "success", outputVariables: [] },
      },
    ];

    setNodes(initialNodes);
    temporal.clear();
  }, [nodes.length, setNodes]);

  const handleNodesChange = useCallback(
    (changes: any) => {
      // 过滤掉 dimensions 和 position 类型的变化
      // dimensions: ReactFlow 内部自动调整的节点尺寸，不应该被记录
      // position: 由 onNodeDragStop 统一处理
      const importantChanges = changes.filter(
        (change: any) => change.type !== "dimensions",
      );

      if (importantChanges.length > 0) {
        onNodesChange(importantChanges);
      }
    },
    [onNodesChange],
  );

  // 4. 实现拦截器：彻底屏蔽 React Flow 的默认位置更新
  const onNodesChangeIntercepted = useCallback(
    (changes: any) => {
      // 如果关闭了防撞，就什么都不管，直接放行
      if (!enableCollision) {
        onNodesChange(changes);
        return;
      }

      // 如果开启了防撞，过滤掉所有"位置变更"事件，防止 React Flow 自动移动节点
      // 我们将在 handleNodeDrag 中手动控制移动
      const filteredChanges = changes.filter((change: any) => {
        if (
          change.type === "position" &&
          dragRef.current &&
          change.id === dragRef.current.id
        ) {
          return false;
        }
        return true;
      });
      onNodesChange(filteredChanges);
    },
    [onNodesChange, enableCollision],
  );

  // 5. 拖拽开始：记录初始合法状态
  const handleNodeDragStart: NodeMouseHandler = useCallback((_event, node) => {
    dragRef.current = {
      id: node.id,
      lastValidPosition: { ...node.position },
    };
  }, []);

  // 6. 拖拽进行中：实时计算防撞
  const handleNodeDrag: NodeMouseHandler = useCallback(
    (_event, draggedNode) => {
      // 如果关闭了防撞，直接退出
      if (!enableCollision) return;

      const otherNodes = nodes.filter((n) => n.id !== draggedNode.id);

      // 关键：基准位置优先读取 Ref，因为 Ref 永远是"上一步的合法位置"
      const baseNode =
        dragRef.current && dragRef.current.id === draggedNode.id
          ? { ...draggedNode, position: dragRef.current.lastValidPosition }
          : draggedNode;

      // 传入 dimensions 确保计算准确
      const storeNode = nodes.find((n) => n.id === draggedNode.id);
      const nodeWithDimensions = {
        ...draggedNode,
        measured: storeNode?.measured || draggedNode.measured,
      };
      const baseNodeWithDimensions = {
        ...baseNode,
        measured: storeNode?.measured || baseNode.measured,
      };

      // 执行算法
      const validPosition = getValidPosition(
        nodeWithDimensions,
        baseNodeWithDimensions,
        otherNodes,
      );

      // 如果位置合法（或已经修正），更新 Ref
      if (dragRef.current && dragRef.current.id === draggedNode.id) {
        dragRef.current.lastValidPosition = validPosition;
      }

      // 只有位置真正改变时才触发 React 渲染，优化性能
      const currentNode = nodes.find((n) => n.id === draggedNode.id);
      if (
        currentNode &&
        (validPosition.x !== currentNode.position.x ||
          validPosition.y !== currentNode.position.y)
      ) {
        const newNodes = nodes.map((n) => {
          if (n.id === draggedNode.id) {
            return { ...n, position: validPosition };
          }
          return n;
        });
        setNodes(newNodes);
      }
    },
    [nodes, setNodes, enableCollision],
  );

  // 7. 拖拽结束：清理现场
  const handleNodeDragStop: NodeMouseHandler = useCallback(() => {
    dragRef.current = null;
  }, []);

  // 处理节点点击
  const handleNodeClick: NodeMouseHandler<WorkflowNode> = useCallback(
    (_event, node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId],
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
    ],
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
        onNodesChange={onNodesChangeIntercepted} // 绑定拦截器
        onNodeDragStart={handleNodeDragStart}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeDragThreshold={1}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{ type: "default", animated: false }}
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
