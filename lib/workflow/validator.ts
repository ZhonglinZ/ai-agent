import {
  APINodeData,
  BranchNodeData,
  CodeNodeData,
  EndNodeData,
  LLMNodeData,
  NodeType,
  WorkflowEdge,
  WorkflowNode,
} from "./types";

/**
 * 验证问题类型
 */
export type ValidationIssueType = 
  | 'missing_connection'  // 缺少连接
  | 'missing_field'       // 缺少必填字段
  | 'invalid_value';      // 无效值

/**
 * 验证问题
 */
export interface ValidationIssue {
  /** 问题类型 */
  type: ValidationIssueType;
  /** 问题描述 */
  message: string;
  /** 节点 ID */
  nodeId: string;
  /** 节点标签 */
  nodeLabel: string;
  /** 节点类型 */
  nodeType: NodeType;
}

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否通过验证 */
  isValid: boolean;
  /** 问题列表 */
  issues: ValidationIssue[];
}

/**
 * 检查节点是否有输入连接
 */
function hasInputConnection(nodeId: string, edges: WorkflowEdge[]): boolean {
  return edges.some((edge) => edge.target === nodeId);
}

/**
 * 创建验证问题对象
 */
function createIssue(
  node: WorkflowNode,
  message: string,
  type: ValidationIssueType = "missing_field"
): ValidationIssue {
  return {
    type,
    message,
    nodeId: node.id,
    nodeLabel: node.data.label,
    nodeType: node.type,
  };
}

/**
 * 验证大模型节点
 */
function validateLLMNode(node: WorkflowNode, edges: WorkflowEdge[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const data = node.data as LLMNodeData;

  if (!hasInputConnection(node.id, edges)) {
    issues.push(createIssue(node, "此节点尚未连接到其他节点", "missing_connection"));
  }

  if (!data.model) {
    issues.push(createIssue(node, "模型 不能为空"));
  }

  return issues;
}

/**
 * 验证结束节点
 */
function validateEndNode(node: WorkflowNode, edges: WorkflowEdge[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const _data = node.data as EndNodeData;

  if (!hasInputConnection(node.id, edges)) {
    issues.push(createIssue(node, "此节点尚未连接到其他节点", "missing_connection"));
  }

  return issues;
}

/**
 * 验证 API 节点
 */
function validateAPINode(node: WorkflowNode, edges: WorkflowEdge[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const data = node.data as APINodeData;

  if (!hasInputConnection(node.id, edges)) {
    issues.push(createIssue(node, "此节点尚未连接到其他节点", "missing_connection"));
  }

  if (!data.url?.trim()) {
    issues.push(createIssue(node, "URL 不能为空"));
  }

  return issues;
}

/**
 * 验证代码节点
 */
function validateCodeNode(node: WorkflowNode, edges: WorkflowEdge[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const data = node.data as CodeNodeData;

  if (!hasInputConnection(node.id, edges)) {
    issues.push(createIssue(node, "此节点尚未连接到其他节点", "missing_connection"));
  }

  if (!data.code?.trim()) {
    issues.push(createIssue(node, "代码 不能为空"));
  }

  return issues;
}

/**
 * 验证分支器节点
 */
function validateBranchNode(node: WorkflowNode, edges: WorkflowEdge[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const data = node.data as BranchNodeData;

  if (!hasInputConnection(node.id, edges)) {
    issues.push(createIssue(node, "此节点尚未连接到其他节点", "missing_connection"));
  }

  const hasEmptyCondition = (data.branches ?? []).some(
    (branch) => !branch.condition?.trim()
  );
  if (hasEmptyCondition) {
    issues.push(createIssue(node, "条件不能为空"));
  }

  return issues;
}

/**
 * 验证整个工作流
 */
export function validateWorkflowNodes(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ValidationResult {
  const issues: ValidationIssue[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case NodeType.LLM:
        issues.push(...validateLLMNode(node, edges));
        break;
      case NodeType.END:
        issues.push(...validateEndNode(node, edges));
        break;
      case NodeType.API:
        issues.push(...validateAPINode(node, edges));
        break;
      case NodeType.CODE:
        issues.push(...validateCodeNode(node, edges));
        break;
      case NodeType.BRANCH:
        issues.push(...validateBranchNode(node, edges));
        break;
      default:
        break;
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * 按节点分组问题
 *
 * @param issues 问题列表
 * @returns 按节点 ID 分组的问题
 */
export function groupIssuesByNode(
    issues: ValidationIssue[]
  ): Map<string, ValidationIssue[]> {
    const grouped = new Map<string, ValidationIssue[]>();
  
    for (const issue of issues) {
      const existing = grouped.get(issue.nodeId) || [];
      existing.push(issue);
      grouped.set(issue.nodeId, existing);
    }
  
    return grouped;
  }
