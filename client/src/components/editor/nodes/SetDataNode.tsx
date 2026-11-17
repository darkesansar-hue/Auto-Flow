import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Edit3 } from 'lucide-react';

export const SetDataNode = memo(({ data, selected }: NodeProps) => {
  const values = Array.isArray(data.values) ? data.values : [];
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
      {/* Input Port */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-forge-900 -left-1.5 hover:!scale-125 transition-transform"
      />

      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-purple-950/60 to-forge-850 rounded-t-xl border-b border-forge-700/60 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Edit3 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide">
              {String(data.label || 'Set Data')}
            </div>
            <div className="text-[10px] text-purple-300 font-mono">Transform Node</div>
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
        {values.length === 0 ? (
          <div className="text-slate-500 italic">No variables defined yet</div>
        ) : (
          <div className="space-y-1">
            {values.slice(0, 3).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between font-mono text-[10px] bg-forge-950/60 px-2 py-1 rounded border border-forge-700/30">
                <span className="text-slate-300">{item.key || 'key'}:</span>
                <span className="text-indigo-300 truncate max-w-[120px]">{String(item.value)}</span>
              </div>
            ))}
            {values.length > 3 && (
              <div className="text-[10px] text-slate-500 text-center font-mono">
                +{values.length - 3} more fields
              </div>
            )}
          </div>
        )}
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
