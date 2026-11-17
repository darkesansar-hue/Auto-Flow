import React from 'react';
import { 
  LayoutDashboard, 
  Workflow as WorkflowIcon, 
  PlayCircle, 
  KeyRound, 
  Settings, 
  Sparkles,
  ShieldCheck,
  Cpu,
  Share2,
  ExternalLink
} from 'lucide-react';
import { ActiveView } from '../../types';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  stats?: { totalWorkflows: number; totalExecutions: number };
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, stats }) => {
  const navItems = [
    { 
      id: 'dashboard' as ActiveView, 
      label: 'Overview', 
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'workflows' as ActiveView,
      label: 'Workflows',
      icon: WorkflowIcon,
      badge: stats ? String(stats.totalWorkflows) : null
    },
    {
      id: 'templates' as ActiveView,
      label: 'Templates',
      icon: Sparkles,
      badge: '5'
    },
    {
      id: 'executions' as ActiveView,
      label: 'Executions',
      icon: PlayCircle,
      badge: stats ? String(stats.totalExecutions) : null
    },
    {
      id: 'credentials' as ActiveView,
      label: 'Credentials',
      icon: KeyRound,
      badge: null
    },
    {
      id: 'settings' as ActiveView,
      label: 'Settings',
      icon: Settings,
      badge: null
    },
  ];

  return (
    <aside className="w-60 bg-n8n-card border-r border-n8n-border flex flex-col h-screen select-none z-20 transition-all font-sans">
      {/* n8n-Style Connected Nodes Brand Header */}
      <div className="p-4 border-b border-n8n-border flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveView('dashboard')}>
          {/* n8n Connected Nodes Logo Mark */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF6D5A] via-[#FF5A5F] to-[#EA4B71] flex items-center justify-center shadow-n8n-glow relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-white">
              <circle cx="6" cy="6" r="2.5" fill="white" />
              <circle cx="18" cy="8" r="2.5" fill="white" />
              <circle cx="12" cy="18" r="2.5" fill="white" />
              <line x1="8" y1="7" x2="16" y2="8" stroke="white" strokeWidth="2" />
              <line x1="7" y1="8" x2="11" y2="16" stroke="white" strokeWidth="2" />
              <line x1="17" y1="10" x2="13" y2="16" stroke="white" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <div className="font-extrabold text-[15px] tracking-wide text-white flex items-center space-x-1">
              <span>n8n</span>
              <span className="text-[11px] font-semibold text-n8n-coral tracking-normal uppercase px-1.5 py-0.2 rounded bg-n8n-coral/10 border border-n8n-coral/20">
                PRO
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 font-medium tracking-tight">
              Workflow Automation
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
          Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-n8n-coral/15 text-n8n-coral font-semibold border border-n8n-coral/25 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-n8n-coral' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isActive ? 'bg-n8n-coral/20 text-n8n-coral font-bold' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Community / Docs / Status Footer */}
      <div className="p-3 border-t border-n8n-border bg-n8n-bg/60 space-y-2">
        <div className="bg-zinc-900/90 rounded-lg p-2.5 border border-n8n-border text-[11px] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Workflow Engine</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">ONLINE</span>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono flex items-center justify-between pt-1 border-t border-zinc-800">
            <span>RAM Footprint</span>
            <span className="text-zinc-300">~82 MB</span>
          </div>
        </div>

        <div className="text-center pt-1">
          <span className="text-[10px] text-zinc-500 font-mono">n8n Enterprise v1.78</span>
        </div>
      </div>
    </aside>
  );
};
