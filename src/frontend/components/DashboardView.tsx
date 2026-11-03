import React from 'react';
import {
  Bot,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  Brain,
  Send,
  ArrowRight,
  ShieldAlert,
  Flame,
  Activity,
  Zap,
} from 'lucide-react';
import { NavigationTab } from '../types.ts';
import { TaskItem, OrderItem, ApprovalItem, LogItem } from '../../backend/database/store.ts';

interface DashboardViewProps {
  onSelectTab: (tab: NavigationTab) => void;
  onSelectAgentForChat: (agentId: string) => void;
  tasks: TaskItem[];
  orders: OrderItem[];
  approvals: ApprovalItem[];
  logs: LogItem[];
  onDecideApproval: (id: string, decision: 'approved' | 'rejected') => Promise<void>;
  onOpenTelegramSim: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTab,
  onSelectAgentForChat,
  tasks,
  orders,
  approvals,
  logs,
  onDecideApproval,
  onOpenTelegramSim,
}) => {
  const pendingApprovals = approvals.filter((a) => a.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white p-6 sm:p-8 shadow-xl border border-zinc-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ISMAIL AI Kernel Online • Version 1.0.0
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Assalamu Alaikum, Ismail
            </h1>
            <p className="text-sm text-zinc-300 max-w-xl">
              Your personal multi-agent operating system is active. 12 specialist agents are ready to assist with your studies, Barakah Shop BD, Islamic verification, coding, and daily tasks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onSelectTab('chat')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-900/30"
            >
              <Zap className="w-4 h-4" />
              <span>Launch AI Chat</span>
            </button>

            <button
              onClick={onOpenTelegramSim}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-700 transition-all"
            >
              <Send className="w-4 h-4 text-sky-400" />
              <span>Telegram Bot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Human-in-the-Loop Security Approvals Alert (if any pending) */}
      {pendingApprovals.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-pulse" />
              <span>
                Human-in-the-Loop: {pendingApprovals.length} Critical Action(s) Require Your Approval
              </span>
            </div>
            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
              Security Protocol Enforced
            </span>
          </div>

          <div className="space-y-2">
            {pendingApprovals.map((appr) => (
              <div
                key={appr.id}
                className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-amber-300/60 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
                    {appr.agentName}
                  </span>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{appr.title}</h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{appr.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDecideApproval(appr.id, 'approved')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => onDecideApproval(appr.id, 'rejected')}
                    className="px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onSelectTab('agents')}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-emerald-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Agents</span>
            <Bot className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-2">12 / 12</div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">All Online & Ready</span>
        </div>

        <div
          onClick={() => onSelectTab('tasks')}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-emerald-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Daily Tasks</span>
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-2">
            {completedTasks} / {tasks.length}
          </div>
          <span className="text-xs text-zinc-500">Completed today</span>
        </div>

        <div
          onClick={() => onSelectTab('business')}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-emerald-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Barakah Shop</span>
            <ShoppingBag className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-2">
            ৳{totalSales.toLocaleString()}
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Total sales recorded</span>
        </div>

        <div
          onClick={() => onSelectTab('memory')}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-emerald-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Memory Bank</span>
            <Brain className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-2">Tri-Tier</div>
          <span className="text-xs text-zinc-500">Short, Long & Knowledge</span>
        </div>
      </div>

      {/* Quick Launchpad to Top Specialist Agents */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          Fast Access Specialist Agents
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: 'agent-01-study',
              name: 'Study Agent',
              emoji: '📚',
              role: 'Academics & Lecture Notes',
              color: 'from-blue-500/10 to-indigo-500/10 border-blue-200 dark:border-blue-900',
            },
            {
              id: 'agent-03-business',
              name: 'Business Agent',
              emoji: '🛍️',
              role: 'Barakah Shop BD & Orders',
              color: 'from-amber-500/10 to-orange-500/10 border-amber-200 dark:border-amber-900',
            },
            {
              id: 'agent-05-islamic',
              name: 'Islamic Research',
              emoji: '🕌',
              role: 'Verified Quran & Hadith',
              color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-900',
            },
            {
              id: 'agent-10-coding',
              name: 'Coding Agent',
              emoji: '💻',
              role: 'TypeScript, React & GitHub',
              color: 'from-cyan-500/10 to-blue-500/10 border-cyan-200 dark:border-cyan-900',
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectAgentForChat(item.id)}
              className={`p-4 rounded-2xl border bg-gradient-to-br ${item.color} text-left flex items-center justify-between group hover:shadow-md transition-all`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{item.name}</h4>
                  <p className="text-[11px] text-zinc-500">{item.role}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
            </button>
          ))}
        </div>
      </div>

      {/* Activity Logs Audit Stream */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Live Activity & Audit Stream
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500">Autonomous & manual actions</span>
        </div>

        <div className="space-y-2">
          {logs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex items-start justify-between text-xs"
            >
              <div>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{log.actor}:</span>{' '}
                <span className="text-zinc-600 dark:text-zinc-300">{log.details}</span>
              </div>
              <span className="text-[10px] text-zinc-400 shrink-0 ml-3">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
