import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, 'flowforge.db');
export const db = new DatabaseSync(dbPath);
export function initDatabase() {
    // Workflows table
    db.exec(`
    CREATE TABLE IF NOT EXISTS workflows (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      trigger_type TEXT DEFAULT 'manual',
      nodes TEXT NOT NULL,
      edges TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
    // Executions table
    db.exec(`
    CREATE TABLE IF NOT EXISTS executions (
      id TEXT PRIMARY KEY,
      workflow_id TEXT NOT NULL,
      status TEXT NOT NULL,
      duration_ms INTEGER DEFAULT 0,
      error_message TEXT,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
    );
  `);
    // Execution steps table
    db.exec(`
    CREATE TABLE IF NOT EXISTS execution_steps (
      id TEXT PRIMARY KEY,
      execution_id TEXT NOT NULL,
      node_id TEXT NOT NULL,
      node_name TEXT NOT NULL,
      node_type TEXT NOT NULL,
      status TEXT NOT NULL,
      input_data TEXT,
      output_data TEXT,
      error_message TEXT,
      duration_ms INTEGER DEFAULT 0,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      FOREIGN KEY (execution_id) REFERENCES executions(id) ON DELETE CASCADE
    );
  `);
    // Credentials table
    db.exec(`
    CREATE TABLE IF NOT EXISTS credentials (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      encrypted_data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
    seedDefaultWorkflows();
}
function seedDefaultWorkflows() {
    const now = new Date().toISOString();
    const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO workflows (id, name, description, trigger_type, nodes, edges, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    // Ephemeral workflow container for single-step test executions
    insertStmt.run('test-node-wf', 'Single Node Test Sandbox', 'Internal execution sandbox for testing isolated nodes', 'manual', '[]', '[]', 'active', now, now);
    // Default Template 1: API Enrichment Pipeline
    const sampleNodes1 = [
        {
            id: 'node-trigger-1',
            type: 'manualTrigger',
            position: { x: 100, y: 150 },
            data: { label: 'Manual Trigger', description: 'Click Execute to trigger workflow' }
        },
        {
            id: 'node-set-1',
            type: 'setData',
            position: { x: 380, y: 150 },
            data: {
                label: 'Set Parameters',
                description: 'Configure payload fields',
                values: [
                    { key: 'userId', value: '42' },
                    { key: 'category', value: 'premium' },
                    { key: 'active', value: 'true' }
                ]
            }
        },
        {
            id: 'node-http-1',
            type: 'httpRequest',
            position: { x: 680, y: 150 },
            data: {
                label: 'Fetch Public Post',
                description: 'Query public JSON placeholder',
                method: 'GET',
                url: 'https://jsonplaceholder.typicode.com/posts/1',
                headers: [{ key: 'Accept', value: 'application/json' }]
            }
        },
        {
            id: 'node-if-1',
            type: 'ifCondition',
            position: { x: 980, y: 150 },
            data: {
                label: 'Check Status',
                description: 'Evaluate HTTP response',
                field: '{{$json.id}}',
                operator: 'equals',
                value: '1'
            }
        }
    ];
    const sampleEdges1 = [
        { id: 'edge-1-2', source: 'node-trigger-1', target: 'node-set-1', animated: true },
        { id: 'edge-2-3', source: 'node-set-1', target: 'node-http-1', animated: true },
        { id: 'edge-3-4', source: 'node-http-1', target: 'node-if-1', animated: true }
    ];
    insertStmt.run('wf-demo-enrichment', 'Data Enrichment & Validation Pipeline', 'Enriches input parameters, queries public API, and checks conditional logic', 'manual', JSON.stringify(sampleNodes1), JSON.stringify(sampleEdges1), 'active', now, now);
    // Default Template 2: Health Monitor & Alert
    const sampleNodes2 = [
        {
            id: 'node-trigger-2',
            type: 'manualTrigger',
            position: { x: 100, y: 150 },
            data: { label: 'Manual Check', description: 'Instant operational probe' }
        },
        {
            id: 'node-delay-1',
            type: 'delay',
            position: { x: 380, y: 150 },
            data: { label: 'Wait 500ms', delayMs: 500 }
        },
        {
            id: 'node-set-status',
            type: 'setData',
            position: { x: 680, y: 150 },
            data: {
                label: 'Format Health Status',
                values: [
                    { key: 'status', value: 'healthy' },
                    { key: 'latency', value: '42ms' },
                    { key: 'timestamp', value: now }
                ]
            }
        }
    ];
    const sampleEdges2 = [
        { id: 'edge-2-1', source: 'node-trigger-2', target: 'node-delay-1', animated: true },
        { id: 'edge-2-2', source: 'node-delay-1', target: 'node-set-status', animated: true }
    ];
    insertStmt.run('wf-demo-health', 'Endpoint Health & Telemetry Probe', 'Monitors API latency, pauses with delay node, and formats telemetry metrics', 'manual', JSON.stringify(sampleNodes2), JSON.stringify(sampleEdges2), 'active', now, now);
    // Default Template 3: Autonomous AI Agent & Webhook Triage Pipeline
    const sampleNodes3 = [
        {
            id: 'node-webhook-1',
            type: 'webhookTrigger',
            position: { x: 80, y: 150 },
            data: {
                label: 'Customer Webhook',
                webhookId: 'support-ticket',
                method: 'POST'
            }
        },
        {
            id: 'node-classify-1',
            type: 'textClassifier',
            position: { x: 380, y: 150 },
            data: {
                label: 'Triage & Intent',
                inputField: '{{$json.body.message}}',
                categories: ['Critical Bug', 'Billing', 'Enterprise', 'General']
            }
        },
        {
            id: 'node-agent-1',
            type: 'aiAgent',
            position: { x: 700, y: 150 },
            data: {
                label: 'Support AI Agent',
                role: 'Tier 2 Support Specialist',
                model: 'gpt-4o-mini',
                systemPrompt: 'Resolve customer incident, suggest documentation, and determine urgency.',
                userPrompt: '{{$json.body.message}}'
            }
        },
        {
            id: 'node-crypto-1',
            type: 'cryptoNode',
            position: { x: 1020, y: 150 },
            data: {
                label: 'Sign Ticket Hash',
                action: 'sha256',
                field: '{{$json.timestamp}}'
            }
        }
    ];
    const sampleEdges3 = [
        { id: 'edge-3-1', source: 'node-webhook-1', target: 'node-classify-1', animated: true },
        { id: 'edge-3-2', source: 'node-classify-1', target: 'node-agent-1', animated: true },
        { id: 'edge-3-3', source: 'node-agent-1', target: 'node-crypto-1', animated: true }
    ];
    insertStmt.run('wf-demo-ai-agent', 'Autonomous AI Support & Ticket Triage', 'Listens on live HTTP webhook, classifies intent, runs autonomous AI agent reasoning, and signs verification hash', 'webhook', JSON.stringify(sampleNodes3), JSON.stringify(sampleEdges3), 'active', now, now);
}
