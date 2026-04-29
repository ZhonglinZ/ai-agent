/**
 * 节点操作按钮组件
 *
 * 悬浮到节点时显示的 + 按钮：
 * 1. 悬浮时显示蓝色 + 图标
 * 2. 点击弹出节点选择器，选择后添加新节点并连线
 *
 * 注意：拖拽连线功能由节点内部的 Handle 组件提供
 */
"use client";

import React, { useState, useCallback } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Tooltip, Popover } from "antd";

import { NodeType } from "@/lib/workflow/types";
import { useWorkflowStore } from "@/lib/stores/workflowStore";
import { nodeRegistry } from "@/lib/workflow/nodeRegistry";
import { NodeHoverMenu } from "./NodeHoverMenu";

interface ActionBtnProps {
  /** 当前节点 ID */
  nodeId: string;
  /** 是否显示（鼠标悬浮节点时为 true） */
  visible: boolean;
  /** sourceHandle ID，用于创建连线时标识 */
  sourceHandleId?: string | null;
}

/**
 * 节点操作按钮组件
 *
 * 核心设计：
 * - 这是一个纯按钮，用于点击添加节点
 * - 拖拽连线由节点内部的 Handle 提供
 */
export const ActionBtn: React.FC<ActionBtnProps> = ({
  nodeId,
  visible,
  sourceHandleId = null,
}) => {
  // 节点选择器弹窗是否打开
  const [selectorOpen, setSelectorOpen] = useState(false);
  // 是否显示 tooltip
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // 获取 store 方法
  const { nodes, addNode, onConnect } = useWorkflowStore();

  /**
   * 处理选择节点类型后添加新节点
   */
  const handleSelectNodeType = useCallback(
    (type: NodeType) => {
      // 关闭选择器
      setSelectorOpen(false);

      // 获取当前节点
      const currentNode = nodes.find((n) => n.id === nodeId);
      if (!currentNode) return;

      // 获取节点默认数据
      const defaultData = nodeRegistry.getDefaultData(type);
      if (!defaultData) return;

      // 计算新节点位置（在当前节点右侧 280px）
      const newPosition = {
        x: currentNode.position.x + 280,
        y: currentNode.position.y,
      };

      // 添加新节点
      addNode(type, newPosition);

      // 获取刚添加的节点
      setTimeout(() => {
        const latestNodes = useWorkflowStore.getState().nodes;
        const newNode = latestNodes[latestNodes.length - 1];

        if (newNode) {
          // 创建连接（从当前节点到新节点）
          onConnect({
            source: nodeId,
            target: newNode.id,
            sourceHandle: sourceHandleId,
            targetHandle: null,
          });
        }
      }, 0);
    },
    [nodeId, nodes, addNode, onConnect, sourceHandleId],
  );

  /**
   * 处理点击事件
   */
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectorOpen(true);
    setTooltipVisible(false);
  }, []);

  /**
   * 处理 Popover 打开状态变化
   */
  const handleOpenChange = useCallback((open: boolean) => {
    setSelectorOpen(open);
    if (open) {
      setTooltipVisible(false);
    }
  }, []);

  // Tooltip 内容
  const tooltipContent = (
    <div className="text-xs">
      <div>
        <span className="font-bold text-blue-500">点击</span> 添加节点
      </div>
      <div>
        <span className="font-bold text-blue-500">拖拽连接点</span> 连接节点
      </div>
    </div>
  );

  // 如果不可见且选择器未打开，不渲染
  if (!visible && !selectorOpen) {
    return null;
  }

  return (
    <Popover
      content={
        <NodeHoverMenu
          sourceNodeId={nodeId}
          onSelect={handleSelectNodeType}
          onClose={() => setSelectorOpen(false)}
        />
      }
      trigger="click"
      open={selectorOpen}
      onOpenChange={handleOpenChange}
      placement="rightTop"
      arrow={false}
      classNames={{ root: "node-selector-popover" }}
    >
      <Tooltip
        title={tooltipContent}
        placement="top"
        open={tooltipVisible && !selectorOpen}
        onOpenChange={(open) => !selectorOpen && setTooltipVisible(open)}
      >
        {/* 纯按钮，用于点击添加节点 */}
        <div
          onClick={handleClick}
          className="
            absolute! top-1/2! -translate-y-1/2! left-1/2! -translate-x-1/2!
            w-6! h-6!
            bg-blue-500 hover:bg-blue-600
            border-2! border-white!
            rounded-full
            shadow-md!
            flex items-center justify-center
            cursor-pointer!
            transition-all duration-200
            hover:scale-110
            z-10
          "
        >
          <PlusOutlined className="text-white! text-xs!" />
        </div>
      </Tooltip>
    </Popover>
  );
};
