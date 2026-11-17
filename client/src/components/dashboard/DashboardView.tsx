import React from 'react';
import { 
  Workflow as WorkflowIcon, 
  PlayCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap, 
  ArrowUpRight, 
  Plus, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { DashboardStats, Workflow } from '../../types';

interface DashboardViewProps {
  stats: DashboardStats | null;
  workflows: Workflow[];
  onSelectWorkflow: (id: string) => void;
  onCreateWorkflow: () => void;
  onViewExecutions: () => void;
  onRunWorkflow: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  workflows,
  onSelectWorkflow,
  onCreateWorkflow,
  onViewExecutions,
  onRunWorkflow,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-7 bg-n8n-bg font-sans">
      {/* n8n-Style Welcome Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-[#2A1718] p-7 border border-n8n-border overflow-hidden shadow-glass">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-n8n-coral/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-n8n-coral text-xs font-semibold tracking-wider uppercase mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Visual Automation</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Build AI Agents, Connect APIs & Automate Everything
            </h2>
            <p className="text-zinc-400 text-xs mt-1.5 max-w-xl leading-relaxed">
              Combine autonomous AI models, live webhooks, and multi-branch logic into seamless visual pipelines.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onCreateWorkflow}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-n8n-coral to-n8n-pink hover:opacity-90 text-white text-xs font-bold shadow-n8n-glow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Workflow</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workflows */}
        <div className="p-5 rounded-xl bg-n8n-card border border-n8n-border flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-400">Total Workflows</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {stats?.totalWorkflows ?? workflows.length}
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {stats?.activeWorkflows ?? workflows.filter(w => w.status === 'active').length} active pipelines
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-n8n-coral/10 border border-n8n-coral/20 flex items-center justify-center text-n8n-coral">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Total Executions */}
        <div className="p-5 rounded-xl bg-n8n-card border border-n8n-border flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-400">Total Executions</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {stats?.totalExecutions ?? 0}
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Executed across all nodes</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <PlayCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Success Rate */}
        <div className="p-5 rounded-xl bg-n8n-card border border-n8n-border flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-400">Success Rate</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">
              {stats?.successRate ?? 100}%
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {stats?.successfulExecutions ?? 0} successful runs
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Engine Security */}
        <div className="p-5 rounded-xl bg-n8n-card border border-n8n-border flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-400">SSRF Protection</p>
            <h3 className="text-base font-bold text-white mt-1">Zero-Eval Sandboxed</h3>
            <p className="text-[11px] text-emerald-400 mt-0.5 font-mono">Private IP shield active</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Active Workflows & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflows Quick Access (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center space-x-2">
              <WorkflowIcon className="w-4 h-4 text-n8n-coral" />
              <span>Active Automation Workflows</span>
            </h3>
            <button
              onClick={() => onSelectWorkflow(workflows[0]?.id || '')}
              className="text-xs text-n8n-coral hover:opacity-80 font-medium flex items-center space-x-1"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflows.slice(0, 4).map((wf) => (
              <div
                key={wf.id}
                className="group p-5 rounded-xl bg-n8n-card hover:bg-n8n-cardHover border border-n8n-border hover:border-n8n-coral/40 transition-all flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {wf.nodes?.length || 0} Nodes
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" title="Active"></span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-3 group-hover:text-n8n-coral transition-colors">
                    {wf.name}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                    {wf.description || 'Custom n8n visual automation workflow'}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <button
                    onClick={() => onSelectWorkflow(wf.id)}
                    className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Open Canvas</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onRunWorkflow(wf.id)}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-n8n-coral/15 hover:bg-n8n-coral text-n8n-coral hover:text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Run</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Executions Timeline (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Recent Executions</span>
            </h3>
            <button
              onClick={onViewExecutions}
              className="text-xs text-n8n-coral hover:opacity-80 font-medium flex items-center space-x-1"
            >
              <span>History</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="rounded-xl bg-n8n-card border border-n8n-border p-4 divide-y divide-zinc-800/80">
            {(!stats?.recentExecutions || stats.recentExecutions.length === 0) ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                No recent executions yet. Click "Run" on any workflow to start an execution.
              </div>
            ) : (
              stats.recentExecutions.map((exec) => (
                <div key={exec.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {exec.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : exec.status === 'error' ? (
                      <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-400 animate-spin flex-shrink-0" />
                    )}
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">
                        {exec.workflow_name || 'Workflow'}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        {new Date(exec.started_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {exec.duration_ms}ms
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
