import { Router } from 'express';
import { db } from '../db/database.js';
import crypto from 'node:crypto';
export const workflowsRouter = Router();
// GET all workflows
workflowsRouter.get('/', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM workflows ORDER BY updated_at DESC');
        const rows = stmt.all();
        const parsed = rows.map((r) => ({
            ...r,
            nodes: JSON.parse(r.nodes || '[]'),
            edges: JSON.parse(r.edges || '[]'),
        }));
        res.json({ success: true, data: parsed });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// GET single workflow by ID
workflowsRouter.get('/:id', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM workflows WHERE id = ?');
        const row = stmt.get(req.params.id);
        if (!row) {
            return res.status(404).json({ success: false, error: 'Workflow not found' });
        }
        res.json({
            success: true,
            data: {
                ...row,
                nodes: JSON.parse(row.nodes || '[]'),
                edges: JSON.parse(row.edges || '[]'),
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// CREATE new workflow
workflowsRouter.post('/', (req, res) => {
    try {
        const { name, description, trigger_type = 'manual', nodes = [], edges = [] } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, error: 'Workflow name is required' });
        }
        const id = `wf-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
        const now = new Date().toISOString();
        const stmt = db.prepare(`
      INSERT INTO workflows (id, name, description, trigger_type, nodes, edges, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, name, description || '', trigger_type, JSON.stringify(nodes), JSON.stringify(edges), 'active', now, now);
        res.status(201).json({
            success: true,
            data: {
                id,
                name,
                description,
                trigger_type,
                nodes,
                edges,
                status: 'active',
                created_at: now,
                updated_at: now,
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// DUPLICATE workflow
workflowsRouter.post('/:id/duplicate', (req, res) => {
    try {
        const existingStmt = db.prepare('SELECT * FROM workflows WHERE id = ?');
        const existing = existingStmt.get(req.params.id);
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Workflow not found' });
        }
        const newId = `wf-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
        const now = new Date().toISOString();
        const newName = `${existing.name} (Copy)`;
        const stmt = db.prepare(`
      INSERT INTO workflows (id, name, description, trigger_type, nodes, edges, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(newId, newName, existing.description, existing.trigger_type, existing.nodes, existing.edges, 'active', now, now);
        res.status(201).json({
            success: true,
            data: {
                id: newId,
                name: newName,
                description: existing.description,
                trigger_type: existing.trigger_type,
                nodes: JSON.parse(existing.nodes || '[]'),
                edges: JSON.parse(existing.edges || '[]'),
                status: 'active',
                created_at: now,
                updated_at: now,
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// UPDATE existing workflow
workflowsRouter.put('/:id', (req, res) => {
    try {
        const { name, description, nodes, edges, status } = req.body;
        const now = new Date().toISOString();
        const existingStmt = db.prepare('SELECT * FROM workflows WHERE id = ?');
        const existing = existingStmt.get(req.params.id);
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Workflow not found' });
        }
        const updatedName = name ?? existing.name;
        const updatedDesc = description ?? existing.description;
        const updatedNodes = nodes ? JSON.stringify(nodes) : existing.nodes;
        const updatedEdges = edges ? JSON.stringify(edges) : existing.edges;
        const updatedStatus = status ?? existing.status;
        const updateStmt = db.prepare(`
      UPDATE workflows
      SET name = ?, description = ?, nodes = ?, edges = ?, status = ?, updated_at = ?
      WHERE id = ?
    `);
        updateStmt.run(updatedName, updatedDesc, updatedNodes, updatedEdges, updatedStatus, now, req.params.id);
        res.json({
            success: true,
            data: {
                id: req.params.id,
                name: updatedName,
                description: updatedDesc,
                nodes: nodes ?? JSON.parse(existing.nodes),
                edges: edges ?? JSON.parse(existing.edges),
                status: updatedStatus,
                updated_at: now,
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// DELETE workflow
workflowsRouter.delete('/:id', (req, res) => {
    try {
        const stmt = db.prepare('DELETE FROM workflows WHERE id = ?');
        const result = stmt.run(req.params.id);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Workflow not found' });
        }
        res.json({ success: true, message: 'Workflow deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
