import { Router } from 'express';
import { db } from '../db/database.js';
import { encrypt } from '../engine/crypto.js';
import crypto from 'node:crypto';
export const credentialsRouter = Router();
// GET all credentials (masked)
credentialsRouter.get('/', (req, res) => {
    try {
        const stmt = db.prepare('SELECT id, name, type, created_at, updated_at FROM credentials ORDER BY created_at DESC');
        const rows = stmt.all();
        res.json({ success: true, data: rows });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// CREATE credential
credentialsRouter.post('/', (req, res) => {
    try {
        const { name, type, data } = req.body;
        if (!name || !type || !data) {
            return res.status(400).json({ success: false, error: 'Name, type, and data are required.' });
        }
        const id = `cred-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
        const encrypted = encrypt(typeof data === 'string' ? data : JSON.stringify(data));
        const now = new Date().toISOString();
        const stmt = db.prepare(`
      INSERT INTO credentials (id, name, type, encrypted_data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, name, type, encrypted, now, now);
        res.status(201).json({
            success: true,
            data: {
                id,
                name,
                type,
                created_at: now,
                updated_at: now,
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// DELETE credential
credentialsRouter.delete('/:id', (req, res) => {
    try {
        const stmt = db.prepare('DELETE FROM credentials WHERE id = ?');
        const result = stmt.run(req.params.id);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Credential not found' });
        }
        res.json({ success: true, message: 'Credential deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
