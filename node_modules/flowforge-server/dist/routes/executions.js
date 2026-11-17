import { Router } from 'express';
import { db } from '../db/database.js';
import { WorkflowExecutionEngine } from '../engine/runner.js';
export const executionsRouter = Router();
// GET all executions
executionsRouter.get('/', (req, res) => {
    try {
        const limit = Math.min(Number(req.query.limit) || 50, 100);
        const stmt = db.prepare(`
      SELECT e.*, w.name as workflow_name
      FROM executions e
      LEFT JOIN workflows w ON e.workflow_id = w.id
      ORDER BY e.started_at DESC
      LIMIT ?
    `);
        const rows = stmt.all(limit);
        res.json({ success: true, data: rows });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// GET execution details by ID (including step history)
executionsRouter.get('/:id', (req, res) => {
    try {
        const execStmt = db.prepare(`
      SELECT e.*, w.name as workflow_name
      FROM executions e
      LEFT JOIN workflows w ON e.workflow_id = w.id
      WHERE e.id = ?
    `);
        const exec = execStmt.get(req.params.id);
        if (!exec) {
            return res.status(404).json({ success: false, error: 'Execution not found' });
        }
        const stepsStmt = db.prepare(`
      SELECT * FROM execution_steps
      WHERE execution_id = ?
      ORDER BY started_at ASC
    `);
        const steps = stepsStmt.all(req.params.id).map((s) => ({
            ...s,
            input_data: s.input_data ? JSON.parse(s.input_data) : null,
            output_data: s.output_data ? JSON.parse(s.output_data) : null,
        }));
        res.json({
            success: true,
            data: {
                ...exec,
                steps,
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// TRIGGER execution for a workflow
executionsRouter.post('/trigger/:workflowId', async (req, res) => {
    try {
        const { workflowId } = req.params;
        const { nodes: overrideNodes, edges: overrideEdges } = req.body;
        let nodes = overrideNodes;
        let edges = overrideEdges;
        if (!nodes || !edges) {
            const stmt = db.prepare('SELECT * FROM workflows WHERE id = ?');
            const wf = stmt.get(workflowId);
            if (!wf) {
                return res.status(404).json({ success: false, error: 'Workflow not found' });
            }
            nodes = JSON.parse(wf.nodes || '[]');
            edges = JSON.parse(wf.edges || '[]');
        }
        const engine = new WorkflowExecutionEngine(workflowId, nodes, edges);
        const result = await engine.run();
        // Fetch full execution details including steps
        const stepsStmt = db.prepare('SELECT * FROM execution_steps WHERE execution_id = ? ORDER BY started_at ASC');
        const steps = stepsStmt.all(result.id).map((s) => ({
            ...s,
            input_data: s.input_data ? JSON.parse(s.input_data) : null,
            output_data: s.output_data ? JSON.parse(s.output_data) : null,
        }));
        res.json({
            success: true,
            data: {
                ...result,
                steps,
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// TEST SINGLE NODE ISOLATED (n8n "Test step" feature)
executionsRouter.post('/test-node', async (req, res) => {
    try {
        const { node, inputData = { test: true, timestamp: new Date().toISOString() } } = req.body;
        if (!node || !node.type) {
            return res.status(400).json({ success: false, error: 'Node definition is required.' });
        }
        // Execute node in single-node sandbox pipeline
        const singleNodeWorkflow = [node];
        const engine = new WorkflowExecutionEngine('test-node-wf', singleNodeWorkflow, [], inputData);
        const result = await engine.run();
        const stepsStmt = db.prepare('SELECT * FROM execution_steps WHERE execution_id = ?');
        const step = stepsStmt.get(result.id);
        res.json({
            success: result.status === 'success',
            data: {
                status: result.status,
                duration_ms: result.duration_ms,
                error_message: result.error_message,
                output: step?.output_data ? JSON.parse(step.output_data) : null,
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
