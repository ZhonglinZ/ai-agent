/**
 * 节点执行器集合
 *
 * 为每种节点类型提供模拟执行逻辑
 * 在真实场景中，这些执行器会调用真实的 API、LLM 等服务
 */

import { evaluateCondition } from "@/lib/services/expressionEvaluator";
import { NodeType } from "../types";
import type {
  WorkflowNode,
  StartNodeData,
  EndNodeData,
  LLMNodeData,
  APINodeData,
  CodeNodeData,
  BranchNodeData,
} from "../types";
import type {
  NodeExecutor,
  NodeExecutionResult,
  WorkflowRunContext,
  NodeExecutionStatus,
} from "./types";
import { NodeExecutionStatus as Status } from "./types";
import { workflowRunService } from "@/lib/services/workflowRun.service";

// ==================== 工具函数 ====================
function writeNodeOutputs(
  label: string,
  outputs: Record<string, unknown>,
  variables: Record<string, unknown>,
): Record<string, unknown> {
  Object.entries(outputs).forEach(([key, value]) => {
    variables[`${label}.${key}`] = value;
  });
  return outputs;
}

/**
 * 解析变量引用
 * 将 {{节点名.变量名}} 格式的引用替换为实际值
 */
export function resolveVariables(
  template: string,
  variables: Record<string, unknown>,
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, varPath) => {
    const value = variables[varPath.trim()];
    if (value === undefined) {
      return match; // 保持原样
    }
    return typeof value === "object" ? JSON.stringify(value) : String(value);
  });
}

/**
 * 模拟延迟（模拟网络请求或处理时间）
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 生成随机延迟时间（模拟真实执行时间）
 */
function randomDelay(min: number = 500, max: number = 1500): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 创建基础执行结果
 */
