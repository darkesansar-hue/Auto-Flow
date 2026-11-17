import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Bot, 
  Radio, 
  CalendarClock, 
  Globe, 
  Layers, 
  Zap, 
  CheckCircle2, 
  Search,
  Key
} from 'lucide-react';
import { api } from '../../api/client';
import { Workflow } from '../../types';

interface TemplatesViewProps {
  onWorkflowCreated: (wf: Workflow) => void;
}

export const WORKFLOW_TEMPLATES = [
  {
    id: 'tpl-youtube-full-automation',
    name: 'Full AI YouTube Automation Machine (Script -> Image -> Video -> Upload)',
    category: 'YouTube & Media',
    description: 'Complete hands-off YouTube channel automation: Generates viral scripts with LLMs, realistic voiceovers with ElevenLabs, scene visuals with DALL-E/Flux, renders MP4 video, and auto-publishes to YouTube Data API v3.',
    complexity: 'Advanced',
    nodesCount: 8,
    tags: ['YouTube API', 'AI Script', 'ElevenLabs', 'DALL-E 3', 'Video Render'],
    nodes: [
      { id: 'yt-1', type: 'scheduleTrigger', position: { x: 50, y: 150 }, data: { label: 'Daily Video Trigger', schedule: 'Every day at 10:00 AM' } },
      { id: 'yt-2', type: 'llmChat', position: { x: 340, y: 150 }, data: { label: 'AI Script & Prompts', model: 'gpt-4o', prompt: 'Write a viral 60-second video script about {{$json.topic || "Future of AI"}} with engaging hook, narrator voiceover, and 3 scene image prompts.' } },
      { id: 'yt-3', type: 'httpRequest', position: { x: 640, y: 150 }, data: { label: 'ElevenLabs Voiceover', method: 'POST', url: 'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', headers: [{ key: 'xi-api-key', value: '{{$node["Credentials"].key}}' }] } },
      { id: 'yt-4', type: 'httpRequest', position: { x: 940, y: 150 }, data: { label: 'AI Image & Thumbnail', method: 'POST', url: 'https://api.openai.com/v1/images/generations', headers: [{ key: 'Authorization', value: 'Bearer {{$node["Credentials"].key}}' }] } },
      { id: 'yt-5', type: 'httpRequest', position: { x: 1240, y: 150 }, data: { label: 'Render MP4 Video', method: 'POST', url: 'https://api.shotstack.io/v1/render', body: { sound: '{{$node["ElevenLabs Voiceover"].audio_url}}', clips: '{{$node["AI Image & Thumbnail"].image_urls}}' } } },
      { id: 'yt-6', type: 'delay', position: { x: 1540, y: 150 }, data: { label: 'Wait for Render', delayMs: 3000 } },
      { id: 'yt-7', type: 'httpRequest', position: { x: 1840, y: 150 }, data: { label: 'Upload to YouTube', method: 'POST', url: 'https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status', headers: [{ key: 'Authorization', value: 'Bearer {{$node["Credentials"].youtube_token}}' }] } },
      { id: 'yt-8', type: 'setData', position: { x: 2140, y: 150 }, data: { label: 'Save Published URL', values: [{ key: 'youtubeUrl', value: 'https://youtube.com/watch?v={{$node["Upload to YouTube"].id}}' }, { key: 'status', value: 'PUBLISHED' }] } },
    ],
    edges: [
      { id: 'ye-1', source: 'yt-1', target: 'yt-2', animated: true },
      { id: 'ye-2', source: 'yt-2', target: 'yt-3', animated: true },
      { id: 'ye-3', source: 'yt-3', target: 'yt-4', animated: true },
      { id: 'ye-4', source: 'yt-4', target: 'yt-5', animated: true },
      { id: 'ye-5', source: 'yt-5', target: 'yt-6', animated: true },
      { id: 'ye-6', source: 'yt-6', target: 'yt-7', animated: true },
      { id: 'ye-7', source: 'yt-7', target: 'yt-8', animated: true },
    ],
  },
  {
    id: 'tpl-ai-support',
    name: 'Autonomous AI Customer Support & Ticket Triage',
    category: 'AI & LLM',
    description: 'Listens for customer webhooks, runs AI intent classification, auto-generates answers with reasoning, and signs verification hashes.',
    complexity: 'Advanced',
    nodesCount: 4,
    tags: ['AI Agent', 'Webhooks', 'Classifier', 'Crypto'],
    nodes: [
      { id: 'n1', type: 'webhookTrigger', position: { x: 80, y: 150 }, data: { label: 'Customer Webhook', webhookId: 'support-inbound', method: 'POST' } },
      { id: 'n2', type: 'textClassifier', position: { x: 380, y: 150 }, data: { label: 'Classify Intent', inputField: '{{$json.message}}', categories: ['Critical Bug', 'Billing', 'Feature', 'General'] } },
      { id: 'n3', type: 'aiAgent', position: { x: 680, y: 150 }, data: { label: 'Support Agent', role: 'Support Specialist', model: 'gpt-4o-mini', userPrompt: '{{$json.message}}' } },
      { id: 'n4', type: 'cryptoNode', position: { x: 980, y: 150 }, data: { label: 'Sign Ticket Hash', action: 'sha256', field: '{{$json.timestamp}}' } },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', animated: true },
      { id: 'e2', source: 'n2', target: 'n3', animated: true },
      { id: 'e3', source: 'n3', target: 'n4', animated: true },
    ],
  },
  {
    id: 'tpl-api-enrich',
    name: 'Real-Time API Enrichment & Multi-Branch Router',
    category: 'DevOps',
    description: 'Enriches input parameters, queries external public APIs, and routes via Switch node depending on account tier.',
    complexity: 'Intermediate',
    nodesCount: 5,
    tags: ['HTTP Request', 'Switch Router', 'Set Data'],
    nodes: [
      { id: 'n1', type: 'manualTrigger', position: { x: 80, y: 150 }, data: { label: 'Manual Trigger' } },
      { id: 'n2', type: 'setData', position: { x: 340, y: 150 }, data: { label: 'Account Tier', values: [{ key: 'tier', value: 'enterprise' }, { key: 'id', value: '1' }] } },
      { id: 'n3', type: 'httpRequest', position: { x: 620, y: 150 }, data: { label: 'Fetch Details', method: 'GET', url: 'https://jsonplaceholder.typicode.com/todos/1' } },
      { id: 'n4', type: 'switchNode', position: { x: 920, y: 150 }, data: { label: 'Tier Routing', field: '{{$json.tier}}', rules: [{ label: 'VIP', value: 'enterprise' }, { label: 'Standard', value: 'standard' }] } },
      { id: 'n5', type: 'setData', position: { x: 1220, y: 100 }, data: { label: 'Priority Queue', values: [{ key: 'sla', value: '10_MIN' }] } },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', animated: true },
      { id: 'e2', source: 'n2', target: 'n3', animated: true },
      { id: 'e3', source: 'n3', target: 'n4', animated: true },
      { id: 'e4', source: 'n4', target: 'n5', sourceHandle: 'output_0', animated: true },
    ],
  },
  {
    id: 'tpl-uptime-monitor',
    name: 'Scheduled Uptime & Health Monitor Heartbeat',
    category: 'DevOps',
    description: 'Pings microservices on a scheduled recurring interval, pauses for telemetry latency measurement, and formats health payloads.',
    complexity: 'Beginner',
    nodesCount: 3,
    tags: ['Cron Schedule', 'Delay', 'Telemetry'],
    nodes: [
      { id: 'n1', type: 'scheduleTrigger', position: { x: 100, y: 150 }, data: { label: 'Every 5 Mins', schedule: 'Every 5 minutes' } },
      { id: 'n2', type: 'delay', position: { x: 380, y: 150 }, data: { label: 'Latency Delay', delayMs: 400 } },
      { id: 'n3', type: 'setData', position: { x: 680, y: 150 }, data: { label: 'Record Status', values: [{ key: 'status', value: 'ONLINE' }, { key: 'region', value: 'us-east' }] } },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', animated: true },
      { id: 'e2', source: 'n2', target: 'n3', animated: true },
    ],
  },
  {
    id: 'tpl-lead-extractor',
    name: 'Structured Lead Extractor & Filtering Pipeline',
    category: 'Marketing',
    description: 'Extracts validated emails, phone numbers, and lead info from raw inbound messages and filters disqualified prospects.',
    complexity: 'Intermediate',
    nodesCount: 4,
    tags: ['Extractor', 'Filter', 'Transform'],
    nodes: [
      { id: 'n1', type: 'webhookTrigger', position: { x: 80, y: 150 }, data: { label: 'Inbound Contact', webhookId: 'lead-inbound', method: 'POST' } },
      { id: 'n2', type: 'structuredExtractor', position: { x: 360, y: 150 }, data: { label: 'Extract Entities', sourceText: '{{$json.body.notes}}', fields: [{ name: 'email', type: 'string' }, { name: 'amount', type: 'number' }] } },
      { id: 'n3', type: 'filterNode', position: { x: 680, y: 150 }, data: { label: 'Filter Budget', field: '{{$json.extracted.amount}}', operator: 'greater_than', value: '50' } },
      { id: 'n4', type: 'codeNode', position: { x: 960, y: 150 }, data: { label: 'Format CRM Lead', assignments: [{ key: 'crmReady', value: 'true' }] } },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', animated: true },
      { id: 'e2', source: 'n2', target: 'n3', animated: true },
      { id: 'e3', source: 'n3', target: 'n4', animated: true },
    ],
  },
  {
    id: 'tpl-batch-processor',
    name: 'E-commerce Batch Order Looper & Encryptor',
    category: 'E-Commerce',
    description: 'Iterates through bulk order arrays in chunks of 5, applies token hashing, and merges results cleanly.',
    complexity: 'Advanced',
    nodesCount: 4,
    tags: ['Loop / Batch', 'Crypto', 'Merge'],
    nodes: [
      { id: 'n1', type: 'manualTrigger', position: { x: 80, y: 150 }, data: { label: 'Trigger Batch' } },
      { id: 'n2', type: 'loopBatchNode', position: { x: 360, y: 150 }, data: { label: 'Chunk Orders', batchSize: 5 } },
      { id: 'n3', type: 'cryptoNode', position: { x: 660, y: 150 }, data: { label: 'Hash Batch ID', action: 'sha256', field: '{{$json.timestamp}}' } },
      { id: 'n4', type: 'merge', position: { x: 960, y: 150 }, data: { label: 'Merge Stream' } },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', animated: true },
      { id: 'e2', source: 'n2', target: 'n3', animated: true },
      { id: 'e3', source: 'n3', target: 'n4', animated: true },
    ],
  },
];

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onWorkflowCreated }) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [cloningId, setCloningId] = useState<string | null>(null);

  const categories = ['All', 'YouTube & Media', 'AI & LLM', 'DevOps', 'Marketing', 'E-Commerce'];

  const filtered = WORKFLOW_TEMPLATES.filter((tpl) => {
    const matchesSearch = tpl.name.toLowerCase().includes(search.toLowerCase()) ||
      tpl.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'All' || tpl.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleUseTemplate = async (template: typeof WORKFLOW_TEMPLATES[0]) => {
    setCloningId(template.id);
    try {
      const created = await api.createWorkflow({
        name: template.name,
        description: template.description,
        nodes: template.nodes,
        edges: template.edges,
      });
      onWorkflowCreated(created);
    } catch (err: any) {
      alert(`Could not instantiate template: ${err.message}`);
    } finally {
      setCloningId(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-forge-950">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-forge-900 via-indigo-950/40 to-forge-900 p-6 border border-forge-700/60 shadow-glass">
        <div className="flex items-center space-x-2 text-forge-accent text-xs font-semibold tracking-wider uppercase mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Workflow Template Library</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Production Automation Blueprints
        </h2>
        <p className="text-slate-400 text-xs mt-1 max-w-xl">
          Instantly deploy battle-tested AI agents, live webhook pipes, and multi-branch routers with 1 click.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-forge-900 border border-forge-700/60 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-forge-accent"
          />
        </div>

        <div className="flex space-x-1.5 overflow-x-auto w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCat === cat
                  ? 'bg-forge-accent text-white shadow-glow-indigo'
                  : 'bg-forge-900 text-slate-400 hover:text-white hover:bg-forge-850'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((tpl) => (
          <div
            key={tpl.id}
            className="p-6 rounded-2xl bg-forge-900/90 border border-forge-700/60 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-4 group shadow-glass"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
                  {tpl.category}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {tpl.complexity}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mt-3 group-hover:text-indigo-200 transition-colors">
                {tpl.name}
              </h3>

              <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                {tpl.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {tpl.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-forge-850 text-slate-300 border border-forge-700/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-forge-700/50 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>{tpl.nodesCount} Nodes</span>
              </span>

              <button
                onClick={() => handleUseTemplate(tpl)}
                disabled={cloningId === tpl.id}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-forge-accent hover:bg-forge-accentHover text-white text-xs font-semibold shadow-glow-indigo transition-all cursor-pointer"
              >
                <span>{cloningId === tpl.id ? 'Creating...' : 'Use Template'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
