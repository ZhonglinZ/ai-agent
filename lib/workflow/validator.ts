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
  | 'invalid_value'       // 无效值
  | 'structure_error';    // 结构错误
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
 * 运行前验证 - 检查工作流结构是否完整
 * 
 * 检查项：
 * 1. 必须有开始节点
 * 2. 必须有结束节点
 * 3. 开始节点必须有输出连接
 * 4. 结束节点必须有输入连接
 * 5. 所有中间节点必须在路径上（从开始到结束可达）
 *
 * @param nodes 节点列表
 * @param edges 边列表
 * @returns 验证结果
 */
export function validateWorkflowForRun(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ValidationResult {
  const issues: ValidationIssue[] = [];

  // 1. 检查是否有开始节点
  const startNodes = nodes.filter(n => n.type === 'start');
  if (startNodes.length === 0) {
    issues.push({
      type: 'structure_error',
      message: '工作流缺少开始节点',
      nodeId: '',
      nodeLabel: '',
      nodeType: 'start' as NodeType,
    });
  } else if (startNodes.length > 1) {
    issues.push({
      type: 'structure_error',
      message: '工作流只能有一个开始节点',
      nodeId: startNodes[1].id,
      nodeLabel: (startNodes[1].data as { label: string }).label,
      nodeType: 'start' as NodeType,
    });
  }

  // 2. 检查是否有结束节点
  const endNodes = nodes.filter(n => n.type === 'end');
  if (endNodes.length === 0) {
    issues.push({
      type: 'structure_error',
      message: '工作流缺少结束节点',
      nodeId: '',
      nodeLabel: '',
      nodeType: 'end' as NodeType,
    });
  }

  // 如果没有开始或结束节点，直接返回
  if (startNodes.length === 0 || endNodes.length === 0) {
    return { isValid: false, issues };
  }

  const startNode = startNodes[0];

  // 3. 检查开始节点是否有输出连接
  const startOutputEdges = edges.filter(e => e.source === startNode.id);
  if (startOutputEdges.length === 0) {
    issues.push({
      type: 'missing_connection',
      message: '开始节点没有连接到任何节点',
      nodeId: startNode.id,
      nodeLabel: (startNode.data as { label: string }).label,
      nodeType: 'start' as NodeType,
    });
  }

  // 4. 检查结束节点是否有输入连接
  for (const endNode of endNodes) {
    const endInputEdges = edges.filter(e => e.target === endNode.id);
    if (endInputEdges.length === 0) {
      issues.push({
        type: 'missing_connection',
        message: '结束节点没有任何输入连接',
        nodeId: endNode.id,
        nodeLabel: (endNode.data as { label: string }).label,
        nodeType: 'end' as NodeType,
      });
    }
  }

  // 5. 检查是否有孤立节点（不在从开始到结束的路径上）
  // 使用 BFS 从开始节点遍历所有可达节点
  const reachableFromStart = new Set<string>();
  const queue: string[] = [startNode.id];
  
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (reachableFromStart.has(currentId)) continue;
    reachableFromStart.add(currentId);
    
    // 找到所有从当前节点出发的边
    const outgoingEdges = edges.filter(e => e.source === currentId);
    for (const edge of outgoingEdges) {
      if (!reachableFromStart.has(edge.target)) {
        queue.push(edge.target);
      }
    }
  }

  // 检查哪些节点不可达
  for (const node of nodes) {
    if (node.type === 'start') continue; // 开始节点跳过
    
    if (!reachableFromStart.has(node.id)) {
      issues.push({
        type: 'missing_connection',
        message: '此节点无法从开始节点到达，请检查连接',
        nodeId: node.id,
        nodeLabel: (node.data as { label: string }).label,
        nodeType: node.type as NodeType,
      });
    }
  }

  // 6. 检查是否能从开始节点到达至少一个结束节点
  const canReachEnd = endNodes.some(endNode => reachableFromStart.has(endNode.id));
  if (!canReachEnd && startOutputEdges.length > 0) {
    issues.push({
      type: 'structure_error',
      message: '从开始节点无法到达任何结束节点，请检查连接',
      nodeId: startNode.id,
      nodeLabel: (startNode.data as { label: string }).label,
      nodeType: 'start' as NodeType,
    });
  }

  // 7. 执行常规验证（字段检查等）
  const regularValidation = validateWorkflowNodes(nodes, edges);
  issues.push(...regularValidation.issues);

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
