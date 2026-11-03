import React, { useState } from 'react';
import { Send, Bot, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

interface TelegramSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SimMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  agentName?: string;
  avatarEmoji?: string;
  quickReplies?: string[];
}

export const TelegramSimulatorModal: React.FC<TelegramSimulatorModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<SimMessage[]>([
    {
      id: 'sim-1',
      sender: 'bot',
      agentName: 'ISMAIL AI Bot (grammY)',
      avatarEmoji: '🤖',
      text: `👋 Welcome to ISMAIL AI (v1.0.0)\n\nMulti-Agent Personal Assistant ready. All 12 specialist agents initialized. Send your request or choose a command.`,
      quickReplies: ['/start', '/study', '/business', '/tasks', '/islamic', '/status'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (customText?: string) => {
    const text = (customText || input).trim();
    if (!text || isLoading) return;

    const userMsg: SimMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(false);

    try {
      setIsLoading(true);
      const res = await fetch('/api/telegram/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          agentName: data.agentName || 'ISMAIL AI Bot',
          avatarEmoji: data.avatarEmoji || '🤖',
          text: data.reply || 'No response.',
          quickReplies: data.quickReplies,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          agentName: 'Error Gate',
          avatarEmoji: '⚠️',
          text: 'Simulation request failed. Check server status.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Telegram Header */}
        <div className="bg-sky-600 dark:bg-sky-700 text-white p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-base">
              🤖
            </div>
            <div>
              <h3 className="font-bold text-sm">ISMAIL AI Bot (@IsmailAIBot)</h3>
              <p className="text-[11px] text-sky-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                grammY Webhook & Owner Auth Enforced
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Telegram Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0e1621] text-zinc-100 text-xs">
          <div className="text-center my-1">
            <span className="bg-zinc-800/80 text-zinc-400 text-[10px] px-2.5 py-1 rounded-full">
              Simulating Telegram Client • Owner ID Auth Active
            </span>
          </div>

          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 whitespace-pre-wrap leading-relaxed ${
                    isUser
                      ? 'bg-sky-600 text-white rounded-br-none'
                      : 'bg-[#182533] text-zinc-100 rounded-bl-none border border-zinc-700/50'
                  }`}
                >
                  {!isUser && (
                    <div className="font-semibold text-sky-400 text-[11px] mb-1 flex items-center gap-1">
                      <span>{m.avatarEmoji || '🤖'}</span>
                      <span>{m.agentName}</span>
                    </div>
                  )}
                  {m.text}
                </div>

                {/* Inline telegram button simulation */}
                {!isUser && m.quickReplies && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {m.quickReplies.map((qr, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(qr)}
                        className="bg-[#242f3d] hover:bg-[#2e3b4d] text-sky-300 border border-sky-900/50 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors"
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="text-zinc-400 text-[11px] italic">bot is typing...</div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-2.5 bg-[#17212b] border-t border-zinc-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type /start, /study, /business, or message..."
              className="flex-1 bg-[#242f3d] border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
