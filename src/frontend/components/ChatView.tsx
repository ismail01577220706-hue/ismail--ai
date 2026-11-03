import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Mic, Paperclip, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { ChatMessage } from '../types.ts';
import { AgentDefinition } from '../../backend/agents/types.ts';

interface ChatViewProps {
  agents: AgentDefinition[];
  selectedAgentId?: string;
  onSelectAgent: (id?: string) => void;
  onDecideApproval: (id: string, decision: 'approved' | 'rejected') => Promise<void>;
}

export const ChatView: React.FC<ChatViewProps> = ({
  agents,
  selectedAgentId,
  onSelectAgent,
  onDecideApproval,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      agentId: 'agent-06-personal',
      agentName: 'ISMAIL AI Orchestrator',
      avatarEmoji: '⚡',
      text: `Assalamu Alaikum Ismail! I am your **ISMAIL AI Central Orchestrator**. 

All 12 specialist agents are active and synchronized with your Supabase memory and Barakah Shop BD database. 

You can ask me anything naturally in English or Bangla (e.g., study notes, inventory check, Quran verification, or task management), or select an agent above.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedQuickReplies: [
        'Check Barakah Shop BD inventory & orders',
        'Summarize spaced repetition study protocol',
        'Verify Hadith about black seed (Kalijira)',
        'What are my priority tasks for today?',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const activeAgent = agents.find((a) => a.id === selectedAgentId);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history from recent turns
      const history = messages.slice(-6).map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        parts: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          explicitAgentId: selectedAgentId,
          conversationHistory: history,
        }),
      });

      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        agentId: data.agentId,
        agentName: data.agentName,
        avatarEmoji: data.avatarEmoji,
        text: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionRequired: data.actionRequired,
        suggestedQuickReplies: data.suggestedQuickReplies,
        usage: data.usage,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          agentName: 'System Notice',
          avatarEmoji: '⚠️',
          text: 'Notice: Could not communicate with AI Orchestrator. Please check connection and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateVoice = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setInput('বারাকাহ শপের আজকের স্টক এবং লাভ-লোকসানের রিপোর্ট দাও (Voice transcription)');
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
      {/* Chat Header & Agent Switcher */}
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/70 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{activeAgent ? activeAgent.avatarEmoji : '⚡'}</span>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {activeAgent ? activeAgent.name : 'Central AI Orchestrator'}
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {activeAgent
                ? `${activeAgent.roleTitle} • Model: ${activeAgent.modelName}`
                : 'Auto-Routing to 12 Specialist Agents based on Intent'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedAgentId || ''}
            onChange={(e) => onSelectAgent(e.target.value ? e.target.value : undefined)}
            className="text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">⚡ Auto Orchestrator (Intent Based)</option>
            {agents.map((ag) => (
              <option key={ag.id} value={ag.id}>
                {ag.avatarEmoji} {ag.name} (#{ag.number})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              {!isUser && (
                <div className="flex items-center gap-1.5 mb-1 px-1 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  <span>{m.avatarEmoji || '🤖'}</span>
                  <span>{m.agentName || 'Agent'}</span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">• {m.timestamp}</span>
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-none border border-zinc-200/80 dark:border-zinc-700/80 shadow-sm'
                }`}
              >
                {m.text}

                {/* Inline Human-in-the-Loop Approval Action Card */}
                {m.actionRequired && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Action Approval Required: {m.actionRequired.title}</span>
                    </div>
                    <p className="text-[11px] opacity-90">{m.actionRequired.description}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onDecideApproval(m.id, 'approved')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve & Execute
                      </button>
                      <button
                        onClick={() => onDecideApproval(m.id, 'rejected')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 font-medium text-xs transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggested Quick Replies */}
              {!isUser && m.suggestedQuickReplies && m.suggestedQuickReplies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-full">
                  {m.suggestedQuickReplies.map((qr, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(qr)}
                      className="text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-300 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 rounded-lg text-zinc-600 dark:text-zinc-300 transition-colors text-left"
                    >
                      💡 {qr}
                    </button>
                  ))}
                </div>
              )}

              {/* Tokens Badge */}
              {!isUser && m.usage && m.usage.totalTokens > 0 && (
                <div className="mt-1 px-1 text-[10px] text-zinc-400 dark:text-zinc-500">
                  {m.usage.totalTokens} tokens • Gemini 3.8 Flash
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 italic py-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
            <span>Orchestrator analyzing intent & retrieving memories...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={handleSimulateVoice}
            className={`p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${
              isRecording ? 'bg-red-100 dark:bg-red-950 text-red-600 animate-pulse' : 'text-zinc-500'
            }`}
            title="Voice Note Input"
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              activeAgent
                ? `Message ${activeAgent.name}...`
                : 'Ask ISMAIL AI in English or Bangla (e.g. Barakah Shop, Study, Islamic, Code)...'
            }
            className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-xl text-sm flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
