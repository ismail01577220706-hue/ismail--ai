import { AgentId, AgentOrchestrationResult } from '../agents/types.ts';
import { getAgent, SPECIALIST_AGENTS } from '../agents/registry.ts';
import { callGemini } from './gemini.ts';
import { dbStore } from '../database/store.ts';

interface OrchestratorInput {
  message: string;
  explicitAgentId?: AgentId;
  channel: 'telegram' | 'dashboard' | 'api';
  conversationHistory?: Array<{ role: 'user' | 'model'; parts: string }>;
  userId?: string | number;
}

export class CentralAIOrchestrator {
  /**
   * Intelligently selects the specialist agent based on keyword heuristics and query semantics
   */
  detectSpecialistAgent(text: string, explicitAgentId?: AgentId): AgentId {
    if (explicitAgentId && explicitAgentId in SPECIALIST_AGENTS) {
      return explicitAgentId;
    }

    const t = text.toLowerCase();

    // 05. Islamic Research
    if (
      t.includes('quran') ||
      t.includes('hadith') ||
      t.includes('tafsir') ||
      t.includes('ayah') ||
      t.includes('surah') ||
      t.includes('sunnah') ||
      t.includes('islam') ||
      t.includes('khutbah') ||
      t.includes('bukhari') ||
      t.includes('muslim') ||
      t.includes('হাদিস') ||
      t.includes('কুরআন') ||
      t.includes('সালাত')
    ) {
      return 'agent-05-islamic';
    }

    // 03. Business (Barakah Shop BD)
    if (
      t.includes('barakah') ||
      t.includes('shop') ||
      t.includes('product') ||
      t.includes('order') ||
      t.includes('customer') ||
      t.includes('price') ||
      t.includes('stock') ||
      t.includes('dates') ||
      t.includes('ajwa') ||
      t.includes('kalijira') ||
      t.includes('honey') ||
      t.includes('দোকান') ||
      t.includes('পণ্য') ||
      t.includes('অর্ডার')
    ) {
      return 'agent-03-business';
    }

    // 01. Study Agent
    if (
      t.includes('study') ||
      t.includes('lecture') ||
      t.includes('exam') ||
      t.includes('revision') ||
      t.includes('summary') ||
      t.includes('quiz') ||
      t.includes('syllabus') ||
      t.includes('notes') ||
      t.includes('পড়া') ||
      t.includes('পরীক্ষা')
    ) {
      return 'agent-01-study';
    }

    // 02. Language Learning
    if (
      t.includes('english') ||
      t.includes('arabic') ||
      t.includes('grammar') ||
      t.includes('nahw') ||
      t.includes('sarf') ||
      t.includes('vocab') ||
      t.includes('pronunciation') ||
      t.includes('translate') ||
      t.includes('অনুবাদ') ||
      t.includes('ইংরেজি') ||
      t.includes('আরবি')
    ) {
      return 'agent-02-language';
    }

    // 04. Content Creation
    if (
      t.includes('video') ||
      t.includes('script') ||
      t.includes('reel') ||
      t.includes('shorts') ||
      t.includes('tiktok') ||
      t.includes('caption') ||
      t.includes('facebook post') ||
      t.includes('content') ||
      t.includes('prompt')
    ) {
      return 'agent-04-content';
    }

    // 10. Coding Agent
    if (
      t.includes('code') ||
      t.includes('typescript') ||
      t.includes('javascript') ||
      t.includes('react') ||
      t.includes('node') ||
      t.includes('bug') ||
      t.includes('error') ||
      t.includes('github') ||
      t.includes('function') ||
      t.includes('api') ||
      t.includes('database') ||
      t.includes('sql')
    ) {
      return 'agent-10-coding';
    }

    // 11. Data Analyst
    if (
      t.includes('data') ||
      t.includes('csv') ||
      t.includes('excel') ||
      t.includes('chart') ||
      t.includes('metric') ||
      t.includes('analytics') ||
      t.includes('statistics')
    ) {
      return 'agent-11-data';
    }

    // 08. Communication
    if (
      t.includes('email') ||
      t.includes('formal letter') ||
      t.includes('reply to message') ||
      t.includes('draft reply') ||
      t.includes('ইমেইল')
    ) {
      return 'agent-08-communication';
    }

    // 09. File Manager
    if (t.includes('pdf') || t.includes('docx') || t.includes('file') || t.includes('document')) {
      return 'agent-09-file';
    }

    // 12. Automation
    if (t.includes('cron') || t.includes('schedule') || t.includes('automation') || t.includes('workflow')) {
      return 'agent-12-automation';
    }

    // 07. Research
    if (t.includes('research') || t.includes('fact check') || t.includes('investigate') || t.includes('source')) {
      return 'agent-07-research';
    }

    // Default to 06. Personal Manager
    return 'agent-06-personal';
  }

