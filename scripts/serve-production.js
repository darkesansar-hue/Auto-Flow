import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('[FlowForge] Starting FlowForge Production Unified Server...\n');

const proc = spawn('node', ['dist/index.js'], {
  cwd: path.join(rootDir, 'server'),
  shell: true,
  stdio: 'inherit',
});

proc.on('close', (code) => {
  console.log(`[FlowForge] Server process exited with code ${code}`);
});
