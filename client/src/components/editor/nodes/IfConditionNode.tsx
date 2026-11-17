import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { GitBranch, Check, X } from 'lucide-react';

export const IfConditionNode = memo(({ data, selected }: NodeProps) => {
  const field = String(data.field || '{{$json.status}}');
  const operator = String(data.operator || 'equals');
  const expectedValue = String(data.value || 'true');
  const status = data.executionStatus as 'running' | 'success' | 'error' | undefined;
  const activeBranch = data.evaluatedBranch as 'true' | 'false' | undefined;

  return (
    <div
      className={`w-72 rounded-xl bg-forge-900 border transition-all shadow-lg relative ${
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
      <div className="p-3 bg-gradient-to-r from-amber-950/60 to-forge-850 rounded-t-xl border-b border-forge-700/60 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide">
              {String(data.label || 'IF Condition')}
            </div>
            <div className="text-[10px] text-amber-300 font-mono">Routing Logic</div>
          </div>
        </div>

        {status && (
          <span className={`w-2 h-2 rounded-full ${
            status === 'success' ? 'bg-forge-emerald' :
            status === 'error' ? 'bg-forge-rose' : 'bg-forge-cyan animate-ping'
          }`} />
        )}
      </div>

      {/* Body Rule Preview */}
      <div className="p-3 space-y-2 text-[11px]">
        <div className="font-mono text-[10px] bg-forge-950/80 p-2 rounded border border-forge-700/40 space-y-1">
          <div className="text-slate-400 truncate">Expr: <span className="text-indigo-300">{field}</span></div>
          <div className="flex items-center space-x-1">
            <span className="text-amber-400 uppercase text-[9px]">{operator}</span>
            <span className="text-slate-200">"{expectedValue}"</span>
          </div>
        </div>

        {/* Branch Labels */}
        <div className="flex justify-between items-center text-[10px] font-mono pt-1 text-slate-400">
          <span className="text-slate-500">Output Handles:</span>
          <div className="space-y-2 text-right">
            <div className={`flex items-center space-x-1 justify-end ${activeBranch === 'true' ? 'text-forge-emerald font-bold' : 'text-slate-400'}`}>
              <Check className="w-3 h-3 text-forge-emerald" />
              <span>True</span>
            </div>
            <div className={`flex items-center space-x-1 justify-end ${activeBranch === 'false' ? 'text-forge-rose font-bold' : 'text-slate-400'}`}>
              <X className="w-3 h-3 text-forge-rose" />
              <span>False</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Output Handles: True & False */}
      <Handle
        type="source"
        id="true"
        position={Position.Right}
        style={{ top: '65%' }}
        className="!w-3 !h-3 !bg-forge-emerald !border-2 !border-forge-900 -right-1.5 hover:!scale-125 transition-transform"
      />
      <Handle
        type="source"
        id="false"
        position={Position.Right}
        style={{ top: '85%' }}
        className="!w-3 !h-3 !bg-forge-rose !border-2 !border-forge-900 -right-1.5 hover:!scale-125 transition-transform"
      />
    </div>
  );
});
