import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  CheckSquare,
  Brain,
  ShoppingBag,
  FolderOpen,
  BarChart3,
  Settings,
  Sun,
  Moon,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { NavigationTab } from '../types.ts';

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  pendingApprovalsCount: number;
  onOpenTelegramSim: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  isDark,
  onToggleTheme,
  pendingApprovalsCount,
  onOpenTelegramSim,
}) => {
  const navItems: Array<{ tab: NavigationTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { tab: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { tab: 'chat', label: 'AI Chat', icon: <MessageSquare className="w-5 h-5" /> },
    { tab: 'agents', label: 'Agents', icon: <Bot className="w-5 h-5" /> },
    { tab: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-5 h-5" /> },
    { tab: 'memory', label: 'Memory', icon: <Brain className="w-5 h-5" /> },
    { tab: 'business', label: 'Barakah Shop', icon: <ShoppingBag className="w-5 h-5" /> },
    { tab: 'files', label: 'Files', icon: <FolderOpen className="w-5 h-5" /> },
    { tab: 'reports', label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
    {
      tab: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
  ];

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-sm shadow-emerald-500/20">
              IS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-zinc-900 dark:text-zinc-50">
                  ISMAIL AI
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  v1.0.0
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
                Multi-Agent Personal Assistant • Powered by Gemini 3.8 Flash & Supabase
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => onSelectTab(item.tab)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                    active
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenTelegramSim}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors"
              title="Test Telegram Bot commands (/start, /study, /tasks, etc.)"
            >
              <Send className="w-3.5 h-3.5 text-sky-500" />
              <span className="hidden sm:inline">Telegram Bot</span>
            </button>

            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Thumb reachable on Android) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 px-2 py-1.5 transition-colors">
        <div className="flex items-center justify-around">
          {navItems.slice(0, 5).map((item) => {
            const active = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onSelectTab(item.tab)}
                className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors relative ${
                  active ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {item.icon}
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </button>
            );
          })}
          {/* More Drawer or Direct Switcher */}
          <button
            onClick={() => onSelectTab(currentTab === 'business' ? 'settings' : 'business')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors relative ${
              currentTab === 'business' || currentTab === 'files' || currentTab === 'reports' || currentTab === 'settings'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Barakah</span>
          </button>
        </div>
      </div>
    </>
  );
};
