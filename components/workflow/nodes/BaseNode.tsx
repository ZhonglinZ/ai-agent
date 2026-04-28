"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";

/**
 * BaseNode 组件的 Props
 */
export interface BaseNodeProps {
  /** 节点 ID */
  id: string;
  /** 是否被选中 */
  selected?: boolean;
  /** 节点图标 */
  icon: React.ReactNode;
  /** 节点标题 */
  title: string;
  /** 节点副标题（可选） */
  subtitle?: string;
  /** 节点图标背景色 */
  iconColor: "blue" | "green" | "red" | "orange" | "purple" | "gray";
  /** 是否显示输入连接点 */
  showInput?: boolean;
  /** 是否显示输出连接点 */
  showOutput?: boolean;
  /** 子内容（可选） */
  children?: React.ReactNode;
}

/**
 * 图标背景色映射
 */
const iconColorClasses = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  red: "bg-red-500",
  orange: "bg-orange-500",
  purple: "bg-purple-500",
  gray: "bg-gray-500",
};

export const BaseNode: React.FC<BaseNodeProps> = ({
  selected = false,
  icon,
  title,
  subtitle,
  iconColor = "blue", // 默认蓝色
  showInput = true,
  showOutput = true,
  children,
}) => {
  return (
    <div
      className={`
        min-w-[200px] rounded-xl shadow-sm
        bg-white
        border-2
        ${selected ? "border-blue-500 shadow-md" : "border-gray-200"}
        transition-all duration-200
      `}
    >
      {/* 输入连接点 */}
      {showInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3! h-3! bg-gray-400! border-2! border-white!"
        />
      )}

      {/* 节点头部 */}
      <div className="flex items-center gap-3 p-3">
        {/* 图标 */}
        <div
          className={`
            w-8 h-8 rounded-lg ${iconColorClasses[iconColor]}
            flex items-center justify-center
            text-white text-sm
          `}
        >
          {icon}
        </div>

        {/* 标题区域 */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-800 truncate">
            {title}
          </div>
          {subtitle && (
            <div className="text-xs text-gray-500 truncate">{subtitle}</div>
          )}
        </div>
      </div>

      {/* 子内容区域 */}
      {children && <div className="px-3 pb-3 pt-0">{children}</div>}

      {/* 输出连接点 */}
      {showOutput && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3! h-3! bg-gray-400! border-2! border-white!"
        />
      )}
    </div>
  );
};
