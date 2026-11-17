import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Bot, Sparkles } from 'lucide-react';

export const AiAgentNode = memo(({ data, selected }: NodeProps) => {
  const role = String(data.role || 'Autonomous Assistant');
  const model = String(data.model || 'gpt-4o-mini');
  const status = data.executionStatus as 'running' | 'success' | 'error' | undefined;

  return (
    <div
      className={`w-72 rounded-xl bg-forge-900 border transition-all shadow-lg ${
        selected ? 'border-forge-accent ring-2 ring-indigo-500/20 shadow-glow-indigo' : 'border-forge-700/80'
      } ${
        status === 'running' ? 'border-forge-cyan animate-pulse' :
        status === 'success' ? 'border-forge-emerald' :
        status === 'error' ? 'border-forge-rose' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-forge-900 -left-1.5 hover:!scale-125 transition-transform"
      />

      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-violet-950/70 to-forge-850 rounded-t-xl border-b border-forge-700/60 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-glow-indigo">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide">
              {String(data.label || 'AI Agent')}
            </div>
            <div className="text-[10px] text-violet-300 font-mono flex items-center space-x-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Multi-Step Reasoning</span>
            </div>
          </div>
        </div>

        {status && (
          <span className={`w-2 h-2 rounded-full ${
            status === 'success' ? 'bg-forge-emerald' :
            status === 'error' ? 'bg-forge-rose' : 'bg-forge-cyan animate-ping'
          }`} />
        )}
      </div>

      {/* Body */}
      <div className="p-3 space-y-2 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Agent Role:</span>
          <span className="font-semibold text-slate-200">{role}</span>
        </div>

        <div className="flex items-center justify-between font-mono text-[10px]">
          <span className="text-slate-500">Model:</span>
          <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
            {model}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-violet-400 !border-2 !border-forge-900 -right-1.5 hover:!scale-125 transition-transform"
      />
    </div>
  );
});
