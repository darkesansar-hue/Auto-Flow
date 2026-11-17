import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { CalendarClock } from 'lucide-react';

export const ScheduleTriggerNode = memo(({ data, selected }: NodeProps) => {
  const schedule = String(data.schedule || 'Every 15 minutes');
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
      <div className="p-3 bg-gradient-to-r from-sky-950/60 to-forge-850 rounded-t-xl border-b border-forge-700/60 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide">
              {String(data.label || 'Schedule Trigger')}
            </div>
            <div className="text-[10px] text-sky-300 font-mono">Cron Interval</div>
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
      <div className="p-3 text-[11px] text-slate-300 flex items-center justify-between">
        <span className="text-slate-400">Recurrence:</span>
        <span className="font-mono text-sky-300 bg-forge-950/80 px-2 py-0.5 rounded border border-forge-700/40">
          {schedule}
        </span>
      </div>

      {/* Output Port */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-sky-400 !border-2 !border-forge-900 -right-1.5 hover:!scale-125 transition-transform"
      />
    </div>
  );
});
