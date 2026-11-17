import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FileCode2, Braces } from 'lucide-react';

export const StructuredExtractorNode = memo(({ data, selected }: NodeProps) => {
  const fields = Array.isArray(data.fields) ? data.fields : [{ name: 'email' }, { name: 'name' }];
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
            <Braces className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide">
              {String(data.label || 'Structured Extractor')}
            </div>
            <div className="text-[10px] text-emerald-300 font-mono">JSON Schema Parser</div>
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
        <div className="text-slate-400 text-[10px]">Extracting schema fields:</div>
        <div className="flex flex-wrap gap-1">
          {fields.map((f: any, idx: number) => (
            <span key={idx} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              {f.name || 'field'}
            </span>
          ))}
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
