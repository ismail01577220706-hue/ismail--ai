import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { webhookCallback } from 'grammy';
import { env, hasGeminiKey, hasTelegramToken, hasTelegramOwner, hasSupabase } from './src/backend/config/env.ts';
import { bot, setupTelegramBot, simulateTelegramMessage } from './src/backend/telegram/bot.ts';
import { orchestrator } from './src/backend/core/orchestrator.ts';
import { getAllAgents, getAgent } from './src/backend/agents/registry.ts';
import { dbStore } from './src/backend/database/store.ts';
import { callGemini } from './src/backend/core/gemini.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Initialize Telegram bot commands
setupTelegramBot();

app.use(express.json());

// Telegram Webhook Endpoint
if (bot) {
  app.use('/api/telegram/webhook', webhookCallback(bot, 'express'));
  console.log('[Telegram Bot] Webhook listener mounted at /api/telegram/webhook');
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// System Health & Diagnostics
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    version: '1.0.0',
    systemName: 'ISMAIL AI',
    timestamp: new Date().toISOString(),
    services: {
      gemini: {
        configured: hasGeminiKey,
        model: 'gemini-3.8-flash',
        status: hasGeminiKey ? 'healthy' : 'missing_api_key',
      },
      telegram: {
        configured: hasTelegramToken,
        hasOwner: hasTelegramOwner,
        ownerId: env.TELEGRAM_OWNER_ID ? `${env.TELEGRAM_OWNER_ID.slice(0, 3)}***` : 'unconfigured',
        mode: hasTelegramToken ? 'active' : 'simulation_only',
      },
      database: {
        configured: hasSupabase,
        provider: hasSupabase ? 'Supabase PostgreSQL' : 'Local Resilient Cache',
        status: 'connected',
      },
      agents: {
        total: 12,
        active: 12,
      },
    },
  });
});

// Specialist Agents
app.get('/api/agents', (req, res) => {
  res.json({ agents: getAllAgents() });
});

// Central AI Chat Dispatcher
app.post('/api/chat', async (req, res) => {
  try {
    const { message, explicitAgentId, conversationHistory } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message content is required.' });
      return;
    }

    const result = await orchestrator.process({
      message,
      explicitAgentId,
      channel: 'dashboard',
      conversationHistory,
    });

    res.json(result);
  } catch (err: unknown) {
    console.error('[API Chat Error]:', err);
    res.status(500).json({ error: 'Failed to process agent request.' });
  }
});

// Memories
app.get('/api/memories', async (req, res) => {
  const type = req.query.type as string | undefined;
  const memories = await dbStore.getMemories(type);
  res.json({ memories });
});

app.post('/api/memories', async (req, res) => {
  const { title, content, type, category, tags, importance } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required.' });
    return;
  }
  const memory = await dbStore.addMemory({
    title,
    content,
    type: type || 'long_term',
    category: category || 'general',
    tags: Array.isArray(tags) ? tags : [],
    importance: Number(importance) || 3,
  });
  res.status(201).json({ memory });
});

app.delete('/api/memories/:id', async (req, res) => {
  const success = await dbStore.deleteMemory(req.params.id);
  res.json({ success });
});

// Tasks & Habits
app.get('/api/tasks', async (req, res) => {
  const tasks = await dbStore.getTasks();
  res.json({ tasks });
});

app.post('/api/tasks', async (req, res) => {
  const { title, description, priority, category, isHabit, habitFrequency } = req.body;
  if (!title) {
    res.status(400).json({ error: 'Task title is required.' });
    return;
  }
  const task = await dbStore.addTask({
    title,
    description: description || '',
    priority: priority || 'medium',
    status: 'pending',
    category: category || 'personal',
    isHabit: Boolean(isHabit),
    habitFrequency: habitFrequency || (isHabit ? 'daily' : undefined),
    habitStreak: 0,
  });
  res.status(201).json({ task });
});

app.patch('/api/tasks/:id', async (req, res) => {
  const { status } = req.body;
  const task = await dbStore.updateTaskStatus(req.params.id, status);
  if (!task) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }
  res.json({ task });
});

app.delete('/api/tasks/:id', async (req, res) => {
  const success = await dbStore.deleteTask(req.params.id);
  res.json({ success });
});

