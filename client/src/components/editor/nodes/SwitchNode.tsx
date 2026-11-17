import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Shuffle } from 'lucide-react';

export const SwitchNode = memo(({ data, selected }: NodeProps) => {
  const rules = Array.isArray(data.rules) ? data.rules : [
    { label: 'Rule 0', value: 'billing' },
    { label: 'Rule 1', value: 'support' },
    { label: 'Rule 2', value: 'sales' }
  ];
  const status = data.executionStatus as 'running' | 'success' | 'error' | undefined;
  const activeBranch = data.evaluatedBranch as string | undefined;

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
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-forge-900 -left-1.5 hover:!scale-125 transition-transform"
      />

      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-amber-950/70 to-forge-850 rounded-t-xl border-b border-forge-700/60 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Shuffle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide">
              {String(data.label || 'Switch Router')}
            </div>
            <div className="text-[10px] text-amber-300 font-mono">Multi-Branch Dispatch</div>
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
      <div className="p-3 space-y-2 text-[10px] font-mono">
        <div className="text-slate-400">Evaluates {String(data.field || '{{$json.type}}')}</div>
        <div className="space-y-1.5">
          {rules.map((r: any, idx: number) => {
            const handleId = `output_${idx}`;
            const isMatched = activeBranch === handleId;
            return (
              <div key={idx} className={`flex justify-between items-center px-2 py-1 rounded bg-forge-950/60 border ${
                isMatched ? 'border-forge-accent text-indigo-300' : 'border-forge-700/30 text-slate-400'
              }`}>
                <span>Output #{idx}: {r.value || r.label}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-forge-accent"></span>
              </div>
            );
          })}
          <div className={`flex justify-between items-center px-2 py-1 rounded bg-forge-950/60 border ${
            activeBranch === 'default' ? 'border-forge-emerald text-emerald-300' : 'border-forge-700/30 text-slate-500'
          }`}>
            <span>Default Fallback</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
          </div>
        </div>
      </div>

      {/* Multi Output Handles */}
      <Handle
        type="source"
        id="output_0"
        position={Position.Right}
        style={{ top: '38%' }}
        className="!w-3 !h-3 !bg-indigo-400 !border-2 !border-forge-900 -right-1.5"
      />
      <Handle
        type="source"
        id="output_1"
        position={Position.Right}
        style={{ top: '56%' }}
        className="!w-3 !h-3 !bg-indigo-400 !border-2 !border-forge-900 -right-1.5"
      />
      <Handle
        type="source"
        id="output_2"
        position={Position.Right}
        style={{ top: '74%' }}
        className="!w-3 !h-3 !bg-indigo-400 !border-2 !border-forge-900 -right-1.5"
      />
      <Handle
        type="source"
        id="default"
        position={Position.Right}
        style={{ top: '90%' }}
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-forge-900 -right-1.5"
      />
    </div>
  );
});
