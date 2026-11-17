import React, { useState } from 'react';
import { KeyRound, Plus, Trash2, ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';
import { Credential } from '../../types';
import { api } from '../../api/client';

interface CredentialsViewProps {
  credentials: Credential[];
  onRefresh: () => void;
}

export const CredentialsView: React.FC<CredentialsViewProps> = ({ credentials, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('bearer');
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !secret) return;
    setSaving(true);
    try {
      await api.createCredential({ name, type, data: secret });
      setName('');
      setSecret('');
      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this credential?')) {
      await api.deleteCredential(id);
      onRefresh();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-forge-950">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <KeyRound className="w-5 h-5 text-forge-accent" />
            <span>Encrypted Credential Vault</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Store API tokens, secrets, and auth headers securely with AES-256-GCM.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-forge-accent hover:bg-forge-accentHover text-white text-xs font-semibold shadow-glow-indigo transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Credential</span>
        </button>
      </div>

      {/* Credentials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {credentials.length === 0 ? (
          <div className="col-span-full rounded-xl bg-forge-900 border border-forge-700/60 p-12 text-center text-slate-500 text-xs">
            No credentials saved. Add one to use with your HTTP Request nodes.
          </div>
        ) : (
          credentials.map((cred) => (
            <div
              key={cred.id}
              className="p-5 rounded-xl bg-forge-900 border border-forge-700/60 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase font-semibold">
                    {cred.type}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-2">{cred.name}</h3>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                    Added {new Date(cred.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-forge-emerald">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="pt-3 border-t border-forge-700/50 flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-mono flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>AES-256 Encrypted</span>
                </span>

                <button
                  onClick={() => handleDelete(cred.id)}
                  className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-forge-rose transition-colors"
                  title="Delete Credential"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-md bg-forge-900 border border-forge-700/80 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-forge-700/60 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-forge-accent" />
                <span>New Credential</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Name</label>
              <input
                type="text"
                placeholder="e.g. GitHub Token or Stripe API Key"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-forge-950 border border-forge-700/60 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-forge-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Credential Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-forge-950 border border-forge-700/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-forge-accent"
              >
                <option value="bearer">Bearer Token</option>
                <option value="api_key">Header API Key</option>
                <option value="basic">Basic Auth</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Secret / Token Value</label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  placeholder="Paste token or sensitive key"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  required
                  className="w-full bg-forge-950 border border-forge-700/60 rounded-lg pl-3 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-forge-accent font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-forge-800 text-slate-300 text-xs hover:bg-forge-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-forge-accent hover:bg-forge-accentHover text-white text-xs font-semibold shadow-glow-indigo"
              >
                {saving ? 'Encrypting...' : 'Save & Encrypt'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
