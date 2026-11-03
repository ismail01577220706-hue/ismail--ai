import React, { useState, useEffect } from 'react';
import { Navbar } from './frontend/components/Navbar.tsx';
import { DashboardView } from './frontend/components/DashboardView.tsx';
import { ChatView } from './frontend/components/ChatView.tsx';
import { AgentsView } from './frontend/components/AgentsView.tsx';
import { TasksView } from './frontend/components/TasksView.tsx';
import { MemoryView } from './frontend/components/MemoryView.tsx';
import { BusinessView } from './frontend/components/BusinessView.tsx';
import { FileManagerView } from './frontend/components/FileManagerView.tsx';
import { ReportsView } from './frontend/components/ReportsView.tsx';
import { SettingsView } from './frontend/components/SettingsView.tsx';
import { TelegramSimulatorModal } from './frontend/components/TelegramSimulatorModal.tsx';
import { NavigationTab } from './frontend/types.ts';
import { AgentDefinition } from './backend/agents/types.ts';
import {
  TaskItem,
  MemoryItem,
  ProductItem,
  OrderItem,
  CustomerItem,
  ApprovalItem,
  LogItem,
} from './backend/database/store.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(undefined);
  const [isTelegramSimOpen, setIsTelegramSimOpen] = useState(false);

  // Core Data Stores
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);

  // Apply dark mode class to html document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Initial Data Fetching
  const refreshAllData = async () => {
    try {
      const [agRes, tRes, mRes, pRes, oRes, cRes, apRes, lRes] = await Promise.all([
        fetch('/api/agents').then((r) => r.json()),
        fetch('/api/tasks').then((r) => r.json()),
        fetch('/api/memories').then((r) => r.json()),
        fetch('/api/business/products').then((r) => r.json()),
        fetch('/api/business/orders').then((r) => r.json()),
        fetch('/api/business/customers').then((r) => r.json()),
        fetch('/api/approvals').then((r) => r.json()),
        fetch('/api/logs').then((r) => r.json()),
      ]);

      if (agRes?.agents) setAgents(agRes.agents);
      if (tRes?.tasks) setTasks(tRes.tasks);
      if (mRes?.memories) setMemories(mRes.memories);
      if (pRes?.products) setProducts(pRes.products);
      if (oRes?.orders) setOrders(oRes.orders);
      if (cRes?.customers) setCustomers(cRes.customers);
      if (apRes?.approvals) setApprovals(apRes.approvals);
      if (lRes?.logs) setLogs(lRes.logs);
    } catch (err) {
      console.warn('[Initial Load Error - fallback active]:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Actions
  const handleAddTask = async (task: Omit<TaskItem, 'id' | 'createdAt'>) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (res.ok) {
      const data = await res.json();
      setTasks((prev) => [data.task, ...prev]);
    }
  };

  const handleUpdateTaskStatus = async (id: string, status: TaskItem['status']) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
    }
  };

  const handleDeleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddMemory = async (mem: Omit<MemoryItem, 'id' | 'createdAt'>) => {
    const res = await fetch('/api/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mem),
    });
    if (res.ok) {
      const data = await res.json();
      setMemories((prev) => [data.memory, ...prev]);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    await fetch(`/api/memories/${id}`, { method: 'DELETE' });
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddProduct = async (prod: Omit<ProductItem, 'id'>) => {
    const res = await fetch('/api/business/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prod),
    });
    if (res.ok) {
      const data = await res.json();
      setProducts((prev) => [data.product, ...prev]);
    }
  };

  const handleDecideApproval = async (id: string, decision: 'approved' | 'rejected') => {
    const res = await fetch(`/api/approvals/${id}/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    });
    if (res.ok) {
      const data = await res.json();
      setApprovals((prev) =>
        prev.map((a) => (a.id === id ? data.approval : a))
      );
      // Refresh orders in case an order was approved
      fetch('/api/business/orders')
        .then((r) => r.json())
        .then((d) => d.orders && setOrders(d.orders));
    }
  };

  const handleSelectAgentForChat = (agentId: string) => {
    setSelectedAgentId(agentId);
    setCurrentTab('chat');
  };

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors antialiased selection:bg-emerald-500/20 selection:text-emerald-500">
      {/* Navbar & App Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        pendingApprovalsCount={pendingApprovalsCount}
        onOpenTelegramSim={() => setIsTelegramSimOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-24 lg:pb-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            onSelectTab={setCurrentTab}
            onSelectAgentForChat={handleSelectAgentForChat}
            tasks={tasks}
            orders={orders}
            approvals={approvals}
            logs={logs}
            onDecideApproval={handleDecideApproval}
            onOpenTelegramSim={() => setIsTelegramSimOpen(true)}
          />
        )}

        {currentTab === 'chat' && (
          <ChatView
            agents={agents}
            selectedAgentId={selectedAgentId}
            onSelectAgent={setSelectedAgentId}
            onDecideApproval={handleDecideApproval}
          />
        )}

        {currentTab === 'agents' && (
          <AgentsView
            agents={agents}
            onSelectAgentForChat={handleSelectAgentForChat}
          />
        )}

        {currentTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {currentTab === 'memory' && (
          <MemoryView
            memories={memories}
            onAddMemory={handleAddMemory}
            onDeleteMemory={handleDeleteMemory}
          />
        )}

        {currentTab === 'business' && (
          <BusinessView
            products={products}
            orders={orders}
            customers={customers}
            onAddProduct={handleAddProduct}
            onDecideApproval={handleDecideApproval}
          />
        )}

        {currentTab === 'files' && <FileManagerView />}

        {currentTab === 'reports' && (
          <ReportsView tasks={tasks} orders={orders} />
        )}

        {currentTab === 'settings' && (
          <SettingsView onOpenTelegramSim={() => setIsTelegramSimOpen(true)} />
        )}
      </main>

      {/* Interactive Telegram Bot Simulator */}
      <TelegramSimulatorModal
        isOpen={isTelegramSimOpen}
        onClose={() => setIsTelegramSimOpen(false)}
      />
    </div>
  );
}