// Barakah Shop BD (Business Agent)
app.get('/api/business/products', async (req, res) => {
  const products = await dbStore.getProducts();
  res.json({ products });
});

app.post('/api/business/products', async (req, res) => {
  const { sku, name, category, description, sellingPrice, costPrice, stockQuantity } = req.body;
  if (!name || !sku || !sellingPrice) {
    res.status(400).json({ error: 'Name, SKU, and Selling Price are required.' });
    return;
  }
  const product = await dbStore.addProduct({
    sku,
    name,
    category: category || 'General',
    description: description || '',
    sellingPrice: Number(sellingPrice),
    costPrice: Number(costPrice) || 0,
    stockQuantity: Number(stockQuantity) || 0,
    isActive: true,
  });
  res.status(201).json({ product });
});

app.get('/api/business/orders', async (req, res) => {
  const orders = await dbStore.getOrders();
  res.json({ orders });
});

app.post('/api/business/orders', async (req, res) => {
  const { customerName, customerPhone, items, totalAmount, profit, requiresApproval } = req.body;
  const orderNumber = `BSB-${Math.floor(1000 + Math.random() * 9000)}`;
  const order = await dbStore.createOrder({
    orderNumber,
    customerName: customerName || 'Walk-in Customer',
    customerPhone: customerPhone || 'N/A',
    items: items || [],
    totalAmount: Number(totalAmount) || 0,
    profit: Number(profit) || 0,
    status: requiresApproval ? 'pending_approval' : 'confirmed',
    requiresApproval: Boolean(requiresApproval),
  });
  res.status(201).json({ order });
});

app.get('/api/business/customers', async (req, res) => {
  const customers = await dbStore.getCustomers();
  res.json({ customers });
});

// AI Copywriting for Barakah Shop BD
app.post('/api/business/generate-post', async (req, res) => {
  try {
    const { productName, keyFeatures } = req.body;
    const agent = getAgent('agent-03-business');

    const result = await callGemini({
      systemInstruction: agent.systemInstruction,
      prompt: `Generate an engaging, honest, Islamic-ethical Facebook sales post for Barakah Shop BD about: "${productName}". Key details: ${keyFeatures}. Include attention-grabbing headline in Bengali, authentic benefits, clear pricing invitation, and zero-exaggeration promise.`,
    });

    res.json({ post: result.text });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate post copy.' });
  }
});

// Approvals Queue
app.get('/api/approvals', async (req, res) => {
  const approvals = await dbStore.getApprovals();
  res.json({ approvals });
});

app.post('/api/approvals/:id/decide', async (req, res) => {
  const { decision, decidedBy } = req.body;
  if (!decision || (decision !== 'approved' && decision !== 'rejected')) {
    res.status(400).json({ error: 'Decision must be approved or rejected.' });
    return;
  }
  const updated = await dbStore.decideApproval(req.params.id, decision, decidedBy || 'Ismail (Web Dashboard)');
  if (!updated) {
    res.status(404).json({ error: 'Approval request not found.' });
    return;
  }
  res.json({ approval: updated });
});

// Activity Logs
app.get('/api/logs', async (req, res) => {
  const logs = await dbStore.getLogs();
  res.json({ logs });
});

// Telegram Simulation & Status
app.get('/api/telegram/status', (req, res) => {
  res.json({
    isTokenSet: hasTelegramToken,
    isOwnerSet: hasTelegramOwner,
    botUsername: hasTelegramToken ? '@IsmailAIBot' : 'Simulator Mode',
    webhookUrl: `${env.APP_URL}/api/telegram/webhook`,
  });
});

app.post('/api/telegram/simulate', async (req, res) => {
  try {
    const { text, explicitAgentId, userId } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text prompt or command is required.' });
      return;
    }
    const result = await simulateTelegramMessage({ text, explicitAgentId, userId });
    res.json(result);
  } catch (err: unknown) {
    console.error('[Telegram Sim Error]:', err);
    res.status(500).json({ error: 'Simulation failed.' });
  }
});

// -------------------------------------------------------------
// VITE DEV SERVER / STATIC PRODUCTION SERVING
// -------------------------------------------------------------
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Server] Vite middleware mounted in development mode.');
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ISMAIL AI (v1.0.0) server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