  /**
   * Process message end-to-end
   */
  async process(input: OrchestratorInput): Promise<AgentOrchestrationResult> {
    const selectedAgentId = this.detectSpecialistAgent(input.message, input.explicitAgentId);
    const agent = getAgent(selectedAgentId);

    // 1. Retrieve relevant memories from Supabase / store
    const memories = await dbStore.getMemories();
    const memoryContext = memories
      .slice(0, 5)
      .map((m) => `[Memory - ${m.title}]: ${m.content}`)
      .join('\n');

    // 2. Retrieve domain specific live database state
    let domainState = '';
    if (selectedAgentId === 'agent-03-business') {
      const products = await dbStore.getProducts();
      domainState = `\n[Barakah Shop BD Live Inventory]:\n${products
        .map((p) => `- ${p.name} (SKU: ${p.sku}): Stock=${p.stockQuantity}, Price=৳${p.sellingPrice}, Cost=৳${p.costPrice}`)
        .join('\n')}\n`;
    } else if (selectedAgentId === 'agent-06-personal') {
      const tasks = await dbStore.getTasks();
      domainState = `\n[Today's Tasks & Habits]:\n${tasks
        .map((t) => `- [${t.status.toUpperCase()}] ${t.title} (${t.priority}) ${t.isHabit ? `[Habit Streak: ${t.habitStreak} days]` : ''}`)
        .join('\n')}\n`;
    }

    // 3. Assemble full system instruction with strict security rules
    const systemInstruction = `${agent.systemInstruction}

[CORE ARCHITECTURE CONTEXT]
You are part of the ISMAIL AI Multi-Agent Personal Assistant for Ismail.
Channel: ${input.channel.toUpperCase()}.

[LONG-TERM MEMORY CONTEXT]
${memoryContext}
${domainState}

[SECURITY & APPROVAL PROTOCOLS]
1. If the user asks you to take an irreversible action (Confirming an order, Sending an email/message to a third party, Publishing a social media post, or Executing code), NEVER perform it unconditionally. Formulate a clean proposal and explicitly note that Ismail's authorization is required.
2. If language requested is Bangla or English, respond naturally in that language.
3. Be concise, highly professional, disciplined, and helpful.`;

    // 4. Dispatch to Gemini
    const geminiResult = await callGemini({
      systemInstruction,
      prompt: input.message,
      conversationHistory: input.conversationHistory,
    });

    const responseText = geminiResult.text;

    // 5. Evaluate if an action requires approval
    let actionRequired: AgentOrchestrationResult['actionRequired'];

    if (
      agent.permissions.requiresApproval &&
      (input.message.toLowerCase().includes('order') ||
        input.message.toLowerCase().includes('publish') ||
        input.message.toLowerCase().includes('send email'))
    ) {
      if (selectedAgentId === 'agent-03-business' && input.message.toLowerCase().includes('order')) {
        actionRequired = {
          type: 'confirm_order',
          title: 'Confirm Barakah Shop Order Draft',
          description: 'A newly drafted customer order requires owner confirmation before processing.',
          payload: { prompt: input.message },
        };
        await dbStore.addApproval({
          agentId: agent.id,
          agentName: agent.name,
          actionType: 'confirm_order',
          title: 'Order Processing Approval',
          description: `Action triggered by: "${input.message}"`,
          payload: { text: input.message },
        });
      } else if (selectedAgentId === 'agent-04-content' && input.message.toLowerCase().includes('publish')) {
        actionRequired = {
          type: 'publish_post',
          title: 'Publish Social Media Post',
          description: 'Review and approve posting to official channels.',
          payload: { prompt: input.message },
        };
      } else if (selectedAgentId === 'agent-08-communication') {
        actionRequired = {
          type: 'send_email',
          title: 'Send Outgoing Communication',
          description: 'Verify recipient and drafted message content before sending.',
          payload: { prompt: input.message },
        };
      }
    }

    // 6. Formulate quick reply suggestions
    const quickReplies: string[] = [];
    if (selectedAgentId === 'agent-01-study') {
      quickReplies.push('Create a 3-day revision plan', 'Generate 5 quiz questions', 'Summarize key terms');
    } else if (selectedAgentId === 'agent-03-business') {
      quickReplies.push('Show inventory summary', 'Generate Facebook sales post', 'View customer list');
    } else if (selectedAgentId === 'agent-05-islamic') {
      quickReplies.push('Quran reference for patience', 'Daily hadith verification', 'Jummah reminder draft');
    } else if (selectedAgentId === 'agent-06-personal') {
      quickReplies.push('Show today’s priorities', 'Mark morning habit complete', 'Evening productivity review');
    } else {
      quickReplies.push('Switch to Study Agent', 'Switch to Business Agent', 'Check System Status');
    }

    // 7. Log activity
    dbStore.addLog(agent.name, 'DISPATCH_RESPONSE', 'agent_turn', `Processed query via ${agent.name} (${geminiResult.totalTokens} tokens)`);

    return {
      agentId: agent.id,
      agentName: agent.name,
      avatarEmoji: agent.avatarEmoji,
      content: responseText,
      actionRequired,
      suggestedQuickReplies: quickReplies,
      usage: {
        promptTokens: geminiResult.promptTokens,
        completionTokens: geminiResult.completionTokens,
        totalTokens: geminiResult.totalTokens,
      },
    };
  }
}

export const orchestrator = new CentralAIOrchestrator();
