import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MessageSquareText } from 'lucide-react';

export const LlmChatNode = memo(({ data, selected }: NodeProps) => {
  const model = String(data.model || 'gemini-1.5-flash');
  const prompt = String(data.prompt || 'Summarize: {{$json.text}}');
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
      <div className="p-3 bg-gradient-to-r from-fuchsia-950/70 to-forge-850 rounded-t-xl border-b border-forge-700/60 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400">
            <MessageSquareText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide">
              {String(data.label || 'LLM Chat Model')}
            </div>
            <div className="text-[10px] text-fuchsia-300 font-mono">Generation & Vision</div>
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
      <div className="p-3 space-y-1.5 text-[11px]">
        <div className="flex justify-between items-center font-mono text-[10px]">
          <span className="text-slate-400">Target Model:</span>
          <span className="text-fuchsia-300">{model}</span>
        </div>
        <div className="p-1.5 rounded bg-forge-950 font-mono text-[10px] text-slate-400 truncate border border-forge-700/30">
          {prompt}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-fuchsia-400 !border-2 !border-forge-900 -right-1.5 hover:!scale-125 transition-transform"
      />
    </div>
  );
});
