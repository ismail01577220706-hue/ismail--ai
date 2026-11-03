import React, { useState } from 'react';
import { TaskItem } from '../../backend/database/store.ts';
import { CheckCircle2, Circle, Clock, Flame, Plus, Trash2, Calendar, Tag } from 'lucide-react';

interface TasksViewProps {
  tasks: TaskItem[];
  onAddTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateStatus: (id: string, status: TaskItem['status']) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onAddTask,
  onUpdateStatus,
  onDeleteTask,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'habits'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<TaskItem['priority']>('medium');
  const [newCategory, setNewCategory] = useState<TaskItem['category']>('personal');
  const [isHabit, setIsHabit] = useState(false);

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'habits') return t.isHabit;
    if (filter === 'pending') return t.status !== 'completed';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await onAddTask({
      title: newTitle.trim(),
      description: newDesc.trim(),
      priority: newPriority,
      status: 'pending',
      category: newCategory,
      isHabit,
      habitFrequency: isHabit ? 'daily' : undefined,
      habitStreak: 0,
    });

    setNewTitle('');
    setNewDesc('');
    setIsHabit(false);
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <span>📅</span> Daily Tasks & Habit Streaks (Agent 06)
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Personal Manager Agent coordinates daily priorities, habit formation, and evening reflection.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task or Habit</span>
        </button>
      </div>

      {/* Habit Spotlight Streak Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {tasks
          .filter((t) => t.isHabit)
          .map((habit) => (
            <div
              key={habit.id}
              className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-300 dark:border-amber-800/60 rounded-xl p-3.5 flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {habit.habitFrequency || 'Daily'} Habit
                </span>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 mt-0.5">
                  {habit.title}
                </h4>
              </div>
              <div className="text-right pl-2">
                <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                  {habit.habitStreak}
                </span>
                <span className="text-[10px] block text-zinc-500">days</span>
              </div>
            </div>
          ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {(['all', 'pending', 'completed', 'habits'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              filter === tab
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 dark:text-zinc-400 text-sm">
            No tasks found in this view.
          </div>
        ) : (
          filteredTasks.map((t) => {
            const isDone = t.status === 'completed';
            return (
              <div
                key={t.id}
                className={`flex items-start justify-between gap-3 p-4 rounded-xl border transition-all ${
                  isDone
                    ? 'bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 opacity-75'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => onUpdateStatus(t.id, isDone ? 'pending' : 'completed')}
                    className="mt-0.5 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-semibold ${
                          isDone
                            ? 'line-through text-zinc-400 dark:text-zinc-500'
                            : 'text-zinc-900 dark:text-zinc-100'
                        }`}
                      >
                        {t.title}
                      </span>

                      {/* Priority Tag */}
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          t.priority === 'urgent'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : t.priority === 'high'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}
                      >
                        {t.priority}
                      </span>

                      {/* Category Tag */}
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        {t.category}
                      </span>
                    </div>

                    {t.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDeleteTask(t.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                Create New Task or Habit
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Recite Surah Al-Kahf / Review Barakah Shop stock"
                  className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Details, link, or instructions..."
                  className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-2 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-2 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="personal">Personal</option>
                    <option value="study">Study</option>
                    <option value="business">Business</option>
                    <option value="islamic">Islamic</option>
                    <option value="coding">Coding</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isHabit"
                  checked={isHabit}
                  onChange={(e) => setIsHabit(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isHabit" className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                  Track as recurring Daily Habit (with streak counter)
                </label>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
