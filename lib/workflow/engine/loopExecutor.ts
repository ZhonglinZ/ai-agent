/**
 * 循环节点执行器
 *
 * 对外是普通 1 入 1 出节点；对内按 maxIterations 递归执行 subflow。
 * 每轮使用全新 visited（由 executeGraph 保证），共享同一份 context.variables。
 */

import { evaluateCondition } from "@/lib/services/expressionEvaluator";
import { resolveVariables } from "@/lib/services/variableResolver";
import type { LoopNodeData, WorkflowNode } from "../types";
import type {
  NodeExecutor,
  NodeExecutionResult,
  WorkflowRunContext,
} from "./types";
import { NodeExecutionStatus as Status, WorkflowRunStatus } from "./types";
import { createBaseResult } from "./utils";
import { workflowEngine } from "./workflowEngine";

function failResult(
  result: NodeExecutionResult,
  startTime: number,
  error: string,
): NodeExecutionResult {
  const endTime = Date.now();
  return {
    ...result,
    status: Status.FAILED,
    endTime,
    duration: endTime - startTime,
    error,
    logs: result.logs,
  };
}

export const loopNodeExecutor: NodeExecutor = {
  async execute(
    node: WorkflowNode,
    context: WorkflowRunContext,
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const data = node.data as LoopNodeData;
    const result = createBaseResult(node, Status.RUNNING, startTime);
    const max = Math.max(1, data.maxIterations || 5);
    const subflow = data.subflow ?? { nodes: [], edges: [] };

    context.onNodeStatusChange?.(node.id, Status.RUNNING);

    if (!subflow.nodes.length) {
      const message = "循环子图为空，请先双击进入并配置子工作流";
      context.onLog?.(node.id, `❌ ${message}`);
      return failResult(result, startTime, message);
    }

    for (let i = 1; i <= max; i++) {
      context.variables[`${data.label}.index`] = i;
      // 先通知进度，再打日志，运行面板才能给本轮日志打上迭代前缀
      context.onIterationChange?.(node.id, i, max);
      context.onLog?.(node.id, `🔁 第 ${i}/${max} 次迭代开始`);

      let child;
      try {
        child = await workflowEngine.executeGraph({
          nodes: subflow.nodes,
          edges: subflow.edges,
          context,
          input: {
            variables: context.variables,
            callbacks: {
              onLog: context.onLog,
              onNodeStatusChange: context.onNodeStatusChange,
              onIterationChange: context.onIterationChange,
            },
          },
          emitWorkflowTerminalStatus: false,
          // 每轮独立结果，避免污染父图 nodeResults
          nodeResults: [],
          runId: context.runId,
          startTime,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "子工作流执行异常";
        context.onLog?.(node.id, `❌ ${message}`);
        return failResult(result, startTime, message);
      }

      if (child.status === WorkflowRunStatus.STOPPED) {
        const message = "循环被手动停止";
        context.onLog?.(node.id, `⏹️ ${message}`);
        return failResult(result, startTime, message);
      }

      if (child.status !== WorkflowRunStatus.SUCCESS) {
        const message = child.error || "子工作流执行失败";
        context.onLog?.(node.id, `❌ 第 ${i} 次迭代失败: ${message}`);
        return failResult(result, startTime, message);
      }

      if (data.breakCondition?.trim()) {
        const shouldBreak = evaluateCondition(
          data.breakCondition,
          context.variables,
        );
        context.onLog?.(
          node.id,
          `🧪 退出条件: ${data.breakCondition} => ${shouldBreak}`,
        );
        if (shouldBreak) {
          context.onLog?.(node.id, `✅ 提前退出（第 ${i} 次）`);
          break;
        }
      }
    }

    // 把配置的 outputs 写回父图变量，供下游 {{循环.xxx}} 引用
    const outputs: Record<string, unknown> = {};
    for (const output of data.outputs || []) {
      const resolved = resolveVariables(output.value, context.variables);
      outputs[output.name] = resolved;
      context.variables[`${data.label}.${output.name}`] = resolved;
      context.onLog?.(
        node.id,
        `📤 输出 ${output.name} = ${String(resolved).slice(0, 80)}`,
      );
    }

    // 始终暴露当前轮次，方便下游或面板读取
    outputs.index = context.variables[`${data.label}.index`];

    context.onLog?.(node.id, `✅ 循环执行完成`);

    const endTime = Date.now();
    return {
      ...result,
      status: Status.SUCCESS,
      endTime,
      duration: endTime - startTime,
      outputs,
      logs: result.logs,
    };
  },
};

/** @deprecated 使用 loopNodeExecutor；保留别名避免旧 import 断裂 */
export const loopExecutor = loopNodeExecutor;
