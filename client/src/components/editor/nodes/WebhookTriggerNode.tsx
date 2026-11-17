import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Radio, Copy, Check } from 'lucide-react';

export const WebhookTriggerNode = memo(({ data, selected }: NodeProps) => {
  const webhookId = String(data.webhookId || 'lead-capture');
  const method = String(data.method || 'POST').toUpperCase();
  const status = data.executionStatus as 'running' | 'success' | 'error' | undefined;
  const [copied, setCopied] = React.useState(false);

  const copyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/api/webhooks/${webhookId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-orange-950/60 to-forge-850 rounded-t-xl border-b border-forge-700/60 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide">
              {String(data.label || 'Webhook Trigger')}
            </div>
            <div className="text-[10px] text-orange-300 font-mono">Instant HTTP Trigger</div>
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
          <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
            {method}
          </span>
          <button
            onClick={copyUrl}
            className="text-[10px] text-slate-400 hover:text-white flex items-center space-x-1 bg-forge-950 px-2 py-0.5 rounded border border-forge-700/50"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy Endpoint'}</span>
          </button>
        </div>

        <div className="font-mono text-[10px] text-slate-300 bg-forge-950/90 p-2 rounded border border-forge-700/40 truncate">
          /api/webhooks/{webhookId}
        </div>
      </div>

      {/* Output Port */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-orange-400 !border-2 !border-forge-900 -right-1.5 hover:!scale-125 transition-transform"
      />
    </div>
  );
});
