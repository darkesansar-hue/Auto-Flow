import React, { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  Play,
  Save,
  ArrowLeft,
  Terminal,
  CheckCircle2,
  XCircle,
  Clock,
  Code2,
  Layers,
  ChevronUp,
  ChevronDown,
  Download,
  Upload,
  Copy,
  Wand2
} from 'lucide-react';

// Nodes
import { ManualTriggerNode } from './nodes/ManualTriggerNode';
import { WebhookTriggerNode } from './nodes/WebhookTriggerNode';
import { ScheduleTriggerNode } from './nodes/ScheduleTriggerNode';
import { AiAgentNode } from './nodes/AiAgentNode';
import { LlmChatNode } from './nodes/LlmChatNode';
import { AiMemoryNode } from './nodes/AiMemoryNode';
import { TextClassifierNode } from './nodes/TextClassifierNode';
import { StructuredExtractorNode } from './nodes/StructuredExtractorNode';
import { HttpRequestNode } from './nodes/HttpRequestNode';
import { SetDataNode } from './nodes/SetDataNode';
import { IfConditionNode } from './nodes/IfConditionNode';
import { SwitchNode } from './nodes/SwitchNode';
import { FilterNode } from './nodes/FilterNode';
import { MergeNode } from './nodes/MergeNode';
import { DelayNode } from './nodes/DelayNode';
import { CodeNode } from './nodes/CodeNode';
import { LoopBatchNode } from './nodes/LoopBatchNode';
import { CryptoNode } from './nodes/CryptoNode';

import { NodePalette } from './NodePalette';
import { NodeConfigDrawer } from './NodeConfigDrawer';
import { Workflow, Execution } from '../../types';
import { api } from '../../api/client';

interface WorkflowEditorProps {
  workflow: Workflow;
  onBack: () => void;
  onWorkflowSaved: (wf: Workflow) => void;
}

const nodeTypes = {
  manualTrigger: ManualTriggerNode,
  webhookTrigger: WebhookTriggerNode,
  scheduleTrigger: ScheduleTriggerNode,
  aiAgent: AiAgentNode,
  llmChat: LlmChatNode,
  aiMemory: AiMemoryNode,
  textClassifier: TextClassifierNode,
  structuredExtractor: StructuredExtractorNode,
  httpRequest: HttpRequestNode,
  setData: SetDataNode,
  ifCondition: IfConditionNode,
  switchNode: SwitchNode,
  filterNode: FilterNode,
  merge: MergeNode,
  delay: DelayNode,
  codeNode: CodeNode,
  loopBatchNode: LoopBatchNode,
  cryptoNode: CryptoNode,
};

