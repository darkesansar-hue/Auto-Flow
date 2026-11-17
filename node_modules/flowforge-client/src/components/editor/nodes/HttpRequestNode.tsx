import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Globe, ArrowRight } from 'lucide-react';

export const HttpRequestNode = memo(({ data, selected }: NodeProps) => {
  const method = String(data.method || 'GET').toUpperCase();
  const url = String(data.url || 'https://api.example.com/data');
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
      <div className="p-3 bg-gradient-to-r from-blue-950/60 to-forge-850 rounded-t-xl border-b border-forge-700/60 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-forge-cyan">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide">
              {String(data.label || 'HTTP Request')}
            </div>
            <div className="text-[10px] text-forge-cyan font-mono">Action Node</div>
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
        <div className="flex items-center space-x-2">
          <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
            method === 'GET' ? 'bg-emerald-500/20 text-emerald-300' :
            method === 'POST' ? 'bg-indigo-500/20 text-indigo-300' :
            method === 'PUT' ? 'bg-amber-500/20 text-amber-300' :
            'bg-rose-500/20 text-rose-300'
          }`}>
            {method}
          </span>
          <span className="font-mono text-slate-300 truncate text-[11px]" title={url}>
            {url}
          </span>
        </div>

        {(data.executionResponse as any) && (
          <div className="text-[10px] font-mono text-slate-400 bg-forge-950/80 p-1.5 rounded border border-forge-700/40 truncate">
            Status: {(data.executionResponse as any).statusCode || 200} OK
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
