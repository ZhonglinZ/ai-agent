"use client";

import React, { useState } from "react";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import type { AgentPreviewMessageStatus } from "@/lib/types/agent";
import { cn } from "@/lib/utils";

interface AgentPreviewThoughtBlockProps {
  thoughts?: string;
  status?: AgentPreviewMessageStatus;
  /** 流式中且正文尚未开始输出，处于思考阶段 */
  isThoughtPhase?: boolean;
}

const getThoughtStatusLabel = (
  status: AgentPreviewMessageStatus | undefined,
  isThoughtPhase: boolean,
) => {
  if (isThoughtPhase) return "深度思考中";
  switch (status) {
    case "streaming":
      return "深度思考";
    case "stopped":
      return "思考已终止";
    case "error":
      return "思考异常";
    default:
      return "深度思考";
  }
};

const getThoughtStatusDotClass = (
  status: AgentPreviewMessageStatus | undefined,
  isThoughtPhase: boolean,
) => {
  if (isThoughtPhase) return "bg-blue-500 animate-pulse";
  switch (status) {
    case "streaming":
      return "bg-emerald-500";
    case "stopped":
      return "bg-orange-500";
    case "error":
      return "bg-red-500";
    default:
      return "bg-emerald-500";
  }
};

export const AgentPreviewThoughtBlock: React.FC<
  AgentPreviewThoughtBlockProps
> = ({ thoughts, status, isThoughtPhase = false }) => {
  const [expanded, setExpanded] = useState(false);
  const trimmed = thoughts?.trim() ?? "";
  const hasContent = trimmed.length > 0;
  const canExpand = hasContent && !isThoughtPhase;

  const statusLabel = getThoughtStatusLabel(status, isThoughtPhase);
  const summary = isThoughtPhase
    ? "正在分析需求，完成后可展开查看"
    : hasContent
      ? `${trimmed.length} 字`
      : null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white/70 text-xs text-gray-600">
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-2 px-2 py-2 text-left text-[11px] text-gray-500",
          canExpand && "cursor-pointer hover:bg-gray-50/80",
          !canExpand && "cursor-default",
        )}
        onClick={() => {
          if (canExpand) setExpanded((prev) => !prev);
        }}
        aria-expanded={canExpand ? expanded : undefined}
      >
        <span
          className={cn(
            "inline-flex h-2 w-2 shrink-0 rounded-full",
            getThoughtStatusDotClass(status, isThoughtPhase),
          )}
        />
        <span className="font-medium text-gray-600">{statusLabel}</span>
        {summary ? (
          <span className="text-gray-400">{summary}</span>
        ) : null}
        {canExpand ? (
          <span className="ml-auto text-gray-400">
            {expanded ? <UpOutlined /> : <DownOutlined />}
          </span>
        ) : null}
      </button>

      {expanded && hasContent ? (
        <div className="border-t border-gray-100 px-2 py-2 whitespace-pre-wrap text-gray-600">
          {trimmed}
        </div>
      ) : null}
    </div>
  );
};
