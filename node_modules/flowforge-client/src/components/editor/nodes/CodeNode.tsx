import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Terminal, Code2 } from 'lucide-react';

export const CodeNode = memo(({ data, selected }: NodeProps) => {
  const assignments = Array.isArray(data.assignments) ? data.assignments : [];
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
      <div className="p-3 bg-gradient-to-r from-emerald-950/70 to-forge-850 rounded-t-xl border-b border-forge-700/60 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide">
              {String(data.label || 'Code Transformation')}
            </div>
            <div className="text-[10px] text-emerald-300 font-mono">Safe JS Runner</div>
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
      <div className="p-3 text-[11px] font-mono text-slate-300 space-y-1">
        <div className="text-slate-400 text-[10px]">Transforms input records:</div>
        <div className="bg-forge-950/80 p-2 rounded border border-forge-700/30 text-[10px] text-emerald-300 truncate">
          {assignments.length > 0 
            ? `${assignments.length} custom mapped properties` 
            : 'return items.map(formatData);'}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-forge-900 -right-1.5 hover:!scale-125 transition-transform"
      />
    </div>
  );
});
