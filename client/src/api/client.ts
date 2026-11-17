import { Workflow, Execution, DashboardStats, Credential } from '../types';

const API_BASE = '/api';

export const api = {
  // Stats
  async getStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/stats`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to load stats');
    return json.data;
  },

  // Workflows
  async getWorkflows(): Promise<Workflow[]> {
    const res = await fetch(`${API_BASE}/workflows`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to load workflows');
    return json.data;
  },

  async getWorkflow(id: string): Promise<Workflow> {
    const res = await fetch(`${API_BASE}/workflows/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to load workflow');
    return json.data;
  },

  async createWorkflow(payload: { name: string; description?: string; nodes?: any[]; edges?: any[] }): Promise<Workflow> {
    const res = await fetch(`${API_BASE}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create workflow');
    return json.data;
  },

  async updateWorkflow(id: string, payload: Partial<Workflow>): Promise<Workflow> {
    const res = await fetch(`${API_BASE}/workflows/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update workflow');
    return json.data;
  },

  async duplicateWorkflow(id: string): Promise<Workflow> {
    const res = await fetch(`${API_BASE}/workflows/${id}/duplicate`, {
      method: 'POST',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to duplicate workflow');
    return json.data;
  },

  async deleteWorkflow(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/workflows/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete workflow');
  },

  // Executions
  async getExecutions(limit = 50): Promise<Execution[]> {
    const res = await fetch(`${API_BASE}/executions?limit=${limit}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to load executions');
    return json.data;
  },

  async getExecution(id: string): Promise<Execution> {
    const res = await fetch(`${API_BASE}/executions/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to load execution details');
    return json.data;
  },

  async triggerExecution(workflowId: string, currentNodes?: any[], currentEdges?: any[]): Promise<Execution> {
    const res = await fetch(`${API_BASE}/executions/trigger/${workflowId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes: currentNodes, edges: currentEdges }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Workflow execution failed');
    return json.data;
  },

  async testNode(node: any, inputData?: any): Promise<any> {
    const res = await fetch(`${API_BASE}/executions/test-node`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ node, inputData }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Single node test failed');
    return json.data;
  },

  // Credentials
  async getCredentials(): Promise<Credential[]> {
    const res = await fetch(`${API_BASE}/credentials`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to load credentials');
    return json.data;
  },

  async createCredential(payload: { name: string; type: string; data: string }): Promise<Credential> {
    const res = await fetch(`${API_BASE}/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to create credential');
    return json.data;
  },

  async deleteCredential(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/credentials/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete credential');
  },
};
