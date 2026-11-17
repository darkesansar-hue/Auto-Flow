import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Globe, 
  Edit3, 
  GitBranch, 
  Clock, 
  Zap, 
  ShieldCheck, 
  Radio, 
  CalendarClock, 
  Bot, 
  MessageSquareText, 
  History, 
  Tags, 
  Braces, 
  Shuffle, 
  Filter, 
  Code2, 
  Repeat, 
  Key,
  Play,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { WorkflowNode } from '../../types';
import { api } from '../../api/client';

interface NodeConfigDrawerProps {
  node: WorkflowNode | null;
  onClose: () => void;
  onUpdateNodeData: (nodeId: string, updatedData: Record<string, any>) => void;
}

export const NodeConfigDrawer: React.FC<NodeConfigDrawerProps> = ({
  node,
  onClose,
  onUpdateNodeData,
}) => {
  if (!node) return null;

  const [formData, setFormData] = useState<Record<string, any>>({ ...node.data });
  const [testingStep, setTestingStep] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  useEffect(() => {
    setFormData({ ...node.data });
    setTestResult(null);
  }, [node]);

  const handleChange = (key: string, value: any) => {
    const next = { ...formData, [key]: value };
    setFormData(next);
    onUpdateNodeData(node.id, next);
  };

  // Helper for Set Data
  const handleAddSetValue = () => {
    const list = [...(formData.values || []), { key: '', value: '' }];
    handleChange('values', list);
  };

  const handleUpdateSetValue = (index: number, field: 'key' | 'value', val: string) => {
    const list = [...(formData.values || [])];
    list[index] = { ...list[index], [field]: val };
    handleChange('values', list);
  };

  const handleRemoveSetValue = (index: number) => {
    const list = (formData.values || []).filter((_: any, i: number) => i !== index);
    handleChange('values', list);
  };

  // Helper for Headers
  const handleAddHeader = () => {
    const list = [...(formData.headers || []), { key: '', value: '' }];
    handleChange('headers', list);
  };

  const handleUpdateHeader = (index: number, field: 'key' | 'value', val: string) => {
    const list = [...(formData.headers || [])];
    list[index] = { ...list[index], [field]: val };
    handleChange('headers', list);
  };

  const handleRemoveHeader = (index: number) => {
    const list = (formData.headers || []).filter((_: any, i: number) => i !== index);
    handleChange('headers', list);
  };

  // Helper for Switch Rules
  const handleAddSwitchRule = () => {
    const list = [...(formData.rules || []), { label: `Rule ${(formData.rules || []).length}`, value: '' }];
    handleChange('rules', list);
  };

  const handleUpdateSwitchRule = (index: number, val: string) => {
    const list = [...(formData.rules || [])];
    list[index] = { ...list[index], value: val };
    handleChange('rules', list);
  };

  const handleRemoveSwitchRule = (index: number) => {
    const list = (formData.rules || []).filter((_: any, i: number) => i !== index);
    handleChange('rules', list);
  };

  return (
    <div className="w-96 bg-forge-900 border-l border-forge-700/60 flex flex-col h-full shadow-2xl z-20 select-none">
      {/* Header */}
      <div className="p-4 border-b border-forge-700/60 flex items-center justify-between bg-forge-850/60">
        <div>
          <div className="text-[10px] uppercase font-mono text-slate-400">Node Configuration</div>
          <h3 className="text-sm font-bold text-white tracking-wide">{formData.label || node.id}</h3>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-forge-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* General Properties */}
        <div className="space-y-3">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Node Label</label>
            <input
              type="text"
              value={formData.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              className="w-full bg-forge-950 border border-forge-700/60 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-forge-accent"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Description</label>
            <input
              type="text"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full bg-forge-950 border border-forge-700/60 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-forge-accent"
            />
          </div>
        </div>

        <div className="border-t border-forge-700/60 pt-4">
          {/* 1. Webhook Trigger */}
          {node.type === 'webhookTrigger' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-1.5 text-orange-400 font-semibold">
                <Radio className="w-4 h-4" />
                <span>Webhook Trigger Settings</span>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Webhook Path ID</label>
                <input
                  type="text"
                  value={formData.webhookId || 'lead-capture'}
                  onChange={(e) => handleChange('webhookId', e.target.value)}
                  className="w-full bg-forge-950 border border-forge-700/60 rounded-lg px-3 py-1.5 font-mono text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">HTTP Method</label>
                <select
                  value={formData.method || 'POST'}
                  onChange={(e) => handleChange('method', e.target.value)}
                  className="w-full bg-forge-950 border border-forge-700/60 rounded-lg px-3 py-1.5 text-slate-200"
                >
                  <option value="POST">POST</option>
                  <option value="GET">GET</option>
                </select>
              </div>
            </div>
          )}

          {/* 2. Schedule Trigger */}
          {node.type === 'scheduleTrigger' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-1.5 text-sky-400 font-semibold">
                <CalendarClock className="w-4 h-4" />
                <span>Schedule & Cron Settings</span>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Interval Presets</label>
                <select
                  value={formData.schedule || 'Every 15 minutes'}
                  onChange={(e) => handleChange('schedule', e.target.value)}
                  className="w-full bg-forge-950 border border-forge-700/60 rounded-lg px-3 py-1.5 text-slate-200"
                >
                  <option value="Every 1 minute">Every 1 minute</option>
                  <option value="Every 5 minutes">Every 5 minutes</option>
                  <option value="Every 15 minutes">Every 15 minutes</option>
                  <option value="Every hour">Every hour</option>
                  <option value="Every day at midnight">Every day at midnight</option>
                </select>
              </div>
            </div>
          )}

          {/* 3. AI Agent */}
          {node.type === 'aiAgent' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-1.5 text-violet-400 font-semibold">
                <Bot className="w-4 h-4" />
                <span>AI Agent Configuration</span>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Agent Role</label>
                <input
                  type="text"
                  value={formData.role || 'Autonomous Assistant'}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className="w-full bg-forge-950 border border-forge-700/60 rounded-lg px-3 py-1.5 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">System Prompt</label>
                <textarea
                  rows={3}
                  value={formData.systemPrompt || 'You are an intelligent workflow automation agent.'}
                  onChange={(e) => handleChange('systemPrompt', e.target.value)}
                  className="w-full bg-forge-950 border border-forge-700/60 rounded-lg p-2 font-mono text-[11px] text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Model Provider</label>
                <select
                  value={formData.model || 'gpt-4o-mini'}
                  onChange={(e) => handleChange('model', e.target.value)}
                  className="w-full bg-forge-950 border border-forge-700/60 rounded-lg px-3 py-1.5 text-slate-200"
                >
                  <option value="gpt-4o-mini">OpenAI GPT-4o Mini</option>
                  <option value="gemini-1.5-flash">Google Gemini 1.5 Flash</option>
                  <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                  <option value="local-ollama">Local Ollama / Llama 3</option>
                </select>
              </div>
            </div>
          )}

          {/* 4. LLM Chat */}
          {node.type === 'llmChat' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-1.5 text-fuchsia-400 font-semibold">
                <MessageSquareText className="w-4 h-4" />
                <span>LLM Chat Parameters</span>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Prompt Template</label>
                <textarea
                  rows={3}
                  value={formData.prompt || 'Summarize: {{$json.text}}'}
                  onChange={(e) => handleChange('prompt', e.target.value)}
                  className="w-full bg-forge-950 border border-forge-700/60 rounded-lg p-2 font-mono text-[11px] text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Model</label>
                <select
                  value={formData.model || 'gemini-1.5-flash'}
                  onChange={(e) => handleChange('model', e.target.value)}
                  className="w-full bg-forge-950 border border-forge-700/60 rounded-lg px-3 py-1.5 text-slate-200"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="gpt-4o">OpenAI GPT-4o</option>
                  <option value="claude-3-haiku">Claude 3 Haiku</option>
                </select>
              </div>
            </div>
          )}

          {/* 5. Switch Router */}
          {node.type === 'switchNode' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-1.5 text-yellow-400 font-semibold">
                <Shuffle className="w-4 h-4" />
                <span>Switch Routing Rules</span>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Evaluation Expression</label>
                <input
                  type="text"
                  value={formData.field || '{{$json.type}}'}
                  onChange={(e) => handleChange('field', e.target.value)}
                  className="w-full bg-forge-950 border border-forge-700/60 rounded-lg px-3 py-1.5 font-mono text-slate-200"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Branch Rules</span>
                <button
                  onClick={handleAddSwitchRule}
                  className="text-indigo-400 hover:text-white flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Rule</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {(formData.rules || []).map((rule: any, idx: number) => (
                  <div key={idx} className="flex items-center space-x-1.5">
                    <span className="font-mono text-[10px] text-slate-500 w-16">Output #{idx}:</span>
                    <input
                      type="text"
                      placeholder="e.g. billing"
                      value={rule.value}
                      onChange={(e) => handleUpdateSwitchRule(idx, e.target.value)}
                      className="flex-1 bg-forge-950 border border-forge-700/60 rounded px-2 py-1 font-mono text-[11px] text-slate-200"
                    />
                    <button
                      onClick={() => handleRemoveSwitchRule(idx)}
                      className="p-1 hover:text-rose-400 text-slate-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Filter Records */}
          {node.type === 'filterNode' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-1.5 text-blue-400 font-semibold">
                <Filter className="w-4 h-4" />
                <span>Filter Gate Settings</span>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Field to Inspect</label>
                <input
                  type="text"
                  value={formData.field || '{{$json.active}}'}
                  onChange={(e) => handleChange('field', e.target.value)}
                  className="w-full bg-forge-950 border border-forge-700/60 rounded-lg px-3 py-1.5 font-mono text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Operator</label>
                <select
                  value={formData.operator || 'equals'}
                  onChange={(e) => handleChange('operator', e.target.value)}
                  className="w-full bg-forge-950 border border-forge-700/60 rounded-lg px-3 py-1.5 text-slate-200"
                >
                  <option value="equals">Equals</option>
                  <option value="not_equals">Not Equals</option>
                  <option value="contains">Contains</option>
                  <option value="is_not_empty">Is Not Empty</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Target Value</label>
                <input
                  type="text"
                  value={formData.value || 'true'}
                  onChange={(e) => handleChange('value', e.target.value)}
                  className="w-full bg-forge-950 border border-forge-700/60 rounded-lg px-3 py-1.5 font-mono text-slate-200"
                />
              </div>
            </div>
          )}

          {/* 7. Crypto Node */}
          {node.type === 'cryptoNode' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-1.5 text-yellow-400 font-semibold">
                <Key className="w-4 h-4" />
                <span>Crypto & Hash Settings</span>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Algorithm</label>
                <select
                  value={formData.action || 'sha256'}
                  onChange={(e) => handleChange('action', e.target.value)}
                  className="w-full bg-forge-950 border border-forge-700/60 rounded-lg px-3 py-1.5 text-slate-200"
                >
                  <option value="sha256">SHA-256 Hash</option>
                  <option value="md5">MD5 Hash</option>
                  <option value="base64_encode">Base64 Encode</option>
                  <option value="base64_decode">Base64 Decode</option>
                  <option value="hmac">HMAC (SHA-256)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Target Value / Token</label>
                <input
                  type="text"
                  value={formData.field || '{{$json.id}}'}
                  onChange={(e) => handleChange('field', e.target.value)}
                  className="w-full bg-forge-950 border border-forge-700/60 rounded-lg px-3 py-1.5 font-mono text-slate-200"
                />
              </div>
            </div>
          )}

          {/* 8. HTTP Request Node */}
          {node.type === 'httpRequest' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-1.5 text-forge-cyan font-semibold">
                <Globe className="w-4 h-4" />
                <span>HTTP Request Settings</span>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Method</label>
                <select
                  value={formData.method || 'GET'}
                  onChange={(e) => handleChange('method', e.target.value)}
                  className="w-full bg-forge-950 border border-forge-700/60 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-forge-accent"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Target URL <span className="text-slate-500 font-mono">(Supports {`{{$json.key}}`})</span>
                </label>
                <input
                  type="text"
                  value={formData.url || ''}
                  placeholder="https://api.example.com/items"
                  onChange={(e) => handleChange('url', e.target.value)}
                  className="w-full bg-forge-950 border border-forge-700/60 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-forge-accent"
                />
                <div className="mt-1 text-[10px] text-slate-400 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-forge-emerald" />
                  <span>SSRF guard blocks internal IP ranges automatically.</span>
                </div>
              </div>

              {/* Request Headers */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-400 font-medium">Headers</label>
                  <button
                    onClick={handleAddHeader}
                    className="text-[11px] text-forge-accent hover:text-indigo-400 flex items-center space-x-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {(formData.headers || []).map((h: any, idx: number) => (
                    <div key={idx} className="flex items-center space-x-1.5">
                      <input
                        type="text"
                        placeholder="Header"
                        value={h.key}
                        onChange={(e) => handleUpdateHeader(idx, 'key', e.target.value)}
                        className="w-1/2 bg-forge-950 border border-forge-700/60 rounded px-2 py-1 font-mono text-[11px] text-slate-200"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={h.value}
                        onChange={(e) => handleUpdateHeader(idx, 'value', e.target.value)}
                        className="w-1/2 bg-forge-950 border border-forge-700/60 rounded px-2 py-1 font-mono text-[11px] text-slate-200"
                      />
                      <button
                        onClick={() => handleRemoveHeader(idx)}
                        className="p-1 hover:text-rose-400 text-slate-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body for POST/PUT */}
              {['POST', 'PUT', 'PATCH'].includes(formData.method || 'GET') && (
                <div>
                  <label className="block text-slate-400 font-medium mb-1">JSON Body</label>
                  <textarea
                    rows={4}
                    value={typeof formData.body === 'string' ? formData.body : JSON.stringify(formData.body, null, 2) || ''}
                    onChange={(e) => handleChange('body', e.target.value)}
                    placeholder='{"key": "value"}'
                    className="w-full bg-forge-950 border border-forge-700/60 rounded-lg p-2 font-mono text-[11px] text-slate-200 focus:outline-none focus:border-forge-accent"
                  />
                </div>
              )}
            </div>
          )}

          {/* 9. Set Data Node */}
          {node.type === 'setData' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-1.5 text-purple-400 font-semibold">
                <Edit3 className="w-4 h-4" />
                <span>Set & Transform Fields</span>
              </div>

              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400 font-medium">Fields to Assign</span>
                <button
                  onClick={handleAddSetValue}
                  className="text-[11px] text-forge-accent hover:text-indigo-400 flex items-center space-x-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Field</span>
                </button>
              </div>

              <div className="space-y-2">
                {(formData.values || []).map((val: any, idx: number) => (
                  <div key={idx} className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      placeholder="key"
                      value={val.key}
                      onChange={(e) => handleUpdateSetValue(idx, 'key', e.target.value)}
                      className="w-1/3 bg-forge-950 border border-forge-700/60 rounded px-2 py-1 font-mono text-[11px] text-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="value or {{$json.id}}"
                      value={val.value}
                      onChange={(e) => handleUpdateSetValue(idx, 'value', e.target.value)}
                      className="w-2/3 bg-forge-950 border border-forge-700/60 rounded px-2 py-1 font-mono text-[11px] text-slate-200"
                    />
                    <button
                      onClick={() => handleRemoveSetValue(idx)}
                      className="p-1 hover:text-rose-400 text-slate-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. IF Condition */}
          {node.type === 'ifCondition' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                <GitBranch className="w-4 h-4" />
                <span>Conditional Branching</span>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Value / Expression</label>
                <input
                  type="text"
                  value={formData.field || ''}
                  placeholder="{{$json.status}}"
                  onChange={(e) => handleChange('field', e.target.value)}
                  className="w-full bg-forge-950 border border-forge-700/60 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-forge-accent"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Condition Operator</label>
                <select
                  value={formData.operator || 'equals'}
                  onChange={(e) => handleChange('operator', e.target.value)}
                  className="w-full bg-forge-950 border border-forge-700/60 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-forge-accent"
                >
                  <option value="equals">Equal to (==)</option>
                  <option value="not_equals">Not equal to (!=)</option>
                  <option value="contains">Contains substring</option>
                  <option value="greater_than">Greater than (&gt;)</option>
                  <option value="less_than">Less than (&lt;)</option>
                  <option value="is_empty">Is Empty / Null</option>
                  <option value="is_not_empty">Is Not Empty</option>
                </select>
              </div>

              {!['is_empty', 'is_not_empty'].includes(formData.operator || '') && (
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Compare Against</label>
                  <input
                    type="text"
                    value={formData.value || ''}
                    placeholder="e.g. 200 or active"
                    onChange={(e) => handleChange('value', e.target.value)}
                    className="w-full bg-forge-950 border border-forge-700/60 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-forge-accent"
                  />
                </div>
              )}
            </div>
          )}

          {/* 11. Delay */}
          {node.type === 'delay' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-1.5 text-teal-400 font-semibold">
                <Clock className="w-4 h-4" />
                <span>Delay Settings</span>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Wait Duration (Milliseconds)</label>
                <input
                  type="number"
                  min="100"
                  max="10000"
                  step="100"
                  value={formData.delayMs || 500}
                  onChange={(e) => handleChange('delayMs', Number(e.target.value))}
                  className="w-full bg-forge-950 border border-forge-700/60 rounded-lg px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-forge-accent"
                />
              </div>
            </div>
          )}
        </div>

        {/* n8n Parity: Test Step Section */}
        <div className="border-t border-forge-700/60 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Test Step (Isolated Run)</span>
            <button
              onClick={async () => {
                setTestingStep(true);
                try {
                  const res = await api.testNode({ ...node, data: formData });
                  setTestResult(res);
                } catch (err: any) {
                  setTestResult({ status: 'error', error_message: err.message });
                } finally {
                  setTestingStep(false);
                }
              }}
              disabled={testingStep}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-forge-accent/20 hover:bg-forge-accent text-indigo-300 hover:text-white text-xs font-semibold border border-forge-accent/30 transition-all cursor-pointer"
            >
              <Play className={`w-3 h-3 ${testingStep ? 'animate-spin' : 'fill-current'}`} />
              <span>{testingStep ? 'Testing...' : 'Test Step'}</span>
            </button>
          </div>

          {testResult && (
            <div className="p-3 rounded-xl bg-forge-950 border border-forge-700/60 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-1.5 font-bold">
                  {testResult.status === 'success' ? (
                    <span className="flex items-center space-x-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Success ({testResult.duration_ms}ms)</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-rose-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Failed</span>
                    </span>
                  )}
                </div>
              </div>

              {testResult.error_message ? (
                <div className="text-[10px] text-rose-400 font-mono bg-rose-500/10 p-2 rounded">
                  {testResult.error_message}
                </div>
              ) : (
                <pre className="font-mono text-[10px] text-slate-300 bg-forge-900 p-2 rounded max-h-36 overflow-auto border border-forge-800">
                  {JSON.stringify(testResult.output?.json || testResult.output, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