export const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  workflow,
  onBack,
  onWorkflowSaved,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(workflow.nodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow.edges as Edge[]);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [workflowName, setWorkflowName] = useState(workflow.name);

  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<Execution | null>(null);
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Connect edges
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: true }, eds));
    },
    [setEdges]
  );

  // Select node
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Update node data
  const handleUpdateNodeData = (nodeId: string, updatedData: Record<string, any>) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          return { ...n, data: updatedData };
        }
        return n;
      })
    );
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode((prev: any) => ({ ...prev, data: updatedData }));
    }
  };

  const getNewNodeData = (type: string) => {
    const data: Record<string, any> = {
      label: type.charAt(0).toUpperCase() + type.slice(1),
    };

    if (type === 'webhookTrigger') {
      data.webhookId = `webhook-${Date.now().toString(36)}`;
      data.method = 'POST';
    } else if (type === 'scheduleTrigger') {
      data.schedule = 'Every 15 minutes';
    } else if (type === 'aiAgent') {
      data.role = 'Customer Support Agent';
      data.model = 'gpt-4o-mini';
      data.systemPrompt = 'You are an autonomous AI support engineer. Resolve technical requests.';
    } else if (type === 'llmChat') {
      data.model = 'gemini-1.5-flash';
      data.prompt = 'Summarize this payload: {{$json.text}}';
    } else if (type === 'aiMemory') {
      data.bufferSize = 5;
    } else if (type === 'textClassifier') {
      data.categories = ['Urgent', 'Standard', 'Low Priority'];
    } else if (type === 'structuredExtractor') {
      data.fields = [{ name: 'email', type: 'string' }, { name: 'phone', type: 'string' }];
    } else if (type === 'switchNode') {
      data.field = '{{$json.category}}';
      data.rules = [{ label: 'VIP', value: 'vip' }, { label: 'Standard', value: 'standard' }];
    } else if (type === 'filterNode') {
      data.field = '{{$json.status}}';
      data.operator = 'equals';
      data.value = 'active';
    } else if (type === 'cryptoNode') {
      data.action = 'sha256';
      data.field = '{{$json.id}}';
    } else if (type === 'codeNode') {
      data.mode = 'json_mapping';
      data.assignments = [{ key: 'processed', value: 'true' }];
    } else if (type === 'httpRequest') {
      data.method = 'GET';
      data.url = 'https://jsonplaceholder.typicode.com/posts/1';
    } else if (type === 'setData') {
      data.values = [{ key: 'status', value: 'processed' }];
    } else if (type === 'ifCondition') {
      data.field = '{{$json.id}}';
      data.operator = 'equals';
      data.value = '1';
    } else if (type === 'delay') {
      data.delayMs = 500;
    }

    return data;
  };

  // Drag and drop from palette
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance || !reactFlowWrapper.current) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNodeId = `node-${type}-${Date.now()}`;
      const defaultData = getNewNodeData(type);

      const newNode: Node = {
        id: newNodeId,
        type,
        position,
        data: defaultData,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const handleAddNodeFromPalette = (type: string) => {
    const newNodeId = `node-${type}-${Date.now()}`;
    const defaultData = getNewNodeData(type);

    const newNode: Node = {
      id: newNodeId,
      type,
      position: { x: 320 + Math.random() * 80, y: 180 + Math.random() * 80 },
      data: defaultData,
    };

    setNodes((nds) => nds.concat(newNode));
  };

  // Save workflow
  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.updateWorkflow(workflow.id, {
        name: workflowName,
        nodes: nodes as any[],
        edges: edges as any[],
      });
      onWorkflowSaved(updated);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Auto Layout DAG (n8n "Clean up" feature)
  const handleAutoLayout = () => {
    // 1. Calculate in-degrees
    const inDegree = new Map<string, number>();
    nodes.forEach((n) => inDegree.set(n.id, 0));
    edges.forEach((e) => {
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    });

    // 2. Assign depths
    const depths = new Map<string, number>();
    const queue: string[] = [];
    nodes.forEach((n) => {
      if ((inDegree.get(n.id) || 0) === 0) {
        depths.set(n.id, 0);
        queue.push(n.id);
      }
    });

    while (queue.length > 0) {
      const current = queue.shift()!;
      const curDepth = depths.get(current) || 0;
      const outgoing = edges.filter((e) => e.source === current);
      for (const e of outgoing) {
        const targetDepth = Math.max(depths.get(e.target) || 0, curDepth + 1);
        depths.set(e.target, targetDepth);
        queue.push(e.target);
      }
    }

    // 3. Group by depth and assign positions
    const depthGroups = new Map<number, string[]>();
    nodes.forEach((n) => {
      const d = depths.get(n.id) || 0;
      const grp = depthGroups.get(d) || [];
      grp.push(n.id);
      depthGroups.set(d, grp);
    });

    setNodes((nds) =>
      nds.map((n) => {
        const d = depths.get(n.id) || 0;
        const grp = depthGroups.get(d) || [n.id];
        const indexInGrp = grp.indexOf(n.id);
        return {
          ...n,
          position: {
            x: 80 + d * 320,
            y: 100 + indexInGrp * 180,
          },
        };
      })
    );
  };

  // Export Workflow to JSON
  const handleExport = () => {
    const exportData = {
      name: workflowName,
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
      generator: 'FlowForge v1.2.0',
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflowName.toLowerCase().replace(/\s+/g, '-')}-workflow.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import Workflow from JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.nodes && parsed.edges) {
          setNodes(parsed.nodes);
          setEdges(parsed.edges);
          if (parsed.name) setWorkflowName(parsed.name);
          alert('Workflow imported successfully!');
        } else {
          alert('Invalid FlowForge workflow JSON structure.');
        }
      } catch (err: any) {
        alert(`Failed to parse JSON file: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Execute workflow
  const handleExecute = async () => {
    setExecuting(true);
    setShowLogsDrawer(true);

    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, executionStatus: undefined, evaluatedBranch: undefined },
      }))
    );

    try {
      await api.updateWorkflow(workflow.id, {
        name: workflowName,
        nodes: nodes as any[],
        edges: edges as any[],
      });

      const execResult = await api.triggerExecution(workflow.id, nodes, edges);
      setCurrentExecution(execResult);

      if (execResult.steps) {
        setNodes((nds) =>
          nds.map((n) => {
            const step = execResult.steps?.find((s) => s.node_id === n.id);
            if (step) {
              const evaluatedBranch =
                step.output_data?.json?._evaluation?.evaluatedBranch ||
                step.output_data?.json?._switchEvaluation?.matchedBranch;
              return {
                ...n,
                data: {
                  ...n.data,
                  executionStatus: step.status,
                  evaluatedBranch: evaluatedBranch,
                  executionResponse: step.output_data,
                },
              };
            }
            return n;
          })
        );
      }
    } catch (err: any) {
      alert(`Execution Error: ${err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-forge-950">
      {/* Editor Sub-Header Toolbar */}
      <div className="h-14 bg-forge-900 border-b border-forge-700/60 px-4 flex items-center justify-between select-none z-10">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-forge-800 text-slate-400 hover:text-white transition-colors"
            title="Back to Workflows"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-forge-700"></div>

          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="bg-transparent hover:bg-forge-850 focus:bg-forge-850 px-2.5 py-1 rounded-lg text-sm font-bold text-white border border-transparent focus:border-forge-accent transition-all outline-none"
            placeholder="Workflow Name"
          />

          <span className="font-mono text-[10px] text-slate-500">
            {nodes.length} nodes · {edges.length} edges
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Auto Align Layout */}
          <button
            onClick={handleAutoLayout}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-forge-850 hover:bg-forge-800 text-slate-300 text-xs border border-forge-700/60 transition-all cursor-pointer"
            title="Clean Up DAG Layout (Auto Align)"
          >
            <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Align</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExport}
            className="p-1.5 rounded-lg bg-forge-850 hover:bg-forge-800 text-slate-300 border border-forge-700/60"
            title="Export Workflow JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Import JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg bg-forge-850 hover:bg-forge-800 text-slate-300 border border-forge-700/60"
            title="Import Workflow JSON"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowLogsDrawer(!showLogsDrawer)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${showLogsDrawer
              ? 'bg-forge-cyan/20 text-cyan-300 border border-cyan-500/30'
              : 'bg-forge-850 hover:bg-forge-800 text-slate-300'
              }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Logs</span>
            {showLogsDrawer ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-forge-850 hover:bg-forge-800 text-slate-200 text-xs font-semibold border border-forge-700/60 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-slate-400" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>

          <button
            onClick={handleExecute}
            disabled={executing}
            className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-n8n-coral to-n8n-pink hover:opacity-95 text-white text-xs font-bold shadow-n8n-glow transition-all cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 ${executing ? 'animate-spin' : 'fill-white'}`} />
            <span>{executing ? 'Executing...' : 'Execute workflow'}</span>
          </button>
        </div>
      </div>

      {/* Editor Main Canvas Body */}
      <div className="flex-1 flex overflow-hidden relative">
        <NodePalette onAddNode={handleAddNodeFromPalette} />

        <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.2}
            maxZoom={2}
            defaultEdgeOptions={{ animated: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="#27272A" />
            <Controls className="!bg-forge-900 !border-forge-700/80" />
            <MiniMap
              nodeColor={() => '#6366f1'}
              maskColor="rgba(8, 12, 20, 0.75)"
              className="!bg-forge-900 !border !border-forge-700/80 !rounded-xl !overflow-hidden"
            />
          </ReactFlow>
        </div>

        {selectedNode && (
          <NodeConfigDrawer
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdateNodeData={handleUpdateNodeData}
          />
        )}
      </div>

      {/* Bottom Execution Logs Drawer */}
      {showLogsDrawer && (
        <div className="h-64 bg-forge-900 border-t border-forge-700/60 flex flex-col shadow-2xl z-20">
          <div className="px-4 py-2.5 border-b border-forge-700/60 bg-forge-850/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-forge-accent" />
              <span className="text-xs font-bold text-slate-200">Execution Output & Step Telemetry</span>
              {currentExecution && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${currentExecution.status === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                  {currentExecution.status} ({currentExecution.duration_ms}ms)
                </span>
              )}
            </div>

            <button
              onClick={() => setShowLogsDrawer(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-2 bg-forge-950/80">
            {!currentExecution ? (
              <div className="text-slate-500 italic py-6 text-center">
                Workflow has not been executed yet. Click "Execute Workflow" above to see live step logs.
              </div>
            ) : (
              <div className="space-y-2">
                {currentExecution.error_message && (
                  <div className="p-2.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300">
                    [ERROR] {currentExecution.error_message}
                  </div>
                )}

                {currentExecution.steps?.map((step, idx) => (
                  <div
                    key={step.id || idx}
                    className="p-2.5 rounded bg-forge-900 border border-forge-700/60 flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        {step.status === 'success' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-forge-emerald flex-shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-forge-rose flex-shrink-0" />
                        )}
                        <span className="font-bold text-slate-200">
                          Step #{idx + 1}: {step.node_name} ({step.node_type})
                        </span>
                        <span className="text-slate-500">[{step.duration_ms}ms]</span>
                      </div>

                      {step.output_data && (
                        <div className="mt-1 text-slate-400 text-[10px] bg-forge-950 p-2 rounded border border-forge-800 overflow-x-auto max-h-28">
                          {JSON.stringify(step.output_data.json || step.output_data, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
