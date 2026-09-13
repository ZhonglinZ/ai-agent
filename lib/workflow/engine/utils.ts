import { NodeType, WorkflowNode } from "../types";
import { NodeExecutionResult, NodeExecutionStatus } from "./types";

/**
 * 创建基础执行结果
 */
export function createBaseResult(
  node: WorkflowNode,
  status: NodeExecutionStatus,
  startTime: number,
): NodeExecutionResult {
  return {
    nodeId: node.id,
    nodeType: node.type as NodeType,
    nodeName: node.data.label,
    status,
    startTime,
    logs: [],
  };
}
