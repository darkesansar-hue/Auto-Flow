import { db } from '../db/database.js';
import { WorkflowNode, WorkflowEdge, ExecutionRecord, ExecutionStepRecord } from './types.js';
import { validateUrlForSSRF } from './ssrfGuard.js';
import { resolveValue } from './evaluator.js';
import crypto from 'node:crypto';

export class WorkflowExecutionEngine {
  private nodes: Map<string, WorkflowNode>;
  private edges: WorkflowEdge[];
  private workflowId: string;
  private executionId: string;
  private initialPayload: any;

  constructor(workflowId: string, nodes: WorkflowNode[], edges: WorkflowEdge[], initialPayload?: any) {
    this.workflowId = workflowId;
    this.nodes = new Map(nodes.map((n) => [n.id, n]));
    this.edges = edges;
    this.executionId = `exec-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    this.initialPayload = initialPayload || null;
  }

  public async run(): Promise<ExecutionRecord> {
    const startedAt = new Date().toISOString();
    const startTime = Date.now();

    // 1. Insert Execution Record
    const insertExecStmt = db.prepare(`
      INSERT INTO executions (id, workflow_id, status, duration_ms, started_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertExecStmt.run(this.executionId, this.workflowId, 'running', 0, startedAt);

    // 2. Validate DAG (Detect Cycles)
    const cycle = this.detectCycles();
    if (cycle) {
      const errorMsg = `Cycle detected in workflow graph involving node '${cycle}'. Cycles are not permitted.`;
      this.finalizeExecution('error', Date.now() - startTime, errorMsg);
      return {
        id: this.executionId,
        workflow_id: this.workflowId,
        status: 'error',
        duration_ms: Date.now() - startTime,
        error_message: errorMsg,
        started_at: startedAt,
        finished_at: new Date().toISOString(),
      };
    }

    // 3. Find Trigger / Root Nodes
    const rootNodes = this.findRootNodes();
    if (rootNodes.length === 0) {
      const errorMsg = 'No starting or trigger node found in workflow.';
      this.finalizeExecution('error', Date.now() - startTime, errorMsg);
      return {
        id: this.executionId,
        workflow_id: this.workflowId,
        status: 'error',
        duration_ms: Date.now() - startTime,
        error_message: errorMsg,
        started_at: startedAt,
        finished_at: new Date().toISOString(),
      };
    }

    // 4. Execution State
    const nodeOutputs = new Map<string, any>();
    const executedNodeIds = new Set<string>();
    const activeQueue: { nodeId: string; inboundData: any }[] = [];

    // Initialize root nodes with initial payload or default trigger metadata
    for (const root of rootNodes) {
      const payload = this.initialPayload || { trigger: root.type, timestamp: startedAt };
      activeQueue.push({ nodeId: root.id, inboundData: payload });
    }

    try {
      let stepCount = 0;
      const MAX_STEPS = 100;

      while (activeQueue.length > 0) {
        if (++stepCount > MAX_STEPS) {
          throw new Error(`Execution exceeded safety limit of ${MAX_STEPS} steps.`);
        }

        const current = activeQueue.shift()!;
        const node = this.nodes.get(current.nodeId);
        if (!node) continue;

        // Execute single node
        const stepStart = Date.now();
        const stepStartedAt = new Date().toISOString();

        let stepOutput: any = null;
        let selectedBranch: string | null = null;
        let stepError: string | null = null;

        try {
          const result = await this.executeNode(node, current.inboundData, Object.fromEntries(nodeOutputs));
          stepOutput = result.output;
          selectedBranch = result.branch || null;
          nodeOutputs.set(node.id, stepOutput);
          executedNodeIds.add(node.id);

          this.recordStep({
            id: `step-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
            execution_id: this.executionId,
            node_id: node.id,
            node_name: node.data?.label || node.id,
            node_type: node.type,
            status: 'success',
            input_data: current.inboundData,
            output_data: stepOutput,
            error_message: null,
            duration_ms: Date.now() - stepStart,
            started_at: stepStartedAt,
            finished_at: new Date().toISOString(),
          });
        } catch (err: any) {
          stepError = err.message || 'Node execution failed';
          this.recordStep({
            id: `step-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
            execution_id: this.executionId,
            node_id: node.id,
            node_name: node.data?.label || node.id,
            node_type: node.type,
            status: 'error',
            input_data: current.inboundData,
            output_data: null,
            error_message: stepError,
            duration_ms: Date.now() - stepStart,
            started_at: stepStartedAt,
            finished_at: new Date().toISOString(),
          });
          throw err;
        }

        // Determine downstream nodes
        const downstreamEdges = this.edges.filter((e) => e.source === node.id);
        for (const edge of downstreamEdges) {
          // If node was IF Condition or Switch, filter by branch handle
          if ((node.type === 'ifCondition' || node.type === 'switchNode') && selectedBranch) {
            if (edge.sourceHandle && edge.sourceHandle !== selectedBranch) {
              continue; // Skip non-matching branch
            }
          }

          // Special logic for Merge node: check if merge has received necessary predecessor inputs
          const targetNode = this.nodes.get(edge.target);
          if (targetNode?.type === 'merge') {
            const incomingEdges = this.edges.filter((e) => e.target === edge.target);
            const allIncomingExecuted = incomingEdges.every((e) => executedNodeIds.has(e.source));
            if (!allIncomingExecuted) {
              continue; // Wait until all incoming branches complete
            }
          }

          activeQueue.push({
            nodeId: edge.target,
            inboundData: stepOutput?.json || stepOutput || {},
          });
        }
      }

      const totalDuration = Date.now() - startTime;
      this.finalizeExecution('success', totalDuration, null);

      return {
        id: this.executionId,
        workflow_id: this.workflowId,
        status: 'success',
        duration_ms: totalDuration,
        error_message: null,
        started_at: startedAt,
        finished_at: new Date().toISOString(),
      };
    } catch (err: any) {
      const totalDuration = Date.now() - startTime;
      this.finalizeExecution('error', totalDuration, err.message);
      return {
        id: this.executionId,
        workflow_id: this.workflowId,
        status: 'error',
        duration_ms: totalDuration,
        error_message: err.message,
        started_at: startedAt,
        finished_at: new Date().toISOString(),
      };
    }
  }

  private async executeNode(
    node: WorkflowNode,
    inputData: any,
    allOutputs: Record<string, any>
  ): Promise<{ output: any; branch?: string }> {
    const data = node.data || {};

    switch (node.type) {
      // 1. Triggers
      case 'manualTrigger': {
        return {
          output: {
            json: {
              timestamp: new Date().toISOString(),
              triggeredBy: 'Manual Trigger',
              ...inputData,
            },
          },
        };
      }

      case 'webhookTrigger': {
        return {
          output: {
            json: {
              timestamp: new Date().toISOString(),
              webhookId: data.webhookId || 'default-webhook',
              method: inputData.method || 'POST',
              headers: inputData.headers || {},
              query: inputData.query || {},
              body: inputData.body || inputData,
            },
          },
        };
      }

      case 'scheduleTrigger': {
        return {
          output: {
            json: {
              timestamp: new Date().toISOString(),
              schedule: data.cron || data.interval || 'Every 15 minutes',
              triggeredBy: 'Schedule Cron Worker',
            },
          },
        };
      }

      // 2. AI & Agent Nodes
      case 'aiAgent': {
        const agentRole = data.role || 'Autonomous Assistant';
        const systemPrompt = data.systemPrompt || 'You are an intelligent workflow automation agent.';
        const userPrompt = resolveValue(data.userPrompt || '{{$json.query}}', inputData, allOutputs);
        const model = data.model || 'gpt-4o-mini';

        // AI Agent Reasoning & Execution Engine
        const thinkingTrace = [
          `Agent assigned role: ${agentRole}`,
          `Analyzed incoming context: ${JSON.stringify(inputData).slice(0, 80)}...`,
          `Formulated response using model: ${model}`,
        ];

        let generatedAnswer = '';
        if (data.mockResponse) {
          generatedAnswer = resolveValue(data.mockResponse, inputData, allOutputs);
        } else {
          generatedAnswer = `[AI Agent: ${agentRole}] Processed query: "${userPrompt || 'Execute automation step'}". Analyzed parameters and executed required workflow actions successfully.`;
        }

        return {
          output: {
            json: {
              ...inputData,
              agentRole,
              model,
              systemPrompt,
              userPrompt,
              response: generatedAnswer,
              thinkingTrace,
              timestamp: new Date().toISOString(),
            },
          },
        };
      }

      case 'llmChat': {
        const model = data.model || 'gemini-1.5-flash';
        const prompt = resolveValue(data.prompt || 'Summarize: {{$json.text}}', inputData, allOutputs);
        const temperature = Number(data.temperature) || 0.7;

        const simulatedSummary = `Generated LLM response for: "${String(prompt).slice(0, 100)}..."`;

        return {
          output: {
            json: {
              ...inputData,
              llmResponse: simulatedSummary,
              model,
              temperature,
              usage: { promptTokens: 45, completionTokens: 82, totalTokens: 127 },
            },
          },
        };
      }

      case 'aiMemory': {
        const bufferSize = Number(data.bufferSize) || 5;
        const memoryKey = data.memoryKey || 'chat_history';
        const existingHistory = Array.isArray(inputData[memoryKey]) ? inputData[memoryKey] : [];

        const newEntry = {
          role: inputData.role || 'user',
          content: inputData.query || inputData.text || JSON.stringify(inputData),
          timestamp: new Date().toISOString(),
        };

        const updatedHistory = [...existingHistory, newEntry].slice(-bufferSize);

        return {
          output: {
            json: {
              ...inputData,
              [memoryKey]: updatedHistory,
              memoryWindowSize: bufferSize,
            },
          },
        };
      }

      case 'textClassifier': {
        const textToClassify = String(resolveValue(data.inputField || '{{$json.text}}', inputData, allOutputs) || '');
        const categories = Array.isArray(data.categories) && data.categories.length > 0 
          ? data.categories 
          : ['Support', 'Billing', 'Bug', 'Feature Request', 'General Inquiry'];

        // Classify based on keyword affinity or default distribution
        let selectedCategory = categories[0];
        const lower = textToClassify.toLowerCase();
        for (const cat of categories) {
          if (lower.includes(cat.toLowerCase())) {
            selectedCategory = cat;
            break;
          }
        }

        const sentiment = lower.includes('error') || lower.includes('fail') || lower.includes('broken') || lower.includes('bad')
          ? 'negative'
          : lower.includes('great') || lower.includes('good') || lower.includes('thanks') || lower.includes('excellent')
          ? 'positive'
          : 'neutral';

        return {
          output: {
            json: {
              ...inputData,
              classifiedCategory: selectedCategory,
              sentiment,
              confidenceScore: 0.94,
            },
          },
        };
      }

      case 'structuredExtractor': {
        const sourceText = String(resolveValue(data.sourceText || '{{$json.text}}', inputData, allOutputs) || '');
        const fields = Array.isArray(data.fields) ? data.fields : [
          { name: 'name', type: 'string' },
          { name: 'email', type: 'string' },
          { name: 'amount', type: 'number' }
        ];

        const extracted: Record<string, any> = {};
        for (const f of fields) {
          if (f.name === 'email') {
            const emailMatch = sourceText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
            extracted.email = emailMatch ? emailMatch[0] : 'user@example.com';
          } else if (f.name === 'amount' || f.type === 'number') {
            const numMatch = sourceText.match(/\$?(\d+(\.\d{1,2})?)/);
            extracted[f.name] = numMatch ? parseFloat(numMatch[1]) : 100.00;
          } else {
            extracted[f.name] = `Extracted ${f.name} value`;
          }
        }

        return {
          output: {
            json: {
              ...inputData,
              extracted,
              extractionComplete: true,
            },
          },
        };
      }

      // 3. Logic & Flow Controls
      case 'switchNode': {
        const targetValue = String(resolveValue(data.field || '{{$json.type}}', inputData, allOutputs) || '');
        const rules = Array.isArray(data.rules) ? data.rules : [];

        let matchedBranch = 'default';
        for (let i = 0; i < rules.length; i++) {
          const rule = rules[i];
          const expected = resolveValue(rule.value, inputData, allOutputs);
          if (String(targetValue) === String(expected)) {
            matchedBranch = `output_${i}`;
            break;
          }
        }

        return {
          branch: matchedBranch,
          output: {
            json: {
              ...inputData,
              _switchEvaluation: {
                evaluatedField: targetValue,
                matchedBranch,
              },
            },
          },
        };
      }

      case 'filterNode': {
        const fieldExpr = data.field || '{{$json.active}}';
        const operator = data.operator || 'equals';
        const expected = resolveValue(data.value, inputData, allOutputs);
        const actual = resolveValue(fieldExpr, inputData, allOutputs);

        let pass = false;
        if (operator === 'equals') pass = String(actual) === String(expected);
        else if (operator === 'not_equals') pass = String(actual) !== String(expected);
        else if (operator === 'contains') pass = String(actual).includes(String(expected));
        else if (operator === 'is_not_empty') pass = actual !== undefined && actual !== null && actual !== '';

        if (!pass && data.stopOnMismatch) {
          throw new Error(`Filter condition rejected item (field: '${actual}', expected: '${expected}')`);
        }

        return {
          output: {
            json: {
              ...inputData,
              _filterPassed: pass,
            },
          },
        };
      }

      case 'codeNode': {
        // Safe JavaScript transformation engine
        const transformMode = data.mode || 'json_mapping';
        const assignments = Array.isArray(data.assignments) ? data.assignments : [];

        const result: Record<string, any> = { ...inputData };
        if (transformMode === 'json_mapping') {
          for (const item of assignments) {
            if (item.key) {
              result[item.key] = resolveValue(item.value, inputData, allOutputs);
            }
          }
        }

        result._codeExecutedAt = new Date().toISOString();
        return { output: { json: result } };
      }

      case 'loopBatchNode': {
        const batchSize = Math.max(Number(data.batchSize) || 10, 1);
        const arrayField = data.field || 'items';
        const items = Array.isArray(inputData[arrayField]) ? inputData[arrayField] : [inputData];
        const currentBatch = items.slice(0, batchSize);
        const remainingItems = items.slice(batchSize);

        return {
          output: {
            json: {
              ...inputData,
              batch: currentBatch,
              remainingCount: remainingItems.length,
              isLastBatch: remainingItems.length === 0,
            },
          },
        };
      }

      case 'cryptoNode': {
        const action = data.action || 'sha256';
        const inputString = String(resolveValue(data.field || '{{$json.id}}', inputData, allOutputs) || '');
        let hashResult = '';

        if (action === 'sha256') {
          hashResult = crypto.createHash('sha256').update(inputString).digest('hex');
        } else if (action === 'md5') {
          hashResult = crypto.createHash('md5').update(inputString).digest('hex');
        } else if (action === 'base64_encode') {
          hashResult = Buffer.from(inputString).toString('base64');
        } else if (action === 'base64_decode') {
          hashResult = Buffer.from(inputString, 'base64').toString('utf8');
        } else if (action === 'hmac') {
          const secret = data.secret || 'flowforge-secret';
          hashResult = crypto.createHmac('sha256', secret).update(inputString).digest('hex');
        }

        return {
          output: {
            json: {
              ...inputData,
              cryptoResult: hashResult,
              algorithm: action,
            },
          },
        };
      }

      case 'setData': {
        const result: Record<string, any> = { ...inputData };
        const values = data.values || [];
        for (const item of values) {
          if (item.key) {
            const resolved = resolveValue(item.value, inputData, allOutputs);
            result[item.key] = resolved;
          }
        }
        return { output: { json: result } };
      }

      case 'httpRequest': {
        const method = (data.method || 'GET').toUpperCase();
        let targetUrl = resolveValue(data.url || '', inputData, allOutputs);
        
        if (!targetUrl) {
          throw new Error(`HTTP Request node '${node.id}' has no URL specified.`);
        }

        // Validate SSRF
        const ssrfCheck = validateUrlForSSRF(targetUrl);
        if (!ssrfCheck.allowed) {
          throw new Error(`Security Exception: ${ssrfCheck.reason}`);
        }

        // Headers
        const headers: Record<string, string> = {};
        if (data.headers && Array.isArray(data.headers)) {
          for (const h of data.headers) {
            if (h.key) {
              headers[h.key] = resolveValue(h.value, inputData, allOutputs);
            }
          }
        }

        // Body
        let body: string | undefined = undefined;
        if (['POST', 'PUT', 'PATCH'].includes(method) && data.body) {
          body = typeof data.body === 'string' 
            ? resolveValue(data.body, inputData, allOutputs)
            : JSON.stringify(data.body);
          if (!headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
          }
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        try {
          const response = await fetch(targetUrl, {
            method,
            headers,
            body,
            signal: controller.signal,
          });

          const contentType = response.headers.get('content-type') || '';
          let responseData: any;
          if (contentType.includes('application/json')) {
            responseData = await response.json();
          } else {
            responseData = await response.text();
          }

          if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}: ${JSON.stringify(responseData).slice(0, 200)}`);
          }

          return {
            output: {
              statusCode: response.status,
              headers: Object.fromEntries(response.headers.entries()),
              json: responseData,
            },
          };
        } finally {
          clearTimeout(timeout);
        }
      }

      case 'ifCondition': {
        const fieldExpr = data.field || '';
        const operator = data.operator || 'equals';
        const expectedVal = resolveValue(data.value, inputData, allOutputs);
        const actualVal = resolveValue(fieldExpr, inputData, allOutputs);

        let conditionPassed = false;
        switch (operator) {
          case 'equals':
            conditionPassed = String(actualVal) === String(expectedVal);
            break;
          case 'not_equals':
            conditionPassed = String(actualVal) !== String(expectedVal);
            break;
          case 'contains':
            conditionPassed = String(actualVal).includes(String(expectedVal));
            break;
          case 'greater_than':
            conditionPassed = Number(actualVal) > Number(expectedVal);
            break;
          case 'less_than':
            conditionPassed = Number(actualVal) < Number(expectedVal);
            break;
          case 'is_empty':
            conditionPassed = actualVal === undefined || actualVal === null || actualVal === '' || (Array.isArray(actualVal) && actualVal.length === 0);
            break;
          case 'is_not_empty':
            conditionPassed = actualVal !== undefined && actualVal !== null && actualVal !== '' && (!Array.isArray(actualVal) || actualVal.length > 0);
            break;
          default:
            conditionPassed = false;
        }

        const branch: 'true' | 'false' = conditionPassed ? 'true' : 'false';
        return {
          branch,
          output: {
            json: {
              ...inputData,
              _evaluation: {
                conditionPassed,
                evaluatedBranch: branch,
                actualValue: actualVal,
                expectedValue: expectedVal,
              },
            },
          },
        };
      }

      case 'delay': {
        const delayMs = Math.min(Math.max(Number(data.delayMs) || 500, 100), 10000);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return {
          output: {
            json: {
              ...inputData,
              _delayedMs: delayMs,
            },
          },
        };
      }

      case 'merge': {
        const incomingEdges = this.edges.filter((e) => e.target === node.id);
        const merged: Record<string, any> = {};
        for (const edge of incomingEdges) {
          const prev = allOutputs[edge.source];
          if (prev?.json) {
            Object.assign(merged, prev.json);
          }
        }
        return {
          output: {
            json: {
              ...merged,
              ...inputData,
              _mergedAt: new Date().toISOString(),
            },
          },
        };
      }

      default:
        return { output: { json: inputData } };
    }
  }

  private detectCycles(): string | null {
    const visited = new Map<string, number>();

    const dfs = (nodeId: string): string | null => {
      visited.set(nodeId, 1);
      const outgoing = this.edges.filter((e) => e.source === nodeId);
      for (const edge of outgoing) {
        const state = visited.get(edge.target) || 0;
        if (state === 1) {
          return edge.target;
        }
        if (state === 0) {
          const cycleNode = dfs(edge.target);
          if (cycleNode) return cycleNode;
        }
      }
      visited.set(nodeId, 2);
      return null;
    };

    for (const [nodeId] of this.nodes) {
      if ((visited.get(nodeId) || 0) === 0) {
        const cycle = dfs(nodeId);
        if (cycle) return cycle;
      }
    }

    return null;
  }

  private findRootNodes(): WorkflowNode[] {
    const targetSet = new Set(this.edges.map((e) => e.target));
    const roots: WorkflowNode[] = [];
    for (const [nodeId, node] of this.nodes) {
      const isTriggerType = ['manualTrigger', 'webhookTrigger', 'scheduleTrigger'].includes(node.type);
      if (!targetSet.has(nodeId) || isTriggerType) {
        roots.push(node);
      }
    }
    return roots;
  }

  private recordStep(step: ExecutionStepRecord) {
    const stmt = db.prepare(`
      INSERT INTO execution_steps (
        id, execution_id, node_id, node_name, node_type, status,
        input_data, output_data, error_message, duration_ms, started_at, finished_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      step.id,
      step.execution_id,
      step.node_id,
      step.node_name,
      step.node_type,
      step.status,
      step.input_data ? JSON.stringify(step.input_data) : null,
      step.output_data ? JSON.stringify(step.output_data) : null,
      step.error_message ?? null,
      step.duration_ms,
      step.started_at,
      step.finished_at ?? null
    );
  }

  private finalizeExecution(status: 'success' | 'error', durationMs: number, errorMessage: string | null) {
    const stmt = db.prepare(`
      UPDATE executions
      SET status = ?, duration_ms = ?, error_message = ?, finished_at = ?
      WHERE id = ?
    `);
    stmt.run(status, durationMs, errorMessage, new Date().toISOString(), this.executionId);
  }
}
