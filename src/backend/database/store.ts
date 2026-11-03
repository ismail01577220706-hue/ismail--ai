import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env, hasSupabase } from '../config/env.ts';

export interface MemoryItem {
  id: string;
  type: 'short_term' | 'long_term' | 'knowledge' | 'preference';
  category: string;
  title: string;
  content: string;
  tags: string[];
  importance: number;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  category: 'personal' | 'study' | 'business' | 'islamic' | 'coding' | 'automation';
  assignedAgentId?: string;
  dueDate?: string;
  isHabit: boolean;
  habitFrequency?: 'daily' | 'weekly' | 'custom';
  habitStreak: number;
  createdAt: string;
}

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  sellingPrice: number;
  costPrice: number;
  stockQuantity: number;
  isActive: boolean;
  facebookPostDraft?: string;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: Array<{ productName: string; quantity: number; unitPrice: number }>;
  totalAmount: number;
  profit: number;
  status: 'draft' | 'pending_approval' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  requiresApproval: boolean;
  createdAt: string;
}

export interface CustomerItem {
  id: string;
  fullName: string;
  phone: string;
  district: string;
  totalOrders: number;
  totalSpent: number;
}

export interface ApprovalItem {
  id: string;
  agentId: string;
  agentName: string;
  actionType: 'send_email' | 'publish_post' | 'confirm_order' | 'make_payment' | 'delete_data' | 'execute_code' | 'external_api';
  title: string;
  description: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected';
  decidedBy?: string;
  createdAt: string;
}

export interface LogItem {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  details: string;
  timestamp: string;
}

// Initial state data for development and instant out-of-the-box readiness
const initialMemories: MemoryItem[] = [
  {
    id: 'mem-01',
    type: 'long_term',
    category: 'user_profile',
    title: 'Owner Identity & Vision',
    content: 'Owner is Ismail. Dedicated student, entrepreneur running Barakah Shop BD in Bangladesh, tech enthusiast, committed to Islamic values, disciplined study, and continuous personal growth.',
    tags: ['profile', 'identity', 'owner'],
    importance: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem-02',
    type: 'long_term',
    category: 'business_rules',
    title: 'Barakah Shop BD Core Principles',
    content: 'Halāl business ethics strictly enforced: truthful product descriptions, no deceptive discounts, no music in promotional media, prompt customer service, no order confirmed without Ismail\'s explicit verification.',
    tags: ['barakah_shop', 'business', 'ethics'],
    importance: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem-03',
    type: 'knowledge',
    category: 'academics',
    title: 'Spaced Repetition Study Protocol',
    content: 'Active recall + Leitner intervals: Day 1, Day 3, Day 7, Day 14, Day 30. Notes structured in Bangla and English with key Arabic terminology.',
    tags: ['study', 'methodology'],
    importance: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem-04',
    type: 'knowledge',
    category: 'deen',
    title: 'Hadith Reference Guidelines',
    content: 'Every Hadith quotation must include collection name (Bukhari, Muslim, Tirmidhi, etc.) and narrator verification status. Unverified chains must be explicitly disclosed.',
    tags: ['islamic', 'standards', 'hadith'],
    importance: 5,
    createdAt: new Date().toISOString(),
  },
];

const initialTasks: TaskItem[] = [
  {
    id: 'task-01',
    title: 'Fajr & Morning Quran recitation (1 Juz)',
    description: 'Start the day with remembrance and recitation before studies.',
    priority: 'urgent',
    status: 'completed',
    category: 'islamic',
    isHabit: true,
    habitFrequency: 'daily',
    habitStreak: 19,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-02',
    title: 'Review Barakah Shop BD inventory & pending orders',
    description: 'Verify new orders, calculate daily profit, review customer messages.',
    priority: 'high',
    status: 'in_progress',
    category: 'business',
    assignedAgentId: 'agent-03-business',
    isHabit: true,
    habitFrequency: 'daily',
    habitStreak: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-03',
    title: 'Arabic Grammar (Nahw) Session: Jumla Ismiyyah & Fi\'liyyah',
    description: 'Complete 30 minutes of grammar drill with Language Learning Agent.',
    priority: 'high',
    status: 'pending',
    category: 'study',
    assignedAgentId: 'agent-02-language',
    isHabit: false,
    habitStreak: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-04',
    title: 'Draft weekly educational Facebook post for Barakah Shop',
    description: 'Create an engaging post regarding benefits of Organic Kalijira Oil without background music.',
    priority: 'medium',
    status: 'pending',
    category: 'business',
    assignedAgentId: 'agent-04-content',
    isHabit: false,
    habitStreak: 0,
    createdAt: new Date().toISOString(),
  },
];

