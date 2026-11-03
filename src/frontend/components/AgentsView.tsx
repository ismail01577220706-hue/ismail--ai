import React, { useState } from 'react';
import { AgentDefinition } from '../../backend/agents/types.ts';
import { Bot, Shield, Wrench, MessageSquare, CheckCircle, ExternalLink } from 'lucide-react';

interface AgentsViewProps {
  agents: AgentDefinition[];
  onSelectAgentForChat: (agentId: string) => void;
}

export const AgentsView: React.FC<AgentsViewProps> = ({ agents, onSelectAgentForChat }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [inspectAgent, setInspectAgent] = useState<AgentDefinition | null>(null);

  const categories = ['All', 'Academics', 'Language', 'Commerce', 'Media', 'Deen', 'Productivity', 'Engineering', 'Intelligence'];

  const filteredAgents =
    selectedCategory === 'All'
      ? agents
      : agents.filter((a) => a.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Bot className="w-6 h-6 text-emerald-500" />
            Specialist Agents Directory (12 Configured)
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Modular multi-agent architecture with specialized system instructions, authorized tools, and approval boundaries.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((ag) => (
          <div
            key={ag.id}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                    {ag.avatarEmoji}
                  </span>
                  <div>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Agent {ag.number < 10 ? `0${ag.number}` : ag.number} • {ag.category}
                    </span>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {ag.name}
                    </h3>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Active
                </span>
              </div>

              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {ag.roleTitle}
              </p>

              {/* Capabilities list */}
              <div className="space-y-1 pt-1">
                {ag.capabilities.slice(0, 3).map((cap, i) => (
                  <div key={i} className="text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{cap}</span>
                  </div>
                ))}
              </div>

              {/* Tools & Security Flags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                {ag.permissions.requiresApproval && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    <Shield className="w-3 h-3" /> Approval Gated
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  <Wrench className="w-3 h-3" /> {ag.tools.length} Tools
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 mt-4">
              <button
                onClick={() => onSelectAgentForChat(ag.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Chat with Agent
              </button>

              <button
                onClick={() => setInspectAgent(ag)}
                className="py-2 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium text-xs transition-colors"
                title="View System Instructions & Details"
              >
                Inspect
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Inspect Modal */}
      {inspectAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{inspectAgent.avatarEmoji}</span>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    Agent {inspectAgent.number < 10 ? `0${inspectAgent.number}` : inspectAgent.number}: {inspectAgent.name}
                  </h2>
                  <p className="text-xs text-zinc-500">{inspectAgent.roleTitle}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectAgent(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                System Instructions
              </h4>
              <pre className="text-xs font-mono p-3 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200 leading-relaxed">
                {inspectAgent.systemInstruction}
              </pre>
            </div>

            <div>
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Authorized Capabilities ({inspectAgent.capabilities.length})
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {inspectAgent.capabilities.map((cap, i) => (
                  <li key={i} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/50 p-1.5 rounded-lg">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Tools & Security Policy
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {inspectAgent.tools.map((tool, i) => (
                  <span key={i} className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                    ⚙️ {tool}()
                  </span>
                ))}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                Requires Approval for Critical Actions: <strong>{inspectAgent.permissions.requiresApproval ? 'YES (Human-in-the-loop enforced)' : 'NO (Automated)'}</strong>
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
              <button
                onClick={() => setInspectAgent(null)}
                className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const id = inspectAgent.id;
                  setInspectAgent(null);
                  onSelectAgentForChat(id);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                Start Chatting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
