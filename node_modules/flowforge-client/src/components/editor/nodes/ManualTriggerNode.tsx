import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { PlayCircle, Zap } from 'lucide-react';

export const ManualTriggerNode = memo(({ data, selected }: NodeProps) => {
  const status = data.executionStatus as 'running' | 'success' | 'error' | undefined;

  return (
    <div
      className={`w-64 rounded-xl bg-forge-900 border transition-all shadow-lg ${
        selected ? 'border-forge-accent ring-2 ring-indigo-500/20 shadow-glow-indigo' : 'border-forge-700/80'
      } ${
        status === 'running' ? 'border-forge-cyan animate-pulse' :
        status === 'success' ? 'border-forge-emerald' :
        status === 'error' ? 'border-forge-rose' : ''
      }`}
    >
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-indigo-950/60 to-forge-850 rounded-t-xl border-b border-forge-700/60 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-forge-accent">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide">
              {String(data.label || 'Manual Trigger')}
            </div>
            <div className="text-[10px] text-indigo-300 font-mono">Trigger Node</div>
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
      <div className="p-3 text-[11px] text-slate-400">
        <div>{String(data.description || 'Starts workflow manually on demand')}</div>
      </div>

      {/* Output Port */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-forge-accent !border-2 !border-forge-900 -right-1.5 hover:!scale-125 transition-transform"
      />
    </div>
  );
});
