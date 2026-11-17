import React, { useState, useRef } from 'react';
import { 
  Workflow as WorkflowIcon, 
  Plus, 
  Search, 
  PlayCircle, 
  Trash2, 
  Copy, 
  Upload,
  Clock, 
  ExternalLink,
  Layers,
  Radio,
  Bot
} from 'lucide-react';
import { Workflow } from '../../types';
import { api } from '../../api/client';

interface WorkflowsListViewProps {
  workflows: Workflow[];
  onSelectWorkflow: (id: string) => void;
  onCreateWorkflow: () => void;
  onDeleteWorkflow: (id: string) => void;
  onRunWorkflow: (id: string) => void;
  onRefresh: () => void;
}

export const WorkflowsListView: React.FC<WorkflowsListViewProps> = ({
  workflows,
  onSelectWorkflow,
  onCreateWorkflow,
  onDeleteWorkflow,
  onRunWorkflow,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = workflows.filter((w) =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.description && w.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDuplicate = async (id: string) => {
    try {
      await api.duplicateWorkflow(id);
      onRefresh();
    } catch (err: any) {
      alert(`Duplicate failed: ${err.message}`);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.nodes && parsed.edges) {
          await api.createWorkflow({
            name: parsed.name || 'Imported Workflow',
            description: parsed.description || 'Imported from FlowForge / n8n JSON schema',
            nodes: parsed.nodes,
            edges: parsed.edges,
          });
          onRefresh();
          alert('Workflow imported and saved successfully!');
        }
      } catch (err: any) {
        alert(`Failed to import JSON: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-forge-950">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search workflows & pipelines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-forge-900 border border-forge-700/60 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-forge-accent"
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Import JSON Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-forge-850 hover:bg-forge-800 text-slate-300 text-xs font-semibold border border-forge-700/60 transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>

          <button
            onClick={onCreateWorkflow}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-forge-accent hover:bg-forge-accentHover text-white text-xs font-semibold shadow-glow-indigo transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Workflow</span>
          </button>
        </div>
      </div>

      {/* Workflows Table */}
      <div className="rounded-xl bg-forge-900 border border-forge-700/60 overflow-hidden shadow-glass">
        <table className="w-full text-left text-xs">
          <thead className="bg-forge-850/80 text-slate-400 uppercase font-mono text-[11px] border-b border-forge-700/60">
            <tr>
              <th className="py-3.5 px-6 font-semibold">Workflow</th>
              <th className="py-3.5 px-6 font-semibold">Triggers & AI</th>
              <th className="py-3.5 px-6 font-semibold">Nodes</th>
              <th className="py-3.5 px-6 font-semibold">Updated</th>
              <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forge-700/40 text-slate-300">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  No workflows found.
                </td>
              </tr>
            ) : (
              filtered.map((wf) => {
                const hasWebhook = wf.nodes?.some((n) => n.type === 'webhookTrigger');
                const hasAI = wf.nodes?.some((n) => ['aiAgent', 'llmChat', 'textClassifier'].includes(n.type));

                return (
                  <tr key={wf.id} className="hover:bg-forge-850/50 transition-colors">
                    <td className="py-4 px-6">
                      <div 
                        onClick={() => onSelectWorkflow(wf.id)}
                        className="font-semibold text-slate-100 hover:text-forge-accent cursor-pointer text-sm"
                      >
                        {wf.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {wf.description || 'Custom visual automation pipeline'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                        {hasWebhook && (
                          <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-300 border border-orange-500/20 flex items-center space-x-1">
                            <Radio className="w-2.5 h-2.5" />
                            <span>Webhook Active</span>
                          </span>
                        )}
                        {hasAI && (
                          <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20 flex items-center space-x-1">
                            <Bot className="w-2.5 h-2.5" />
                            <span>AI Powered</span>
                          </span>
                        )}
                        {!hasWebhook && !hasAI && (
                          <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {wf.trigger_type || 'manual'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1.5 text-slate-400 font-mono">
                        <Layers className="w-3.5 h-3.5 text-slate-500" />
                        <span>{wf.nodes?.length || 0} nodes</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                      {new Date(wf.updated_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onRunWorkflow(wf.id)}
                          className="px-2.5 py-1 rounded bg-forge-accent/20 hover:bg-forge-accent text-indigo-300 hover:text-white transition-all font-medium flex items-center space-x-1"
                          title="Execute Workflow"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Run</span>
                        </button>

                        <button
                          onClick={() => handleDuplicate(wf.id)}
                          className="p-1.5 rounded hover:bg-forge-800 text-slate-400 hover:text-slate-100"
                          title="Duplicate Workflow"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onSelectWorkflow(wf.id)}
                          className="p-1.5 rounded hover:bg-forge-800 text-slate-400 hover:text-slate-100"
                          title="Open Canvas"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDeleteWorkflow(wf.id)}
                          className="p-1.5 rounded hover:bg-rose-500/20 text-slate-400 hover:text-forge-rose"
                          title="Delete Workflow"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
