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
  /** 节点主题色 */
  color: "blue" | "green" | "red" | "orange" | "purple" | "gray";
  /** 是否显示输入连接点 */
  showInput?: boolean;
  /** 是否显示输出连接点 */
  showOutput?: boolean;
  /** 子内容（可选） */
  children?: React.ReactNode;
}

/**
 * 颜色配置映射
 *
 * 每种颜色包含：
 * - bg: 背景色
 * - border: 边框色
 * - icon: 图标背景色
 * - text: 文字颜色
 */
const colorConfig: Record<string, any> = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    selectedBorder: "border-blue-500",
    icon: "bg-blue-500",
    text: "text-blue-700",
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    selectedBorder: "border-green-500",
    icon: "bg-green-500",
    text: "text-green-700",
  },
  // ... 其他颜色配置
};

export const BaseNode: React.FC<BaseNodeProps> = ({
  id,
  selected = false,
  icon,
  title,
  subtitle,
  color,
  showInput = true,
  showOutput = true,
  children,
}) => {
  const colors = colorConfig[color] || colorConfig.blue;

  return (
    <div
      className={`
        min-w-[180px] rounded-lg shadow-md border-2 transition-all
        ${colors.bg}
        ${selected ? colors.selectedBorder : colors.border}
        ${selected ? "shadow-lg" : ""}
      `}
    >
      {/* 输入连接点 */}
      {showInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
        />
      )}

      {/* 节点内容 */}
      <div className="p-3">
        <div className="flex items-center gap-2">
          {/* 图标 */}
          <div
            className={`
            w-8 h-8 rounded-lg flex items-center justify-center
            ${colors.icon} text-white
          `}
          >
            {icon}
          </div>

          {/* 标题和副标题 */}
          <div className="flex-1 min-w-0">
            <div className={`font-medium text-sm ${colors.text}`}>{title}</div>
            {subtitle && (
              <div className="text-xs text-gray-500 truncate">{subtitle}</div>
            )}
          </div>
        </div>

        {/* 子内容 */}
        {children}
      </div>

      {/* 输出连接点 */}
      {showOutput && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
        />
      )}
    </div>
  );
};
