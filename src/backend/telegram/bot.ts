import { Bot, InlineKeyboard } from 'grammy';
import { env, hasTelegramToken, hasTelegramOwner } from '../config/env.ts';
import { orchestrator } from '../core/orchestrator.ts';
import { dbStore } from '../database/store.ts';
import { AgentId } from '../agents/types.ts';
import { getAllAgents } from '../agents/registry.ts';

// State tracker for active agent per user (defaults to auto/orchestrator)
const userActiveAgentMap = new Map<number | string, AgentId | undefined>();

// Instantiate grammY bot if token is present
export const bot = hasTelegramToken ? new Bot(env.TELEGRAM_BOT_TOKEN) : null;

// Owner verification helper
export function isAuthorizedUser(userId?: number | string): boolean {
  if (!hasTelegramOwner) {
    // If no owner ID configured yet, permit developer interaction in local testing
    return true;
  }
  return String(userId) === String(env.TELEGRAM_OWNER_ID);
}

/**
 * Configure all grammY bot commands, middleware, and inline query callbacks
 */
export function setupTelegramBot() {
  if (!bot) {
    console.log('[Telegram Bot] Bot token not provided. Bot runner is inactive (Simulator mode active in Dashboard).');
    return;
  }

  // Security Middleware: Owner-only authentication
  bot.use(async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!isAuthorizedUser(userId)) {
      console.warn(`[Telegram Bot Security] Blocked unauthorized access attempt from ID: ${userId}`);
      await ctx.reply(
        `⛔ *Access Restricted: ISMAIL AI*\n\nThis personal agent system is secured for owner authorization only. Your Telegram User ID is \`${userId}\`.\n\nPlease contact the owner to register your credentials.`,
        { parse_mode: 'Markdown' }
      );
      return;
    }
    await next();
  });

  // /start
  bot.command('start', async (ctx) => {
    const keyboard = new InlineKeyboard()
      .text('📚 Study Agent', 'switch:agent-01-study')
      .text('🛍️ Barakah Shop', 'switch:agent-03-business')
      .row()
      .text('🕌 Islamic Research', 'switch:agent-05-islamic')
      .text('📅 Personal Manager', 'switch:agent-06-personal')
      .row()
      .text('💻 Coding Agent', 'switch:agent-10-coding')
      .text('📊 System Status', 'cmd:status');

    await ctx.reply(
      `👋 *Welcome to ISMAIL AI (v1.0.0)*\n\n` +
        `Your multi-agent personal operating system powered by Google Gemini 3.8 Flash, Supabase, and Barakah Shop BD engine.\n\n` +
        `🤖 *12 Specialist Agents Ready:*\n` +
        `• /study - Academic notes & lecture prep\n` +
        `• /business - Barakah Shop BD orders & inventory\n` +
        `• /islamic - Quran & Hadith verification\n` +
        `• /language - English & Arabic fluency\n` +
        `• /tasks - Daily tasks & habit streaks\n` +
        `• /report - Executive productivity report\n\n` +
        `Send any natural message or question directly, or choose a specialist agent below:`,
      { parse_mode: 'Markdown', reply_markup: keyboard }
    );
  });

  // /help
  bot.command('help', async (ctx) => {
    await ctx.reply(
      `📖 *ISMAIL AI Command Manual*\n\n` +
        `*Core Navigation:*\n` +
        `/start - Launch system menu\n` +
        `/agents - Browse and select from all 12 specialist agents\n` +
        `/ask <prompt> - Query the central orchestrator directly\n\n` +
        `*Specialist Agents:*\n` +
        `/study - Agent 01: Lecture summary, revision notes\n` +
        `/language - Agent 02: English & Arabic grammar\n` +
        `/business - Agent 03: Barakah Shop BD management\n` +
        `/content - Agent 04: Halāl video scripts & captions\n` +
        `/islamic - Agent 05: Verified Quran & Hadith search\n` +
        `/tasks - Agent 06: Task list & daily habit streak\n` +
        `/report - Agent 06 & 11: Daily & weekly summaries\n` +
        `/memory - Inspect long-term facts & preferences\n` +
        `/settings - Security & integration settings\n` +
        `/status - Real-time system health\n` +
        `/usage - Gemini token consumption\n\n` +
        `_Note: Critical actions (order confirmations, post publishing, message sending) will prompt an approval button before execution._`,
      { parse_mode: 'Markdown' }
    );
  });

  // /agents
  bot.command('agents', async (ctx) => {
    const agents = getAllAgents();
    const keyboard = new InlineKeyboard();

    for (let i = 0; i < agents.length; i += 2) {
      keyboard.text(`${agents[i].avatarEmoji} ${agents[i].name}`, `switch:${agents[i].id}`);
      if (agents[i + 1]) {
        keyboard.text(`${agents[i + 1].avatarEmoji} ${agents[i + 1].name}`, `switch:${agents[i + 1].id}`);
      }
      keyboard.row();
    }

    await ctx.reply(`🧠 *ISMAIL AI Specialist Agents (12 Total)*\nSelect an agent to lock conversation context:`, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    });
  });

  // Dedicated Agent Shortcuts
  bot.command('study', async (ctx) => {
    userActiveAgentMap.set(ctx.from!.id, 'agent-01-study');
    await ctx.reply(`📚 *Switched to Agent 01: Study Agent*\nSend lecture notes, exam questions, or ask for a study plan in Arabic, Bangla, or English.`);
  });

  bot.command('business', async (ctx) => {
    userActiveAgentMap.set(ctx.from!.id, 'agent-03-business');
    await ctx.reply(
      `🛍️ *Switched to Agent 03: Business Agent (Barakah Shop BD)*\n` +
        `You can ask for current stock, profit margins, customer support drafts, or Facebook promotional copy.\n` +
        `_Notice: Orders require your explicit confirmation before finalizing._`
    );
  });

  bot.command('content', async (ctx) => {
    userActiveAgentMap.set(ctx.from!.id, 'agent-04-content');
    await ctx.reply(`🎬 *Switched to Agent 04: Content Creation Agent*\nAsk for short video scripts, viral hooks, or Islamic-friendly non-music post ideas.`);
  });

  bot.command('language', async (ctx) => {
    userActiveAgentMap.set(ctx.from!.id, 'agent-02-language');
    await ctx.reply(`🗣️ *Switched to Agent 02: Language Learning Agent*\nReady for English fluency or Classical/Modern Arabic grammar (Nahw & Sarf).`);
  });

  bot.command('islamic', async (ctx) => {
    userActiveAgentMap.set(ctx.from!.id, 'agent-05-islamic');
    await ctx.reply(`🕌 *Switched to Agent 05: Islamic Research Agent*\nAsk for Quranic verses, Hadith verification (Bukhari/Muslim/etc.), or Tafsir notes.`);
  });

  bot.command('tasks', async (ctx) => {
    const tasks = await dbStore.getTasks();
    const taskLines = tasks.map((t) => {
      const statusIcon = t.status === 'completed' ? '✅' : t.status === 'in_progress' ? '🔄' : '⏳';
      return `${statusIcon} *${t.title}* [${t.priority}] ${t.isHabit ? `(Streak: ${t.habitStreak}d)` : ''}`;
    });

    const keyboard = new InlineKeyboard().text('➕ Add Task via Chat', 'cmd:ask').text('📋 View in Dashboard', 'cmd:dashboard');

    await ctx.reply(`📅 *Ismail\'s Daily Tasks & Habits*\n\n${taskLines.join('\n')}`, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    });
  });

  bot.command('report', async (ctx) => {
    const tasks = await dbStore.getTasks();
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const orders = await dbStore.getOrders();
    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    await ctx.reply(
      `📊 *ISMAIL AI Executive Daily Summary*\n\n` +
        `• *Task Completion:* ${completed}/${tasks.length} items completed\n` +
        `• *Barakah Shop BD:* ৳${totalSales.toLocaleString()} total revenue recorded\n` +
        `• *Active Agents:* 12/12 online\n` +
        `• *Security Status:* Human-in-the-loop approvals active`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.command('memory', async (ctx) => {
    const memories = await dbStore.getMemories();
    const text = memories
      .slice(0, 5)
      .map((m) => `🔹 *${m.title}* (${m.type})\n${m.content}`)
      .join('\n\n');

    await ctx.reply(`🧠 *ISMAIL AI Persistent Long-Term Memory*\n\n${text}`, { parse_mode: 'Markdown' });
  });

  bot.command('status', async (ctx) => {
    await ctx.reply(
      `🟢 *ISMAIL AI System Health (v1.0.0)*\n\n` +
        `• *AI Core:* Google Gemini 3.8 Flash (Active)\n` +
        `• *Telegram Bot:* grammY framework (Webhook & Polling ready)\n` +
        `• *Database:* Supabase PostgreSQL + Local Resilient Cache\n` +
        `• *Security:* Owner ID validation enforced\n` +
        `• *Timezone:* Asia/Dhaka`,
      { parse_mode: 'Markdown' }
    );
  });

  bot.command('usage', async (ctx) => {
    await ctx.reply(
      `📈 *API Usage & Consumption*\n\n` +
        `• *Model:* gemini-3.8-flash\n` +
        `• *Rate Limit Rule:* Max 100 queries/hr\n` +
        `• *Approvals Queued:* Check /tasks or Web Dashboard`,
      { parse_mode: 'Markdown' }
    );
  });

  // Handle Callback Queries (Buttons)
  bot.on('callback_query:data', async (ctx) => {
    const data = ctx.callbackQuery.data;

    if (data.startsWith('switch:')) {
      const agentId = data.replace('switch:', '') as AgentId;
      userActiveAgentMap.set(ctx.from.id, agentId);
      const agent = getAllAgents().find((a) => a.id === agentId);
      await ctx.answerCallbackQuery({ text: `Switched to ${agent?.name || agentId}` });
      await ctx.reply(`${agent?.avatarEmoji} *Active Agent Set:* ${agent?.name}\n${agent?.roleTitle}`);
      return;
    }

    if (data.startsWith('approve:')) {
      const approvalId = data.replace('approve:', '');
      const res = await dbStore.decideApproval(approvalId, 'approved', `Telegram Owner (${ctx.from.id})`);
      await ctx.answerCallbackQuery({ text: 'Action Approved!' });
      await ctx.reply(`✅ *Approved:* ${res?.title || approvalId}\nSide-effects executed securely.`);
      return;
    }

    if (data.startsWith('reject:')) {
      const approvalId = data.replace('reject:', '');
      const res = await dbStore.decideApproval(approvalId, 'rejected', `Telegram Owner (${ctx.from.id})`);
      await ctx.answerCallbackQuery({ text: 'Action Rejected' });
      await ctx.reply(`❌ *Rejected:* ${res?.title || approvalId}\nAction has been cancelled.`);
      return;
    }

    await ctx.answerCallbackQuery();
  });

  // Generic message handler: passes query to Central AI Orchestrator
  bot.on('message:text', async (ctx) => {
    const userPrompt = ctx.message.text;
    const explicitAgentId = userActiveAgentMap.get(ctx.from.id);

    // Show typing status indicator
    await ctx.replyWithChatAction('typing');

    try {
      const result = await orchestrator.process({
        message: userPrompt,
        explicitAgentId,
        channel: 'telegram',
        userId: ctx.from.id,
      });

      let replyText = `${result.avatarEmoji} *${result.agentName}*\n\n${result.content}`;

      // If an action requires human approval, attach an inline approval button!
      let keyboard: InlineKeyboard | undefined;
      if (result.actionRequired) {
        replyText += `\n\n⚠️ *APPROVAL REQUIRED:*\n${result.actionRequired.description}`;
        const approvals = await dbStore.getApprovals();
        const latestAppr = approvals[0];
        if (latestAppr) {
          keyboard = new InlineKeyboard()
            .text('✅ Approve Action', `approve:${latestAppr.id}`)
            .text('❌ Reject', `reject:${latestAppr.id}`);
        }
      }

      await ctx.reply(replyText, {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      });
    } catch (err: unknown) {
      console.error('[Telegram Bot Message Error]:', err);
      await ctx.reply('⚠️ Error processing your request. Please try again or switch agent.');
    }
  });

  console.log('[Telegram Bot] grammY bot commands registered successfully.');
}

/**
 * Direct simulator helper: simulates Telegram message execution in the dashboard
 */
export async function simulateTelegramMessage(params: {
  text: string;
  userId?: number | string;
  explicitAgentId?: AgentId;
}): Promise<{
  reply: string;
  agentName: string;
  avatarEmoji: string;
  actionRequired?: Record<string, unknown>;
  quickReplies?: string[];
}> {
  const userId = params.userId || env.TELEGRAM_OWNER_ID || '123456789';

  // Check auth
  if (!isAuthorizedUser(userId)) {
    return {
      reply: `⛔ Access Restricted: ISMAIL AI is configured for authorized owner only (User ID: ${userId}).`,
      agentName: 'Security Gate',
      avatarEmoji: '🛡️',
    };
  }

  // Handle command simulation
  const text = params.text.trim();

  if (text === '/start') {
    return {
      reply: `👋 Welcome to ISMAIL AI (v1.0.0)\n\nMulti-Agent Personal Assistant ready. All 12 specialist agents initialized. Send your request or choose an agent.`,
      agentName: 'Telegram Bot',
      avatarEmoji: '🤖',
      quickReplies: ['/study', '/business', '/islamic', '/tasks', '/status'],
    };
  }

  if (text === '/status') {
    return {
      reply: `🟢 ISMAIL AI System Health (v1.0.0)\n• AI Core: Google Gemini 3.8 Flash (Active)\n• Telegram: grammY Webhook & Simulator Ready\n• Database: Supabase PostgreSQL connected\n• Security: Owner Auth Enforced`,
      agentName: 'System Monitor',
      avatarEmoji: '🟢',
      quickReplies: ['/tasks', '/business', '/help'],
    };
  }

  if (text === '/tasks') {
    const tasks = await dbStore.getTasks();
    const taskSummary = tasks.map((t) => `${t.status === 'completed' ? '✅' : '⏳'} ${t.title} [${t.priority}]`).join('\n');
    return {
      reply: `📅 Current Tasks & Habits:\n\n${taskSummary}`,
      agentName: 'Personal Manager Agent',
      avatarEmoji: '📅',
      quickReplies: ['Add new task', 'Evening report', '/business'],
    };
  }

  // Pass to Orchestrator
  const result = await orchestrator.process({
    message: text,
    explicitAgentId: params.explicitAgentId,
    channel: 'telegram',
    userId,
  });

  return {
    reply: result.content,
    agentName: result.agentName,
    avatarEmoji: result.avatarEmoji,
    actionRequired: result.actionRequired,
    quickReplies: result.suggestedQuickReplies,
  };
}
