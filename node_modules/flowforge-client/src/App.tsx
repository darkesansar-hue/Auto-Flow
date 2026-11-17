import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { WorkflowsListView } from './components/workflows/WorkflowsListView';
import { WorkflowEditor } from './components/editor/WorkflowEditor';
import { ExecutionsListView } from './components/executions/ExecutionsListView';
import { CredentialsView } from './components/credentials/CredentialsView';
import { TemplatesView } from './components/templates/TemplatesView';
import { SettingsView } from './components/settings/SettingsView';

import { ActiveView, Workflow, Execution, DashboardStats, Credential } from './types';
import { api } from './api/client';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all initial platform data
  const loadData = async () => {
    try {
      const [wfs, execs, st, creds] = await Promise.all([
        api.getWorkflows().catch(() => []),
        api.getExecutions().catch(() => []),
        api.getStats().catch(() => null),
        api.getCredentials().catch(() => []),
      ]);
      setWorkflows(wfs);
      setExecutions(execs);
      setStats(st);
      setCredentials(creds);
    } catch (err) {
      console.error('Error loading initial data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open workflow in editor
  const handleSelectWorkflow = async (workflowId: string) => {
    try {
      const wf = await api.getWorkflow(workflowId);
      setSelectedWorkflow(wf);
      setActiveView('editor');
    } catch (err: any) {
      alert(`Could not open workflow: ${err.message}`);
    }
  };

  // Create new workflow
  const handleCreateWorkflow = async () => {
    try {
      const newWf = await api.createWorkflow({
        name: `New Workflow ${workflows.length + 1}`,
        description: 'Visual workflow created with FlowForge',
        nodes: [
          {
            id: 'node-trigger',
            type: 'manualTrigger',
            position: { x: 120, y: 150 },
            data: { label: 'Manual Trigger', description: 'Click to start pipeline' },
          },
          {
            id: 'node-set',
            type: 'setData',
            position: { x: 420, y: 150 },
            data: {
              label: 'Set Data',
              values: [{ key: 'status', value: 'initialized' }],
            },
          },
        ],
        edges: [
          { id: 'e-trig-set', source: 'node-trigger', target: 'node-set', animated: true },
        ],
      });

      setWorkflows([newWf, ...workflows]);
      setSelectedWorkflow(newWf);
      setActiveView('editor');
      loadData();
    } catch (err: any) {
      alert(`Failed to create workflow: ${err.message}`);
    }
  };

  // Delete workflow
  const handleDeleteWorkflow = async (id: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      try {
        await api.deleteWorkflow(id);
        setWorkflows(workflows.filter((w) => w.id !== id));
        if (selectedWorkflow?.id === id) {
          setSelectedWorkflow(null);
          setActiveView('workflows');
        }
        loadData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Run workflow from list/dashboard
  const handleRunWorkflow = async (id: string) => {
    try {
      await api.triggerExecution(id);
      loadData();
      alert('Workflow execution completed! Check Executions tab for full logs.');
    } catch (err: any) {
      alert(`Execution Error: ${err.message}`);
    }
  };

  const handleWorkflowSaved = (saved: Workflow) => {
    setWorkflows(workflows.map((w) => (w.id === saved.id ? saved : w)));
    setSelectedWorkflow(saved);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-forge-950 font-sans text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={(v) => {
          setActiveView(v);
          if (v !== 'editor') setSelectedWorkflow(null);
        }}
        stats={
          stats
            ? { totalWorkflows: stats.totalWorkflows, totalExecutions: stats.totalExecutions }
            : undefined
        }
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          activeView={activeView}
          activeWorkflowName={selectedWorkflow?.name}
          onNewWorkflow={handleCreateWorkflow}
        />

        {/* View Switcher */}
        {activeView === 'dashboard' && (
          <DashboardView
            stats={stats}
            workflows={workflows}
            onSelectWorkflow={handleSelectWorkflow}
            onCreateWorkflow={handleCreateWorkflow}
            onViewExecutions={() => setActiveView('executions')}
            onRunWorkflow={handleRunWorkflow}
          />
        )}

        {activeView === 'workflows' && (
          <WorkflowsListView
            workflows={workflows}
            onSelectWorkflow={handleSelectWorkflow}
            onCreateWorkflow={handleCreateWorkflow}
            onDeleteWorkflow={handleDeleteWorkflow}
            onRunWorkflow={handleRunWorkflow}
            onRefresh={loadData}
          />
        )}

        {activeView === 'editor' && selectedWorkflow && (
          <WorkflowEditor
            workflow={selectedWorkflow}
            onBack={() => {
              setActiveView('workflows');
              setSelectedWorkflow(null);
              loadData();
            }}
            onWorkflowSaved={handleWorkflowSaved}
          />
        )}

        {activeView === 'executions' && (
          <ExecutionsListView executions={executions} onRefresh={loadData} />
        )}

        {activeView === 'credentials' && (
          <CredentialsView credentials={credentials} onRefresh={loadData} />
        )}

        {activeView === 'templates' && (
          <TemplatesView
            onWorkflowCreated={(wf) => {
              setWorkflows([wf, ...workflows]);
              setSelectedWorkflow(wf);
              setActiveView('editor');
              loadData();
            }}
          />
        )}

        {activeView === 'settings' && <SettingsView />}
      </div>
    </div>
  );
};

export default App;
