import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('[FlowForge] Starting FlowForge Development Services...\n');

// 1. Start Server
const serverProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(rootDir, 'server'),
  shell: true,
  stdio: 'inherit',
});

// 2. Start Client (Vite Dev Server)
const clientProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(rootDir, 'client'),
  shell: true,
  stdio: 'inherit',
});

const cleanup = () => {
  console.log('\n[FlowForge] Shutting down services...');
  serverProcess.kill();
  clientProcess.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
