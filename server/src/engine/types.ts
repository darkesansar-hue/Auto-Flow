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

export interface WorkflowRecord {
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

export interface ExecutionRecord {
  id: string;
  workflow_id: string;
  status: 'running' | 'success' | 'error';
  duration_ms: number;
  error_message?: string | null;
  started_at: string;
  finished_at?: string | null;
}

export interface ExecutionStepRecord {
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

export interface ExecutionContext {
  workflowId: string;
  executionId: string;
  nodeOutputs: Record<string, any>;
  steps: ExecutionStepRecord[];
}
