import { http } from "./http";
import type { Workflow } from "@/lib/types/workflow";
import type { ApiResponse } from "@/lib/types/api";

export class WorkflowService {
    private readonly baseUrl = '/workflow';
    getWorkflow() {
        // return http.get(`/api/workflow`);
    }

    async getWorkflowById(id: string): Promise<Workflow | null> {
        try {
            // 注意：不需要加 /api 前缀，http client 的 baseURL 已经包含了
            const response = await http.get<Workflow>(`${this.baseUrl}/${id}`);
            return response.success ? response.data : null;
        } catch (error) {
            console.error('获取工作流失败:', error);
            return null;
        }
    }
}

export const workflowService = new WorkflowService();
