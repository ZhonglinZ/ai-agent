import { APINodeData, KnowledgeNodeData, LLMNodeData } from "../workflow";

export interface NodeExecuteBaseRequest {
  runId: string;
  nodeId: string;
  variables: Record<string, unknown>;
}

export interface LLMNodeExecuteRequest extends NodeExecuteBaseRequest {
  nodeData: LLMNodeData;
}

export interface APINodeExecuteRequest extends NodeExecuteBaseRequest {
  nodeData: APINodeData;
}

export interface KnowledgeNodeExecuteRequest extends NodeExecuteBaseRequest {
  nodeData: KnowledgeNodeData;
}

export interface NodeExecuteData {
  outputs: Record<string, unknown>;
  logs?: string[];
}
