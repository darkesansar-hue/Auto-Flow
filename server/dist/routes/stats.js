import { Router } from 'express';
import { db } from '../db/database.js';
export const statsRouter = Router();
statsRouter.get('/', (req, res) => {
    try {
        const wfCountStmt = db.prepare('SELECT count(*) as count FROM workflows');
        const totalWorkflows = wfCountStmt.get().count || 0;
        const execCountStmt = db.prepare('SELECT count(*) as count FROM executions');
        const totalExecutions = execCountStmt.get().count || 0;
        const successStmt = db.prepare("SELECT count(*) as count FROM executions WHERE status = 'success'");
        const successfulExecutions = successStmt.get().count || 0;
        const activeWfStmt = db.prepare("SELECT count(*) as count FROM workflows WHERE status = 'active'");
        const activeWorkflows = activeWfStmt.get().count || 0;
        const successRate = totalExecutions > 0
            ? Math.round((successfulExecutions / totalExecutions) * 100)
            : 100;
        const recentExecutionsStmt = db.prepare(`
      SELECT e.id, e.workflow_id, e.status, e.duration_ms, e.started_at, w.name as workflow_name
      FROM executions e
      LEFT JOIN workflows w ON e.workflow_id = w.id
      ORDER BY e.started_at DESC
      LIMIT 5
    `);
        const recentExecutions = recentExecutionsStmt.all();
        res.json({
            success: true,
            data: {
                totalWorkflows,
                activeWorkflows,
                totalExecutions,
                successfulExecutions,
                successRate,
                recentExecutions,
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
