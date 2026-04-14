import { http } from "./http";

export class WorkflowService {

    getWorkflow() {
        // return http.get(`/api/workflow`);
    }

    getWorkflowById(id: string) {
        // return http.get(`/api/workflow/${id}`);

    }
}

export const workflowService = new WorkflowService();
