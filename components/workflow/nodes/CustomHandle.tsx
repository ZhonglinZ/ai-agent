"use client";

import React, { useMemo } from "react";
import {
  Handle,
  Position,
  useConnection,
  useNodeId,
  useEdges,
} from "@xyflow/react";
import { ActionBtn } from "./ActionBtn";

interface CustomHandleProps {
  type: "source" | "target";
  position: Position;
  id?: string;
}

export const CustomHandle: React.FC<CustomHandleProps> = ({
  type,
  position,
  id,
}) => {
  const edges = useEdges();
  const nodeId = useNodeId();
  // 只订阅需要的字段，避免拖拽时因为 connection 对象变化导致额外重渲染
  const isConnecting = useConnection((connection) => connection.inProgress);
  const isSource = useConnection(
    (connection) => connection.fromHandle?.type === "source",
  );

  // === 关键逻辑：计算可见性 ===
  const isConnected = useMemo(() => {
    if (!nodeId) return false;
    return edges.some((edge) => {
      if (type === "source") {
        if (edge.source !== nodeId) return false;
        return id ? edge.sourceHandle === id : !edge.sourceHandle;
      }

      if (edge.target !== nodeId) return false;
      return id ? edge.targetHandle === id : !edge.targetHandle;
    });
  }, [edges, nodeId, type, id]);

  const isVisible =
    isConnected || (isConnecting && isSource && type === "target");

  return (
    <>
      {/* 1. Handle 本体 */}
      <Handle
        type={type}
        position={position}
        id={id}
        className={`transition-all ${
          isVisible
            ? "w-3! h-3! border-0! bg-blue-500! ring-2! ring-blue-300! ring-offset-1!"
            : "w-3! h-3! bg-gray-400! border-2! border-white!"
        }`}
      >
        {/* 未连接时显示加号 */}
        {!isConnected && type === "source" && (
          <ActionBtn
            nodeId={nodeId || ""}
            sourceHandleId={id ?? null}
            visible={true}
          />
        )}
      </Handle>
    </>
  );
};
