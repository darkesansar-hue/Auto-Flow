import { Router } from 'express';
import { db } from '../db/database.js';
import { WorkflowExecutionEngine } from '../engine/runner.js';
export const webhooksRouter = Router();
// Handle both GET and POST requests for webhooks
webhooksRouter.all('/:webhookId', async (req, res) => {
    const { webhookId } = req.params;
    try {
        // Search active workflows for a webhook trigger with this ID
        const stmt = db.prepare("SELECT * FROM workflows WHERE status = 'active'");
        const workflows = stmt.all();
        let matchedWorkflow = null;
        let matchedNode = null;
        for (const wf of workflows) {
            const nodes = JSON.parse(wf.nodes || '[]');
            const webhookNode = nodes.find((n) => n.type === 'webhookTrigger' &&
                (n.data?.webhookId === webhookId || n.id === webhookId || webhookId === 'test'));
            if (webhookNode) {
                matchedWorkflow = wf;
                matchedNode = webhookNode;
                break;
            }
        }
        if (!matchedWorkflow) {
            return res.status(404).json({
                success: false,
                error: `No active workflow found listening for webhook ID '${webhookId}'`,
            });
        }
        const nodes = JSON.parse(matchedWorkflow.nodes || '[]');
        const edges = JSON.parse(matchedWorkflow.edges || '[]');
        const incomingPayload = {
            webhookId,
            method: req.method,
            headers: req.headers,
            query: req.query,
            body: req.body,
            receivedAt: new Date().toISOString(),
        };
        const engine = new WorkflowExecutionEngine(matchedWorkflow.id, nodes, edges, incomingPayload);
        const result = await engine.run();
        res.json({
            success: true,
            message: `Webhook '${webhookId}' triggered workflow '${matchedWorkflow.name}'`,
            executionId: result.id,
            status: result.status,
            duration_ms: result.duration_ms,
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