function createBaseResult(
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

// ==================== 开始节点执行器 ====================

export const startNodeExecutor: NodeExecutor = {
  async execute(
    node: WorkflowNode,
    context: WorkflowRunContext,
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const data = node.data as StartNodeData;
    const result = createBaseResult(node, Status.RUNNING, startTime);

    context.onLog?.(node.id, "🚀 开始执行工作流");
    context.onNodeStatusChange?.(node.id, Status.RUNNING);

    // 将输入变量写入运行时变量
    const outputs: Record<string, unknown> = {};
    if (data.inputs && data.inputs.length > 0) {
      data.inputs.forEach((input) => {
        const varKey = `${data.label}.${input.name}`;
        // 使用默认值或从 context 中获取输入
        const value = context.variables[input.name] ?? input.defaultValue ?? "";
        if (
          input.required &&
          (value === undefined || value === null || value === "")
        ) {
          context.onLog?.(node.id, `❌ 缺少必填输入: ${input.name}`);
          return {
            ...result,
            status: Status.FAILED,
            endTime,
            duration: endTime - startTime,
            error: `缺少必填输入: ${input.name}`,
            logs: result.logs,
          };
        }
        context.variables[varKey] = value;
        outputs[input.name] = value;
        context.onLog?.(
          node.id,
          `📥 输入变量 ${input.name} = ${JSON.stringify(value)}`,
        );
      });
    }

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

// ==================== 结束节点执行器 ====================

export const endNodeExecutor: NodeExecutor = {
  async execute(
    node: WorkflowNode,
    context: WorkflowRunContext,
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const data = node.data as EndNodeData;
    const result = createBaseResult(node, Status.RUNNING, startTime);

    context.onLog?.(node.id, "🏁 工作流执行完成");
    context.onNodeStatusChange?.(node.id, Status.RUNNING);

    await delay(randomDelay(200, 400));

    // 收集输出变量
    const outputs: Record<string, unknown> = {};
    if (data.outputVariables && data.outputVariables.length > 0) {
      data.outputVariables.forEach((output) => {
        // 解析变量引用
        const resolvedValue = resolveVariables(output.value, context.variables);
        outputs[output.name] = resolvedValue;
        context.onLog?.(
          node.id,
          `📤 输出变量 ${output.name} = ${resolvedValue}`,
        );
      });
    }

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

// ==================== 大模型节点执行器 ====================

export const llmNodeExecutor: NodeExecutor = {
  async execute(
    node: WorkflowNode,
    context: WorkflowRunContext,
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const data = node.data as LLMNodeData;
    const result = createBaseResult(node, Status.RUNNING, startTime);

    context.onNodeStatusChange?.(node.id, Status.RUNNING);
    context.onLog?.(node.id, `🤖 开始调用大模型: ${data.model || "默认模型"}`);

    try {
      const res = await workflowRunService.executeLLMNode({
        runId: context.runId,
        nodeId: node.id,
        variables: context.variables,
        nodeData: data,
      });

      res.logs?.forEach((log) => {
        context.onLog?.(node.id, log);
      });

      const outputs = writeNodeOutputs(
        data.label,
        res.outputs,
        context.variables,
      );
      context.onLog?.(
        node.id,
        `✅ 模型响应: ${String(outputs.text ?? "").slice(0, 100)}...`,
      );
      const endTime = Date.now();
      return {
        ...result,
        status: Status.SUCCESS,
        endTime,
        duration: endTime - startTime,
        outputs,
        logs: result.logs,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "LLM 节点执行失败";
      context.onLog?.(node.id, `❌ ${message}`);
      const endTime = Date.now();
      return {
        ...result,
        status: Status.FAILED,
        endTime,
        duration: endTime - startTime,
        error: message,
        logs: result.logs,
      };
    }
  },
};

// ==================== API 节点执行器 ====================

export const apiNodeExecutor: NodeExecutor = {
  async execute(
    node: WorkflowNode,
    context: WorkflowRunContext,
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const data = node.data as APINodeData;
    const result = createBaseResult(node, Status.RUNNING, startTime);

    context.onNodeStatusChange?.(node.id, Status.RUNNING);
    context.onLog?.(node.id, `🌐 发起 ${data.method} 请求: ${data.url}`);

    try {
      const executeResult = await workflowRunService.executeAPINode({
        runId: context.runId,
        nodeId: node.id,
        variables: context.variables,
        nodeData: data,
      });

      executeResult.logs?.forEach((log) => context.onLog?.(node.id, log));

      const outputs = writeNodeOutputs(
        data.label,
        executeResult.outputs,
        context.variables,
      );

      context.onLog?.(node.id, `✅ 响应状态: ${outputs.status_code}`);

      const endTime = Date.now();
      return {
        ...result,
        status: Status.SUCCESS,
        endTime,
        duration: endTime - startTime,
        outputs,
        logs: result.logs,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "API 节点执行失败";
      context.onLog?.(node.id, `❌ ${message}`);

      const endTime = Date.now();
      return {
        ...result,
        status: Status.FAILED,
        endTime,
        duration: endTime - startTime,
        error: message,
        logs: result.logs,
      };
    }
  },
};

// ==================== 代码节点执行器 ====================

/**
 * 模拟代码执行
 */
function mockCodeExecution(
  code: string,
  inputs: Record<string, unknown>,
  outputs: { name: string; type: string }[],
): Record<string, unknown> {
  // 模拟代码执行结果
  const result: Record<string, unknown> = {};

  outputs.forEach((output) => {
    switch (output.type) {
      case "string":
        result[output.name] = `处理结果: ${JSON.stringify(inputs)}`;
        break;
      case "number":
        result[output.name] = Math.floor(Math.random() * 100);
        break;
      case "boolean":
        result[output.name] = Math.random() > 0.5;
        break;
      case "object":
        result[output.name] = {
          processed: true,
          input: inputs,
          timestamp: Date.now(),
        };
        break;
      case "array":
        result[output.name] = Object.values(inputs);
        break;
      default:
        result[output.name] = null;
    }
  });

  return result;
}

export const codeNodeExecutor: NodeExecutor = {
  async execute(
    node: WorkflowNode,
    context: WorkflowRunContext,
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const data = node.data as CodeNodeData;
    const result = createBaseResult(node, Status.RUNNING, startTime);

    context.onNodeStatusChange?.(node.id, Status.RUNNING);
    context.onLog?.(node.id, `💻 执行 ${data.language} 代码`);

    // 解析输入变量
    const resolvedInputs: Record<string, unknown> = {};
    if (data.inputs && data.inputs.length > 0) {
      data.inputs.forEach((input) => {
        const resolvedValue = resolveVariables(input.value, context.variables);
        resolvedInputs[input.name] = resolvedValue;
        context.onLog?.(node.id, `📥 输入: ${input.name} = ${resolvedValue}`);
      });
    }

    // 模拟代码执行延迟
    await delay(randomDelay(500, 1000));

    // 执行代码（模拟）
    const codeOutputs = mockCodeExecution(
      data.code,
      resolvedInputs,
      data.outputs || [],
    );

    // 将输出写入变量
    Object.entries(codeOutputs).forEach(([key, value]) => {
      const varKey = `${data.label}.${key}`;
      context.variables[varKey] = value;
      context.onLog?.(
        node.id,
        `📤 输出: ${key} = ${JSON.stringify(value).slice(0, 50)}`,
      );
    });

    context.onLog?.(node.id, `✅ 代码执行完成`);

    const endTime = Date.now();
    return {
      ...result,
      status: Status.SUCCESS,
      endTime,
      duration: endTime - startTime,
      inputs: resolvedInputs,
      outputs: codeOutputs,
      logs: result.logs,
    };
  },
};

// ==================== 分支器节点执行器 ====================

export const branchNodeExecutor: NodeExecutor = {
  async execute(
    node: WorkflowNode,
    context: WorkflowRunContext,
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const data = node.data as BranchNodeData;
    const result = createBaseResult(node, Status.RUNNING, startTime);

    context.onNodeStatusChange?.(node.id, Status.RUNNING);
    context.onLog?.(node.id, `🔀 评估分支条件`);

    // 评估每个条件分支
    let matchedBranchId: string | null = null;

    if (data.branches && data.branches.length > 0) {
      for (const branch of data.branches) {
        const conditionMet = evaluateCondition(
          branch.condition || "",
          context.variables,
        );
        context.onLog?.(
          node.id,
          `  条件 "${branch.label}": ${branch.condition || "(空)"} => ${conditionMet}`,
        );

        if (conditionMet) {
          matchedBranchId = branch.id;
          context.onLog?.(node.id, `✅ 命中分支: ${branch.label}`);
          break;
        }
      }
    }

    // 如果没有命中任何条件，使用 else 分支
    if (!matchedBranchId && data.showElseBranch) {
      matchedBranchId = "else";
      context.onLog?.(node.id, `✅ 进入默认分支 (否则)`);
    }

    const outputs = {
      matchedBranch: matchedBranchId,
    };

    // 写入变量
    context.variables[`${data.label}.matchedBranch`] = matchedBranchId;

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

// ==================== 执行器注册表 ====================

/**
 * 节点执行器映射
 */
export const nodeExecutors: Record<NodeType, NodeExecutor> = {
  [NodeType.START]: startNodeExecutor,
  [NodeType.END]: endNodeExecutor,
  [NodeType.LLM]: llmNodeExecutor,
  [NodeType.API]: apiNodeExecutor,
  [NodeType.CODE]: codeNodeExecutor,
  [NodeType.BRANCH]: branchNodeExecutor,
};

/**
 * 获取节点执行器
 */
export function getNodeExecutor(nodeType: NodeType): NodeExecutor | undefined {
  return nodeExecutors[nodeType];
}
