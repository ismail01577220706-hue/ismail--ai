import React from 'react';
import { BarChart3, TrendingUp, Cpu, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { TaskItem, OrderItem } from '../../backend/database/store.ts';

interface ReportsViewProps {
  tasks: TaskItem[];
  orders: OrderItem[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ tasks, orders }) => {
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalProfit = orders.reduce((sum, o) => sum + o.profit, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-500" />
          Analytics & Intelligence Reports (Agent 11)
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Executive performance summary, Gemini token metrics, task efficiency, and business returns.
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Productivity Rate
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
            {completionRate}%
          </div>
          <p className="text-xs text-zinc-500">
            {completed} of {tasks.length} daily goals accomplished
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Barakah Shop Profit Margin
            </span>
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
            {totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0}%
          </div>
          <p className="text-xs text-zinc-500">
            ৳{totalProfit.toLocaleString()} net profit on ৳{totalRevenue.toLocaleString()} volume
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              AI Latency & Health
            </span>
            <Cpu className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
            ~340ms
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Google Gemini 3.8 Flash • Sub-second
          </p>
        </div>
      </div>

      {/* Agent Performance Distribution */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
          Agent Workload Distribution
        </h3>
        <div className="space-y-3">
          {[
            { name: 'Agent 06: Personal Manager', pct: 85, color: 'bg-emerald-500' },
            { name: 'Agent 03: Business Agent (Barakah Shop)', pct: 70, color: 'bg-amber-500' },
            { name: 'Agent 05: Islamic Research Agent', pct: 60, color: 'bg-teal-500' },
            { name: 'Agent 01: Study Agent', pct: 55, color: 'bg-blue-500' },
            { name: 'Agent 02: Language Learning Agent', pct: 40, color: 'bg-purple-500' },
            { name: 'Agent 10: Coding Agent', pct: 35, color: 'bg-cyan-500' },
          ].map((bar, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-zinc-700 dark:text-zinc-300">{bar.name}</span>
                <span className="text-zinc-500">{bar.pct}% Activity index</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${bar.color}`}
                  style={{ width: `${bar.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
