import React, { useState } from 'react';
import { 
  PlayCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  ChevronRight, 
  ArrowLeft,
  Terminal,
  Code,
  ShieldAlert
} from 'lucide-react';
import { Execution, ExecutionStep } from '../../types';
import { api } from '../../api/client';

interface ExecutionsListViewProps {
  executions: Execution[];
  onRefresh: () => void;
}

export const ExecutionsListView: React.FC<ExecutionsListViewProps> = ({ executions, onRefresh }) => {
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [selectedStep, setSelectedStep] = useState<ExecutionStep | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all');

  const filtered = executions.filter((e) => {
    if (statusFilter === 'all') return true;
    return e.status === statusFilter;
  });

  const handleInspect = async (exec: Execution) => {
    setLoadingDetails(true);
    try {
      const full = await api.getExecution(exec.id);
      setSelectedExecution(full);
      setSelectedStep(full.steps?.[0] || null);
    } catch (err) {
      setSelectedExecution(exec);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-forge-950">
      {/* List Column */}
      <div className={`flex-1 flex flex-col overflow-y-auto p-8 space-y-6 ${selectedExecution ? 'hidden md:flex' : 'flex'}`}>
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-forge-accent text-white shadow-glow-indigo'
                  : 'bg-forge-900 text-slate-400 hover:bg-forge-800'
              }`}
            >
              All Runs
            </button>
            <button
              onClick={() => setStatusFilter('success')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'success'
                  ? 'bg-forge-emerald text-white'
                  : 'bg-forge-900 text-slate-400 hover:bg-forge-800'
              }`}
            >
              Successful
            </button>
            <button
              onClick={() => setStatusFilter('error')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'error'
                  ? 'bg-forge-rose text-white'
                  : 'bg-forge-900 text-slate-400 hover:bg-forge-800'
              }`}
            >
              Failed
            </button>
          </div>

          <button
            onClick={onRefresh}
            className="text-xs text-forge-accent hover:text-indigo-400 font-medium cursor-pointer"
          >
            Refresh Logs
          </button>
        </div>

        {/* Executions Table */}
        <div className="rounded-xl bg-forge-900 border border-forge-700/60 overflow-hidden shadow-glass">
          <table className="w-full text-left text-xs">
            <thead className="bg-forge-850/80 text-slate-400 uppercase font-mono text-[11px] border-b border-forge-700/60">
              <tr>
                <th className="py-3.5 px-6 font-semibold">Status</th>
                <th className="py-3.5 px-6 font-semibold">Workflow</th>
                <th className="py-3.5 px-6 font-semibold">Execution ID</th>
                <th className="py-3.5 px-6 font-semibold">Duration</th>
                <th className="py-3.5 px-6 font-semibold">Started</th>
                <th className="py-3.5 px-6 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forge-700/40 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No executions recorded.
                  </td>
                </tr>
              ) : (
                filtered.map((exec) => (
                  <tr
                    key={exec.id}
                    onClick={() => handleInspect(exec)}
                    className={`hover:bg-forge-850/50 cursor-pointer transition-colors ${
                      selectedExecution?.id === exec.id ? 'bg-forge-850/80' : ''
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {exec.status === 'success' ? (
                          <span className="flex items-center space-x-1 text-forge-emerald font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="uppercase text-[10px]">Success</span>
                          </span>
                        ) : exec.status === 'error' ? (
                          <span className="flex items-center space-x-1 text-forge-rose font-semibold">
                            <XCircle className="w-4 h-4" />
                            <span className="uppercase text-[10px]">Error</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 text-forge-amber font-semibold">
                            <Clock className="w-4 h-4 animate-spin" />
                            <span className="uppercase text-[10px]">Running</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-200">
                      {exec.workflow_name || 'Workflow'}
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-slate-400">
                      {exec.id}
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-slate-300">
                      {exec.duration_ms}ms
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-slate-400">
                      {new Date(exec.started_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-500 inline" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Execution Details & Step Inspector Panel */}
      {selectedExecution && (
        <div className="w-full md:w-[480px] lg:w-[540px] bg-forge-900 border-l border-forge-700/60 flex flex-col h-full shadow-2xl z-20">
          {/* Header */}
          <div className="p-4 border-b border-forge-700/60 flex items-center justify-between bg-forge-850/50">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedExecution(null)}
                className="p-1.5 rounded-lg hover:bg-forge-800 text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-sm font-semibold text-white">Execution Inspector</h3>
                <p className="text-[10px] font-mono text-slate-400">{selectedExecution.id}</p>
              </div>
            </div>

            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
              selectedExecution.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {selectedExecution.status} ({selectedExecution.duration_ms}ms)
            </span>
          </div>

          {/* Error Banner if any */}
          {selectedExecution.error_message && (
            <div className="p-3.5 bg-rose-500/10 border-b border-rose-500/30 flex items-start space-x-2 text-rose-300 text-xs">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="font-mono text-[11px] break-all">{selectedExecution.error_message}</div>
            </div>
          )}

          {/* Stepper Tabs */}
          <div className="p-3 bg-forge-950/60 border-b border-forge-700/50 flex space-x-2 overflow-x-auto">
            {selectedExecution.steps?.map((step, idx) => {
              const isSelected = selectedStep?.id === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setSelectedStep(step)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                    isSelected
                      ? 'bg-forge-accent text-white shadow-sm'
                      : 'bg-forge-850 text-slate-400 hover:text-slate-200 hover:bg-forge-800'
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-70">#{idx + 1}</span>
                  <span>{step.node_name}</span>
                  {step.status === 'success' ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-forge-emerald"></span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-forge-rose"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Step Data Inspector */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedStep ? (
              <div className="space-y-4">
                {/* Step Meta */}
                <div className="p-3 rounded-lg bg-forge-850 border border-forge-700/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Node Type:</span>{' '}
                    <span className="font-mono text-indigo-300">{selectedStep.node_type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Latency:</span>{' '}
                    <span className="font-mono text-forge-cyan">{selectedStep.duration_ms}ms</span>
                  </div>
                </div>

                {/* Output Data */}
                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                    <Code className="w-3.5 h-3.5 text-forge-emerald" />
                    <span>Output JSON</span>
                  </div>
                  <pre className="p-3 rounded-lg bg-forge-950 border border-forge-700/60 text-slate-300 font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed">
                    {JSON.stringify(selectedStep.output_data, null, 2) || '// No output data'}
                  </pre>
                </div>

                {/* Input Data */}
                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                    <Terminal className="w-3.5 h-3.5 text-slate-400" />
                    <span>Inbound Input Data</span>
                  </div>
                  <pre className="p-3 rounded-lg bg-forge-950 border border-forge-700/60 text-slate-400 font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed">
                    {JSON.stringify(selectedStep.input_data, null, 2) || '// Initial root payload'}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Select an execution step to view input and output payloads.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
