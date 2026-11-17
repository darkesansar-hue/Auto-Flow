import React, { useState } from 'react';
import { 
  PlayCircle, 
  Globe, 
  Edit3, 
  GitBranch, 
  GitMerge, 
  Clock, 
  Plus, 
  Zap,
  Radio,
  CalendarClock,
  Bot,
  MessageSquareText,
  History,
  Tags,
  Braces,
  Shuffle,
  Filter,
  Code2,
  Repeat,
  Key,
  Search
} from 'lucide-react';

interface NodePaletteProps {
  onAddNode: (type: string) => void;
}

export const NODE_TEMPLATES = [
  // 1. Triggers
  {
    type: 'manualTrigger',
    label: 'Manual Trigger',
    category: 'Triggers',
    description: 'Start execution manually on click',
    icon: Zap,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    type: 'webhookTrigger',
    label: 'Webhook Trigger',
    category: 'Triggers',
    description: 'Listen for live incoming HTTP webhooks',
    icon: Radio,
    color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  },
  {
    type: 'scheduleTrigger',
    label: 'Schedule Trigger',
    category: 'Triggers',
    description: 'Periodic interval & cron schedule trigger',
    icon: CalendarClock,
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  },

  // 2. AI & Agents
  {
    type: 'aiAgent',
    label: 'AI Agent',
    category: 'AI & Agents',
    description: 'Autonomous reasoning agent with role & tools',
    icon: Bot,
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
  {
    type: 'llmChat',
    label: 'LLM Chat Model',
    category: 'AI & Agents',
    description: 'Generate text & chat with Gemini / OpenAI',
    icon: MessageSquareText,
    color: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20',
  },
  {
    type: 'aiMemory',
    label: 'Window Memory',
    category: 'AI & Agents',
    description: 'Conversation buffer for multi-turn chat',
    icon: History,
    color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  },
  {
    type: 'textClassifier',
    label: 'Text Classifier',
    category: 'AI & Agents',
    description: 'Classify sentiment, intent, or ticket category',
    icon: Tags,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  },
  {
    type: 'structuredExtractor',
    label: 'Structured Extractor',
    category: 'AI & Agents',
    description: 'Extract typed JSON schema from unstructured text',
    icon: Braces,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },

  // 3. Logic & Flow
  {
    type: 'ifCondition',
    label: 'IF Condition',
    category: 'Logic & Flow',
    description: 'Dual-branch routing based on condition',
    icon: GitBranch,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    type: 'switchNode',
    label: 'Switch Router',
    category: 'Logic & Flow',
    description: 'Multi-path branch router with custom rules',
    icon: Shuffle,
    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  },
  {
    type: 'filterNode',
    label: 'Filter Records',
    category: 'Logic & Flow',
    description: 'Assert and filter records before continuing',
    icon: Filter,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  {
    type: 'merge',
    label: 'Merge',
    category: 'Logic & Flow',
    description: 'Combine parallel branch outputs into one',
    icon: GitMerge,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    type: 'delay',
    label: 'Delay',
    category: 'Logic & Flow',
    description: 'Pause execution for N milliseconds',
    icon: Clock,
    color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  },
  {
    type: 'loopBatchNode',
    label: 'Loop / Batch',
    category: 'Logic & Flow',
    description: 'Process lists in chunks of N items',
    icon: Repeat,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },

  // 4. Data & Code
  {
    type: 'setData',
    label: 'Set Data',
    category: 'Data & Code',
    description: 'Set, transform, or evaluate variables',
    icon: Edit3,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  {
    type: 'codeNode',
    label: 'Code Transform',
    category: 'Data & Code',
    description: 'Safe JavaScript calculation and formatting',
    icon: Code2,
    color: 'text-lime-400 bg-lime-500/10 border-lime-500/20',
  },
  {
    type: 'cryptoNode',
    label: 'Crypto & Hash',
    category: 'Data & Code',
    description: 'Compute SHA-256, MD5, HMAC, or Base64',
    icon: Key,
    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  },

  // 5. Actions & Output
  {
    type: 'httpRequest',
    label: 'HTTP Request',
    category: 'Actions & Output',
    description: 'REST API call with SSRF defense shield',
    icon: Globe,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
];

export const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Triggers', 'AI & Agents', 'Logic & Flow', 'Data & Code', 'Actions & Output'];

  const filtered = NODE_TEMPLATES.filter((n) => {
    const matchesSearch = n.label.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || n.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-80 bg-forge-900 border-r border-forge-700/60 flex flex-col h-full z-10 select-none">
      {/* Header & Search */}
      <div className="p-3.5 border-b border-forge-700/60 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Node Library ({NODE_TEMPLATES.length})
          </h3>
          <span className="text-[10px] text-indigo-400 font-mono font-medium">n8n Parity</span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search nodes & tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-forge-950 border border-forge-700/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-forge-accent"
          />
        </div>

        {/* Category Pills */}
        <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-forge-accent text-white shadow-sm'
                  : 'bg-forge-850 text-slate-400 hover:text-slate-200 hover:bg-forge-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No matching nodes found.
          </div>
        ) : (
          filtered.map((node) => {
            const Icon = node.icon;
            return (
              <div
                key={node.type}
                draggable
                onDragStart={(e) => onDragStart(e, node.type)}
                onClick={() => onAddNode(node.type)}
                className="p-2.5 rounded-xl bg-forge-850 hover:bg-forge-800/80 border border-forge-700/60 hover:border-indigo-500/40 transition-all cursor-grab active:cursor-grabbing group shadow-sm flex items-start space-x-3"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0 mt-0.5 ${node.color}`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                      {node.label}
                    </span>
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-forge-900 text-slate-400 border border-forge-700/40">
                      {node.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
                    {node.description}
                  </p>
                </div>

                <button
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity"
                  title="Add to canvas"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
