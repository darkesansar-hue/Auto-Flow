import React from 'react';
import { Settings, Cpu, HardDrive, ShieldCheck, Database, Server } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-forge-950 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Settings className="w-5 h-5 text-forge-accent" />
          <span>System & Engine Settings</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Runtime environment parameters, hardware allocation, and security rules.
        </p>
      </div>

      {/* Diagnostics Card */}
      <div className="rounded-xl bg-forge-900 border border-forge-700/60 p-6 space-y-4 shadow-glass">
        <h3 className="text-sm font-semibold text-white flex items-center space-x-2 border-b border-forge-700/60 pb-3">
          <Cpu className="w-4 h-4 text-forge-cyan" />
          <span>Runtime Environment & Hardware Profile</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-forge-850 border border-forge-700/50 flex justify-between items-center">
            <span className="text-slate-400">Target System:</span>
            <span className="font-mono text-slate-200">Windows (8GB RAM Optimized)</span>
          </div>

          <div className="p-3.5 rounded-lg bg-forge-850 border border-forge-700/50 flex justify-between items-center">
            <span className="text-slate-400">Database Engine:</span>
            <span className="font-mono text-forge-emerald flex items-center space-x-1">
              <Database className="w-3.5 h-3.5" />
              <span>Node:SQLite (Zero Overhead)</span>
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-forge-850 border border-forge-700/50 flex justify-between items-center">
            <span className="text-slate-400">Backend Server:</span>
            <span className="font-mono text-slate-200">Express + TypeScript (Port 3001)</span>
          </div>

          <div className="p-3.5 rounded-lg bg-forge-850 border border-forge-700/50 flex justify-between items-center">
            <span className="text-slate-400">Frontend Bundler:</span>
            <span className="font-mono text-slate-200">Vite + React (Port 5173)</span>
          </div>
        </div>
      </div>

      {/* Security Policies */}
      <div className="rounded-xl bg-forge-900 border border-forge-700/60 p-6 space-y-4 shadow-glass">
        <h3 className="text-sm font-semibold text-white flex items-center space-x-2 border-b border-forge-700/60 pb-3">
          <ShieldCheck className="w-4 h-4 text-forge-emerald" />
          <span>Engine Security Policies</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-lg bg-forge-850 border border-forge-700/40">
            <div>
              <div className="font-semibold text-white">SSRF Defense Shield</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Automatically rejects private IP addresses (10.x, 172.16-31.x, 192.168.x, 127.0.0.1, 169.254.169.254)
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold uppercase">
              Enforced
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-forge-850 border border-forge-700/40">
            <div>
              <div className="font-semibold text-white">Zero-Eval Safe Interpolator</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Evaluates expressions strictly using safe path tokens. No unrestricted Function() or eval() execution.
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold uppercase">
              Enforced
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-forge-850 border border-forge-700/40">
            <div>
              <div className="font-semibold text-white">Execution Safety Limit</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Halts runaway graphs after 100 execution steps with cycle-detection pre-check.
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold uppercase">
              100 Steps Cap
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
