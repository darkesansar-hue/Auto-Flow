import React from 'react';
import { Plus, Search, Terminal, Bell, Play, CheckCircle2 } from 'lucide-react';
import { ActiveView } from '../../types';

interface HeaderProps {
  activeView: ActiveView;
  activeWorkflowName?: string;
  onNewWorkflow?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeView, activeWorkflowName, onNewWorkflow }) => {
  const [isActive, setIsActive] = React.useState(true);

  const getTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return 'Overview & Telemetry';
      case 'workflows':
        return 'Workflows';
      case 'templates':
        return 'Workflow Templates';
      case 'editor':
        return activeWorkflowName || 'Workflow Editor';
      case 'executions':
        return 'Execution History';
      case 'credentials':
        return 'Credentials Vault';
      case 'settings':
        return 'Settings & Variables';
      default:
        return 'n8n Workflow Automation';
    }
  };

  return (
    <header className="h-14 bg-n8n-card border-b border-n8n-border px-6 flex items-center justify-between select-none z-10 font-sans">
      {/* Title & Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <div className="text-xs text-zinc-500 flex items-center space-x-1.5">
          <span>Home</span>
          <span>/</span>
          <span className="text-zinc-200 font-medium">{getTitle()}</span>
        </div>

        {activeView === 'editor' && (
          <div className="flex items-center space-x-2 pl-3 border-l border-zinc-800">
            {/* n8n Active Workflow Toggle */}
            <button
              onClick={() => setIsActive(!isActive)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`}></span>
              <span>{isActive ? 'Active' : 'Inactive'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Global Actions */}
      <div className="flex items-center space-x-3">
        {onNewWorkflow && activeView !== 'editor' && (
          <button
            onClick={onNewWorkflow}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-n8n-coral to-n8n-pink hover:opacity-90 text-white text-xs font-semibold shadow-n8n-glow transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Workflow</span>
          </button>
        )}

        <div className="h-4 w-[1px] bg-zinc-800 mx-1"></div>

        {/* Runtime Badge */}
        <div className="flex items-center space-x-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-n8n-border text-xs text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-mono text-[11px]">Ready</span>
        </div>
      </div>
    </header>
  );
};
