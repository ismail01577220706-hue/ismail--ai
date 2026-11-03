import React, { useState } from 'react';
import {
  Settings,
  CheckCircle2,
  AlertTriangle,
  Send,
  Database,
  Cpu,
  Shield,
  Key,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

interface SettingsViewProps {
  onOpenTelegramSim: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenTelegramSim }) => {
  const [copiedMigration, setCopiedMigration] = useState(false);

  const handleCopyMigration = () => {
    navigator.clipboard.writeText(`-- View complete migration in /supabase/migrations/20261103000000_ismail_ai_init.sql`);
    setCopiedMigration(true);
    setTimeout(() => setCopiedMigration(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-500" />
          System Settings & Integrations
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Core services status, security boundaries, Telegram Bot pairing, and Supabase PostgreSQL schema.
        </p>
      </div>

      {/* Integration Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gemini API */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-500" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Google Gemini</h3>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Connected
            </span>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Engine: <strong>gemini-3.8-flash</strong> via official <code>@google/genai</code> SDK with server-side proxy & User-Agent telemetry.
          </p>
          <div className="text-[11px] text-zinc-400">
            Secrets Panel: <code>GEMINI_API_KEY</code>
          </div>
        </div>

        {/* Telegram Bot */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-sky-500" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Telegram Bot</h3>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
              grammY Ready
            </span>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Framework: <strong>grammY v1.46</strong>. Webhook & polling handlers ready with owner verification security.
          </p>
          <button
            onClick={onOpenTelegramSim}
            className="w-full py-1.5 px-3 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-semibold hover:bg-sky-100 dark:hover:bg-sky-900/80 transition-colors"
          >
            Launch Telegram Simulator
          </button>
        </div>

        {/* Supabase Database */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Supabase DB</h3>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Active Store
            </span>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            15 SQL tables specified with RLS, foreign keys, and indexes. Fallback local cache active until Supabase keys provided.
          </p>
          <div className="text-[11px] text-zinc-400">
            Migration: <code>/supabase/migrations/</code>
          </div>
        </div>
      </div>

      {/* Setup Guide: Telegram Bot */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <span>📲</span> How to Link Live Telegram Bot (@BotFather)
        </h3>
        <ol className="text-xs text-zinc-600 dark:text-zinc-400 space-y-2 list-decimal list-inside leading-relaxed">
          <li>
            Open Telegram and message <strong>@BotFather</strong>. Send <code>/newbot</code> and name it (e.g., <em>Ismail AI</em>).
          </li>
          <li>
            Copy the API token provided by BotFather (format: <code>1234567890:ABCdefGHI...</code>).
          </li>
          <li>
            Find your Telegram User ID by sending <code>/start</code> to <strong>@userinfobot</strong> on Telegram.
          </li>
          <li>
            Set <code>TELEGRAM_BOT_TOKEN</code> and <code>TELEGRAM_OWNER_ID</code> in your <code>.env</code> file or deployment environment.
          </li>
          <li>
            Set your webhook URL to <code>https://your-domain.com/api/telegram/webhook</code> (or run in polling mode).
          </li>
        </ol>
      </div>

      {/* Setup Guide: Supabase Migration */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>🐘</span> Supabase PostgreSQL Migration (15 Tables)
          </h3>
          <button
            onClick={handleCopyMigration}
            className="flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:underline"
          >
            {copiedMigration ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedMigration ? 'Copied Path!' : 'Copy Migration Path'}</span>
          </button>
        </div>
        <p className="text-xs text-zinc-500">
          Complete migration script generated in <code>supabase/migrations/20261103000000_ismail_ai_init.sql</code>. Contains table definitions for <code>profiles</code>, <code>conversations</code>, <code>messages</code>, <code>memories</code>, <code>agents</code>, <code>tasks</code>, <code>scheduled_tasks</code>, <code>files</code>, <code>knowledge_base</code>, <code>customers</code>, <code>products</code>, <code>orders</code>, <code>activity_logs</code>, <code>api_usage</code>, and <code>approvals</code> with Row Level Security (RLS) policies.
        </p>
      </div>
    </div>
  );
};
