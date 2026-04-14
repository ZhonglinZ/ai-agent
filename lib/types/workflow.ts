export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: any[];
  runMode: string;
  status: string;
}
