export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  animated?: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  trigger_type: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ExecutionStep {
  id: string;
  execution_id: string;
  node_id: string;
  node_name: string;
  node_type: string;
  status: 'running' | 'success' | 'error' | 'skipped';
  input_data?: any;
  output_data?: any;
  error_message?: string | null;
  duration_ms: number;
  started_at: string;
  finished_at?: string | null;
}

export interface Execution {
  id: string;
  workflow_id: string;
  workflow_name?: string;
  status: 'running' | 'success' | 'error';
  duration_ms: number;
  error_message?: string | null;
  started_at: string;
  finished_at?: string | null;
  steps?: ExecutionStep[];
}

export interface DashboardStats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successfulExecutions: number;
  successRate: number;
  recentExecutions: {
    id: string;
    workflow_id: string;
    workflow_name: string;
    status: 'running' | 'success' | 'error';
    duration_ms: number;
    started_at: string;
  }[];
}

export interface Credential {
  id: string;
  name: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export type ActiveView = 'dashboard' | 'workflows' | 'editor' | 'executions' | 'credentials' | 'templates' | 'settings';
