/**
 * 工作流执行引擎
 *
 * 核心职责：
 * 1. 按拓扑顺序执行节点
 * 2. 处理分支逻辑
 * 3. 管理执行状态
 * 4. 支持暂停、停止与断点续跑
 */

import type { Edge } from "@xyflow/react";
import { NodeType } from "../types";
import type { WorkflowNode } from "../types";
import type {
  WorkflowRunContext,
  WorkflowRunResult,
  NodeExecutionResult,
  WorkflowRunInput,
  WorkflowRunCheckpoint,
} from "./types";
import { NodeExecutionStatus, WorkflowRunStatus } from "./types";
import { getNodeExecutor } from "./executor";

/**
 * 执行状态
 */
interface ExecutionState {
  isRunning: boolean;
  shouldStop: boolean;
}

/**
 * 生成运行 ID
 */
function generateRunId(): string {
  return `run_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * 构建节点邻接表（出边）
 */
function buildAdjacencyList(edges: Edge[]): Map<string, string[]> {
  const adjacencyList = new Map<string, string[]>();

  edges.forEach((edge) => {
    const neighbors = adjacencyList.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacencyList.set(edge.source, neighbors);
  });

  return adjacencyList;
}

/**
 * 查找开始节点
 */
function findStartNode(nodes: WorkflowNode[]): WorkflowNode | undefined {
  return nodes.find((node) => node.type === NodeType.START);
}

/**
 * 构建节点状态映射
 */
function buildNodeStatusesMap(
  nodeResults: NodeExecutionResult[],
): Record<string, NodeExecutionStatus> {
  return nodeResults.reduce(
    (acc, result) => {
      acc[result.nodeId] = result.status;
      return acc;
    },
    {} as Record<string, NodeExecutionStatus>,
  );
}

function createCheckpoint(params: {
  runId: string;
  variables: Record<string, unknown>;
  nodeResults: NodeExecutionResult[];
  visited: Set<string>;
  queue: string[];
  inputVariables: Record<string, unknown>;
  startTime: number;
  failedNodeId?: string;
  lastError?: string;
  branchDecisions?: Record<string, string | null>;
}): WorkflowRunCheckpoint {
  const {
    runId,
    variables,
    nodeResults,
    visited,
    queue,
    inputVariables,
    startTime,
    failedNodeId,
    lastError,
    branchDecisions,
  } = params;
  const runableVisitedNodeIds = [...visited].filter(
    (id) => id !== failedNodeId,
  );
  const pendingQueue = failedNodeId
    ? [failedNodeId, ...queue.filter((id) => id !== failedNodeId)]
    : [...queue];
  return {
    runId,
    variables,
    nodeResults,
    nodeStatuses: buildNodeStatusesMap(nodeResults),
    visitedNodeIds: runableVisitedNodeIds,
    pendingQueue,
    failedNodeId,
    lastError,
    branchDecisions,
    inputVariables,
    startTime,
    checkpointAt: Date.now(),
  };
}

/**
 * 获取节点的所有输出边
 */
function getOutgoingEdges(nodeId: string, edges: Edge[]): Edge[] {
  return edges.filter((edge) => edge.source === nodeId);
}

/**
 * 根据分支结果确定下一个节点
 */
function getNextNodesForBranch(
  nodeId: string,
  matchedBranchId: string | null,
  edges: Edge[],
  nodes: WorkflowNode[],
): string[] {
  const outgoingEdges = getOutgoingEdges(nodeId, edges);

  if (!matchedBranchId) {
    return [];
  }

  // 分支节点的边通常带有 sourceHandle 来标识是哪个分支
  // sourceHandle 格式: branch-{branchId} 或 else
  const matchingEdge = outgoingEdges.find((edge) => {
    if (matchedBranchId === "else") {
      return edge.sourceHandle?.includes("else");
    }
    return edge.sourceHandle?.includes(matchedBranchId);
  });

  if (matchingEdge) {
    return [matchingEdge.target];
  }

  // 如果没有找到匹配的边，返回第一个非分支边或空数组
  return outgoingEdges.length > 0 ? [outgoingEdges[0].target] : [];
}

/**
 * 工作流执行引擎类
 */
export class WorkflowEngine {
  private state: ExecutionState = {
    isRunning: false,
    shouldStop: false,
  };

  /**
   * 从已有队列继续 BFS（execute / resume 共用）
   * 仅在节点 FAILED 时写入 checkpoint；成功跑完不需要快照
   */
  private async runFromQueue(params: {
    runId: string;
    startTime: number;
    nodes: WorkflowNode[];
    edges: Edge[];
    input: WorkflowRunInput;
    context: WorkflowRunContext;
    visited: Set<string>;
    queue: string[];
    nodeResults: NodeExecutionResult[];
    branchDecisions: Record<string, string | null>;
  }): Promise<WorkflowRunResult> {
    const {
      runId,
      startTime,
      nodes,
      edges,
      input,
      context,
      visited,
      queue,
      nodeResults,
      branchDecisions,
    } = params;

    const adjacencyList = buildAdjacencyList(edges);

    while (queue.length > 0) {
      if (this.state.shouldStop) {
        input.callbacks?.onLog?.("system", "⏹️ 工作流执行被手动停止");
        input.callbacks?.onWorkflowStatusChange?.(WorkflowRunStatus.STOPPED);
        return {
          runId,
          status: WorkflowRunStatus.STOPPED,
          startTime,
          endTime: Date.now(),
          nodeResults,
        };
      }

      const currentNodeId = queue.shift()!;

      if (visited.has(currentNodeId)) {
        continue;
      }
      visited.add(currentNodeId);

      const currentNode = nodes.find((n) => n.id === currentNodeId);
      if (!currentNode) {
        input.callbacks?.onLog?.(
          "system",
          `⚠️ 节点 ${currentNodeId} 不存在，跳过`,
        );
        continue;
      }

      const executor = getNodeExecutor(currentNode.type as NodeType);
      if (!executor) {
        input.callbacks?.onLog?.(
          "system",
          `⚠️ 节点类型 ${currentNode.type} 没有执行器，跳过`,
        );
        continue;
      }

      const result = await executor.execute(currentNode, context);
      nodeResults.push(result);

      if (result.status === NodeExecutionStatus.FAILED) {
        input.callbacks?.onLog?.(
          "system",
          `❌ 节点 ${currentNode.data.label} 执行失败: ${result.error}`,
        );

        input.callbacks?.onNodeStatusChange?.(
          currentNodeId,
          NodeExecutionStatus.FAILED,
        );

        const checkpoint = createCheckpoint({
          runId,
          variables: context.variables,
          nodeResults,
          visited,
          queue,
          inputVariables: input.variables,
          startTime,
          failedNodeId: currentNodeId,
          lastError: result.error,
          branchDecisions,
        });

        input.callbacks?.onLog?.(
          "system",
          `⏸️ 工作流已暂停，可从断点继续（节点: ${currentNode.data.label}）`,
        );
        input.callbacks?.onWorkflowStatusChange?.(WorkflowRunStatus.PAUSED);
        return {
          runId,
          status: WorkflowRunStatus.PAUSED,
          startTime,
          endTime: Date.now(),
          nodeResults,
          error: result.error,
          checkpoint,
        };
      }

      input.callbacks?.onNodeStatusChange?.(
        currentNodeId,
        NodeExecutionStatus.SUCCESS,
      );

      let nextNodeIds: string[] = [];

      if (currentNode.type === NodeType.BRANCH) {
        const matchedBranch = result.outputs?.matchedBranch as string | null;
        branchDecisions[currentNodeId] = matchedBranch;
        nextNodeIds = getNextNodesForBranch(
          currentNodeId,
          matchedBranch,
          edges,
          nodes,
        );
      } else if (currentNode.type === NodeType.END) {
        input.callbacks?.onLog?.("system", `🏁 到达结束节点，工作流执行完成`);
      } else {
        nextNodeIds = adjacencyList.get(currentNodeId) || [];
      }

      nextNodeIds.forEach((nodeId) => {
        if (!visited.has(nodeId)) {
          queue.push(nodeId);
        }
      });
    }

    const endNode = nodes.find((n) => n.type === NodeType.END);
    const endNodeResult = nodeResults.find((r) => r.nodeId === endNode?.id);

    const endTime = Date.now();
    input.callbacks?.onLog?.(
      "system",
      `✅ 工作流执行成功，总耗时: ${endTime - startTime}ms`,
    );
    input.callbacks?.onWorkflowStatusChange?.(WorkflowRunStatus.SUCCESS);

    return {
      runId,
      status: WorkflowRunStatus.SUCCESS,
      startTime,
      endTime,
      nodeResults,
      finalOutput: endNodeResult?.outputs,
    };
  }

  /**
   * 执行工作流（从头开始）
   */
  async execute(
    nodes: WorkflowNode[],
    edges: Edge[],
    input: WorkflowRunInput,
  ): Promise<WorkflowRunResult> {
    const runId = generateRunId();
    const startTime = Date.now();
    const nodeResults: NodeExecutionResult[] = [];

    this.state = { isRunning: true, shouldStop: false };

    const context: WorkflowRunContext = {
      runId,
      variables: { ...input.variables },
      onNodeStatusChange: input.callbacks?.onNodeStatusChange,
      onLog: input.callbacks?.onLog,
    };

    input.callbacks?.onWorkflowStatusChange?.(WorkflowRunStatus.RUNNING);
    input.callbacks?.onLog?.("system", `🚀 开始执行工作流 (ID: ${runId})`);

    try {
      const startNode = findStartNode(nodes);
      if (!startNode) {
        throw new Error("未找到开始节点");
      }

      return await this.runFromQueue({
        runId,
        startTime,
        nodes,
        edges,
        input,
        context,
        visited: new Set(),
        queue: [startNode.id],
        nodeResults,
        branchDecisions: {},
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      input.callbacks?.onLog?.("system", `❌ 工作流执行出错: ${errorMessage}`);
      input.callbacks?.onWorkflowStatusChange?.(WorkflowRunStatus.FAILED);

      return {
        runId,
        status: WorkflowRunStatus.FAILED,
        startTime,
        endTime: Date.now(),
        nodeResults,
        error: errorMessage,
      };
    } finally {
      this.state.isRunning = false;
    }
  }

  /**
   * 从断点继续执行
   */
  async resume(
    checkpoint: WorkflowRunCheckpoint,
    nodes: WorkflowNode[],
    edges: Edge[],
    input: WorkflowRunInput,
  ): Promise<WorkflowRunResult> {
    this.state = { isRunning: true, shouldStop: false };

    const runId = checkpoint.runId;
    const startTime = checkpoint.startTime;
    const failedId = checkpoint.failedNodeId;

    // 去掉失败节点的旧结果，准备重跑
    const nodeResults = checkpoint.nodeResults.filter(
      (r) => r.nodeId !== failedId,
    );

    const context: WorkflowRunContext = {
      runId,
      variables: { ...checkpoint.variables },
      onNodeStatusChange: input.callbacks?.onNodeStatusChange,
      onLog: input.callbacks?.onLog,
    };

    input.callbacks?.onWorkflowStatusChange?.(WorkflowRunStatus.RUNNING);
    input.callbacks?.onLog?.(
      "system",
      `▶️ 从断点继续 (ID: ${runId}${failedId ? `，重试节点: ${failedId}` : ""})`,
    );

    for (const r of nodeResults) {
      input.callbacks?.onNodeStatusChange?.(r.nodeId, r.status);
    }
    if (failedId) {
      input.callbacks?.onNodeStatusChange?.(
        failedId,
        NodeExecutionStatus.PENDING,
      );
    }

    try {
      const queue =
        checkpoint.pendingQueue.length > 0
          ? [...checkpoint.pendingQueue]
          : failedId
            ? [failedId]
            : [];

      if (queue.length === 0) {
        throw new Error("断点队列为空，无法续跑");
      }

      return await this.runFromQueue({
        runId,
        startTime,
        nodes,
        edges,
        input: {
          ...input,
          variables: checkpoint.inputVariables,
        },
        context,
        visited: new Set(checkpoint.visitedNodeIds),
        queue,
        nodeResults,
        branchDecisions: { ...(checkpoint.branchDecisions ?? {}) },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      input.callbacks?.onLog?.("system", `❌ 续跑出错: ${errorMessage}`);
      input.callbacks?.onWorkflowStatusChange?.(WorkflowRunStatus.FAILED);

      return {
        runId,
        status: WorkflowRunStatus.FAILED,
        startTime,
        endTime: Date.now(),
        nodeResults,
        error: errorMessage,
      };
    } finally {
      this.state.isRunning = false;
    }
  }

  /**
   * 停止执行
   */
  stop(): void {
    if (this.state.isRunning) {
      this.state.shouldStop = true;
    }
  }

  /**
   * 获取运行状态
   */
  isRunning(): boolean {
    return this.state.isRunning;
  }
}

// 创建单例实例
export const workflowEngine = new WorkflowEngine();

/**
 * 执行工作流的便捷函数
 */
export async function runWorkflow(
  nodes: WorkflowNode[],
  edges: Edge[],
  input?: WorkflowRunInput,
): Promise<WorkflowRunResult> {
  return workflowEngine.execute(nodes, edges, input || { variables: {} });
}

/**
 * 停止工作流执行
 */
export function stopWorkflow(): void {
  workflowEngine.stop();
}
