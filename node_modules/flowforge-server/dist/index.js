import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initDatabase } from './db/database.js';
import { workflowsRouter } from './routes/workflows.js';
import { executionsRouter } from './routes/executions.js';
import { credentialsRouter } from './routes/credentials.js';
import { statsRouter } from './routes/stats.js';
import { webhooksRouter } from './routes/webhooks.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3001;
// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// Initialize SQLite database
initDatabase();
// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'FlowForge Automation Engine',
        timestamp: new Date().toISOString(),
        version: '1.2.0',
        capabilities: [
            'Topological DAG Runner',
            'AI Agent & LLM Chat',
            'Live Webhooks',
            'Multi-Path Switch',
            'SSRF Protection',
            'Zero-Eval Sandbox',
            'node:sqlite persistence'
        ],
    });
});
// Mount Routes
app.use('/api/workflows', workflowsRouter);
app.use('/api/executions', executionsRouter);
app.use('/api/credentials', credentialsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/webhooks', webhooksRouter);
// Serve Client Static Build if present
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const altClientDistPath = path.resolve(process.cwd(), 'client/dist');
const staticPath = fs.existsSync(clientDistPath)
    ? clientDistPath
    : fs.existsSync(altClientDistPath)
        ? altClientDistPath
        : null;
if (staticPath) {
    app.use(express.static(staticPath));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api/'))
            return next();
        res.sendFile(path.join(staticPath, 'index.html'));
    });
}
// Start Server
app.listen(PORT, () => {
    console.log(`[FlowForge] Automation server running on http://localhost:${PORT}`);
});