const initialProducts: ProductItem[] = [
  {
    id: 'prod-01',
    sku: 'BSBD-AJW-01',
    name: 'Premium Madinah Ajwa Dates (500g)',
    category: 'Dates & Food',
    description: 'Authentic Ajwa dates directly sourced from Al-Madinah Al-Munawwarah. Soft, nutritious, sunnah food.',
    sellingPrice: 1250,
    costPrice: 850,
    stockQuantity: 45,
    isActive: true,
    facebookPostDraft: 'মদিনার খাঁটি আজওয়া খেজুর — রাসুলুল্লাহ (ﷺ) এর নির্দেশিত বরকতময় খাদ্য। বারাকাহ শপ বিডিতে পাচ্ছেন প্রিমিয়াম গ্রেডের নিশ্চয়তা। ইনবক্সে অর্ডার করুন!',
  },
  {
    id: 'prod-02',
    sku: 'BSBD-KLJ-02',
    name: 'Organic Cold-Pressed Kalijira Oil (250ml)',
    category: 'Health & Sunnah',
    description: '100% pure cold-pressed black seed oil. Natural immunity booster with no chemical additives.',
    sellingPrice: 480,
    costPrice: 290,
    stockQuantity: 80,
    isActive: true,
    facebookPostDraft: 'কালোজিরা সব রোগের মহৌষধ (মৃত্যু ব্যতীত)। বারাকাহ শপের কোল্ড-প্রেসড অর্গানিক কালোজিরা তেল আপনার পরিবারের সুস্বাস্থ্যের বিশ্বস্ত সঙ্গী।',
  },
  {
    id: 'prod-03',
    sku: 'BSBD-HNY-03',
    name: 'Raw Sundarbans Floral Honey (500g)',
    category: 'Health & Sunnah',
    description: 'Natural unheated raw honey harvested from natural hives in the Sundarbans mangrove forest.',
    sellingPrice: 650,
    costPrice: 420,
    stockQuantity: 32,
    isActive: true,
    facebookPostDraft: 'সুন্দরবনের খাঁটি মধু — কোনো ভেজাল নেই, কোনো কৃত্রিম চিনি নেই। পরীক্ষা করে নেওয়ার সুযোগ।',
  },
  {
    id: 'prod-04',
    sku: 'BSBD-ATR-04',
    name: 'Attar Al-Kaaba Concentrated Oil (12ml)',
    category: 'Fragrance',
    description: 'Non-alcoholic traditional musk and oud attar with long-lasting scent trail.',
    sellingPrice: 850,
    costPrice: 480,
    stockQuantity: 24,
    isActive: true,
  },
];

const initialOrders: OrderItem[] = [
  {
    id: 'ord-01',
    orderNumber: 'BSB-1081',
    customerName: 'Rafiqul Islam',
    customerPhone: '01711223344',
    items: [{ productName: 'Premium Madinah Ajwa Dates (500g)', quantity: 2, unitPrice: 1250 }],
    totalAmount: 2500,
    profit: 800,
    status: 'delivered',
    requiresApproval: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'ord-02',
    orderNumber: 'BSB-1082',
    customerName: 'Mahmudul Hasan',
    customerPhone: '01812345678',
    items: [
      { productName: 'Organic Cold-Pressed Kalijira Oil (250ml)', quantity: 1, unitPrice: 480 },
      { productName: 'Raw Sundarbans Floral Honey (500g)', quantity: 1, unitPrice: 650 },
    ],
    totalAmount: 1130,
    profit: 420,
    status: 'pending_approval',
    requiresApproval: true,
    createdAt: new Date().toISOString(),
  },
];

