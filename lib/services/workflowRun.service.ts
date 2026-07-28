import {
  APINodeExecuteRequest,
  LLMNodeExecuteRequest,
  NodeExecuteData,
  KnowledgeNodeExecuteRequest,
} from "../types/workflowRun";
import { http } from "./http";

export class WorkflowRunService {
  private readonly baseUrl = "/workflow/nodes";

  async executeLLMNode(
    request: LLMNodeExecuteRequest,
  ): Promise<NodeExecuteData> {
    const response = await http.post<NodeExecuteData>(
      `${this.baseUrl}/llm`,
      request,
      { silent: true, timeout: 50_000 },
    );
    return response.data;
  }

  async executeAPINode(
    request: APINodeExecuteRequest,
  ): Promise<NodeExecuteData> {
    const response = await http.post<NodeExecuteData>(
      `${this.baseUrl}/api`,
      request,
      { silent: true },
    );
    return response.data;
  }

  async executeKnowledgeNode(
    request: KnowledgeNodeExecuteRequest,
  ): Promise<NodeExecuteData> {
    const response = await http.post<NodeExecuteData>(
      `${this.baseUrl}/knowledge`,
      request,
      { silent: true, timeout: 50_000 },
    );
    return response.data;
  }
}

export const workflowRunService = new WorkflowRunService();