const initialCustomers: CustomerItem[] = [
  {
    id: 'cust-01',
    fullName: 'Rafiqul Islam',
    phone: '01711223344',
    district: 'Dhaka (Mirpur)',
    totalOrders: 3,
    totalSpent: 6200,
  },
  {
    id: 'cust-02',
    fullName: 'Mahmudul Hasan',
    phone: '01812345678',
    district: 'Chittagong (Agrabad)',
    totalOrders: 1,
    totalSpent: 1130,
  },
  {
    id: 'cust-03',
    fullName: 'Tanvir Ahmed',
    phone: '01998877665',
    district: 'Sylhet (Zindabazar)',
    totalOrders: 2,
    totalSpent: 3400,
  },
];

const initialApprovals: ApprovalItem[] = [
  {
    id: 'appr-01',
    agentId: 'agent-03-business',
    agentName: 'Business Agent (Barakah Shop BD)',
    actionType: 'confirm_order',
    title: 'Customer Order Confirmation: Order #BSB-1082',
    description: 'Mahmudul Hasan (01812345678) placed order for Kalijira Oil + Honey (Total: ৳1,130). Awaiting Ismail\'s authorization before invoice generation.',
    payload: { orderNumber: 'BSB-1082', totalAmount: 1130, customer: 'Mahmudul Hasan' },
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'appr-02',
    agentId: 'agent-04-content',
    agentName: 'Content Creation Agent',
    actionType: 'publish_post',
    title: 'Social Media Post: Organic Kalijira Oil Sunnah Benefits',
    description: 'Ready-to-post Facebook caption prepared with zero-music imagery. Confirm before publishing to official Facebook page.',
    payload: { platform: 'Facebook', postLengthWords: 85 },
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
];

const initialLogs: LogItem[] = [
  {
    id: 'log-01',
    actor: 'ISMAIL AI Orchestrator',
    action: 'SYSTEM_BOOT',
    entityType: 'kernel',
    details: 'Multi-Agent Personal AI Assistant initialized with 12 specialist agents.',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'log-02',
    actor: 'Agent 06 (Personal Manager)',
    action: 'TASK_CHECK',
    entityType: 'task',
    details: 'Completed morning Fajr & Quran recitation habit verification.',
    timestamp: new Date().toISOString(),
  },
];

export class SystemStore {
  private memories: MemoryItem[] = [...initialMemories];
  private tasks: TaskItem[] = [...initialTasks];
  private products: ProductItem[] = [...initialProducts];
  private orders: OrderItem[] = [...initialOrders];
  private customers: CustomerItem[] = [...initialCustomers];
  private approvals: ApprovalItem[] = [...initialApprovals];
  private logs: LogItem[] = [...initialLogs];
  private supabase: SupabaseClient | null = null;

  constructor() {
    if (hasSupabase) {
      try {
        const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
        this.supabase = createClient(env.SUPABASE_URL, key, {
          auth: { persistSession: false },
        });
        console.log('[Database] Supabase client initialized with URL:', env.SUPABASE_URL);
      } catch (err) {
        console.error('[Database] Supabase init error:', err);
      }
    }
  }

  getSupabaseClient(): SupabaseClient | null {
    return this.supabase;
  }

  // MEMORIES
  async getMemories(type?: string): Promise<MemoryItem[]> {
    if (type) {
      return this.memories.filter((m) => m.type === type);
    }
    return this.memories;
  }

  async searchMemories(query: string): Promise<MemoryItem[]> {
    const q = query.toLowerCase();
    return this.memories.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  async addMemory(memory: Omit<MemoryItem, 'id' | 'createdAt'>): Promise<MemoryItem> {
    const newItem: MemoryItem = {
      ...memory,
      id: `mem-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    this.memories.unshift(newItem);
    this.addLog('ISMAIL AI Memory', 'ADD_MEMORY', 'memory', `Added memory: ${newItem.title}`);
    return newItem;
  }

  async deleteMemory(id: string): Promise<boolean> {
    const initialLen = this.memories.length;
    this.memories = this.memories.filter((m) => m.id !== id);
    return this.memories.length < initialLen;
  }

  // TASKS
  async getTasks(): Promise<TaskItem[]> {
    return this.tasks;
  }

  async addTask(task: Omit<TaskItem, 'id' | 'createdAt'>): Promise<TaskItem> {
    const newTask: TaskItem = {
      ...task,
      id: `task-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    this.tasks.unshift(newTask);
    this.addLog('Agent 06 (Personal Manager)', 'CREATE_TASK', 'task', `Created task: ${newTask.title}`);
    return newTask;
  }

  async updateTaskStatus(id: string, status: TaskItem['status']): Promise<TaskItem | null> {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return null;
    task.status = status;
    if (status === 'completed' && task.isHabit) {
      task.habitStreak += 1;
    }
    this.addLog('Agent 06 (Personal Manager)', 'UPDATE_TASK', 'task', `Task "${task.title}" marked as ${status}`);
    return task;
  }

  async deleteTask(id: string): Promise<boolean> {
    const len = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.id !== id);
    return this.tasks.length < len;
  }

  // PRODUCTS
  async getProducts(): Promise<ProductItem[]> {
    return this.products;
  }

  async addProduct(product: Omit<ProductItem, 'id'>): Promise<ProductItem> {
    const newProd: ProductItem = {
      ...product,
      id: `prod-${Date.now().toString(36)}`,
    };
    this.products.unshift(newProd);
    this.addLog('Agent 03 (Business Agent)', 'ADD_PRODUCT', 'product', `Added product: ${newProd.name} (SKU: ${newProd.sku})`);
    return newProd;
  }

  // ORDERS
  async getOrders(): Promise<OrderItem[]> {
    return this.orders;
  }

  async createOrder(order: Omit<OrderItem, 'id' | 'createdAt'>): Promise<OrderItem> {
    const newOrder: OrderItem = {
      ...order,
      id: `ord-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    this.orders.unshift(newOrder);

    // If order requires approval, automatically insert into approval queue
    if (newOrder.requiresApproval) {
      this.addApproval({
        agentId: 'agent-03-business',
        agentName: 'Business Agent (Barakah Shop BD)',
        actionType: 'confirm_order',
        title: `Authorize Order #${newOrder.orderNumber}`,
        description: `Customer ${newOrder.customerName} (${newOrder.customerPhone}) placed order total ৳${newOrder.totalAmount}. Requires Ismail's approval.`,
        payload: { orderNumber: newOrder.orderNumber, total: newOrder.totalAmount },
      });
    }

    this.addLog('Agent 03 (Business Agent)', 'CREATE_ORDER', 'order', `Order #${newOrder.orderNumber} drafted (Requires Approval: ${newOrder.requiresApproval})`);
    return newOrder;
  }

  // CUSTOMERS
  async getCustomers(): Promise<CustomerItem[]> {
    return this.customers;
  }

  // APPROVALS
  async getApprovals(): Promise<ApprovalItem[]> {
    return this.approvals;
  }

  async addApproval(appr: Omit<ApprovalItem, 'id' | 'status' | 'createdAt'>): Promise<ApprovalItem> {
    const newAppr: ApprovalItem = {
      ...appr,
      id: `appr-${Date.now().toString(36)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.approvals.unshift(newAppr);
    this.addLog('Security Orchestrator', 'APPROVAL_REQUESTED', 'approval', `Approval queued: ${newAppr.title}`);
    return newAppr;
  }

  async decideApproval(id: string, decision: 'approved' | 'rejected', decidedBy = 'Ismail (Owner)'): Promise<ApprovalItem | null> {
    const item = this.approvals.find((a) => a.id === id);
    if (!item) return null;
    item.status = decision;
    item.decidedBy = decidedBy;

    // Apply side effect if approved
    if (decision === 'approved' && item.actionType === 'confirm_order') {
      const orderNumber = (item.payload?.orderNumber as string) || '';
      const order = this.orders.find((o) => o.orderNumber === orderNumber);
      if (order) {
        order.status = 'confirmed';
        order.requiresApproval = false;
      }
    }

    this.addLog('Security Orchestrator', `APPROVAL_${decision.toUpperCase()}`, 'approval', `Approval ${id} was ${decision} by ${decidedBy}`);
    return item;
  }

  // LOGS
  async getLogs(limit = 50): Promise<LogItem[]> {
    return this.logs.slice(0, limit);
  }

  addLog(actor: string, action: string, entityType: string, details: string) {
    this.logs.unshift({
      id: `log-${Date.now().toString(36)}`,
      actor,
      action,
      entityType,
      details,
      timestamp: new Date().toISOString(),
    });
    if (this.logs.length > 200) {
      this.logs.pop();
    }
  }
}

export const dbStore = new SystemStore();
