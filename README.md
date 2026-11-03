# ISMAIL AI (v1.0.0)
### Multi-Agent Personal AI Assistant Operating System

ISMAIL AI is a production-grade, modular, mobile-first personal AI assistant built for **Ismail**. It is powered by **Google Gemini 3.8 Flash**, **Telegram (grammY)**, and **Supabase PostgreSQL**.

---

## 🌟 Key Features

1. **Central AI Orchestrator**: Automatically analyzes intent from Telegram messages and Web Dashboard chats, dispatches queries to the optimal specialist agent, retrieves relevant tri-tier memories, and coordinates approvals.
2. **12 Configured Specialist Agents**:
   - **Agent 01: Study Agent** (Lecture transcription, summaries, Arabic/Bangla/English notes, spaced repetition revision)
   - **Agent 02: Language Learning Agent** (English & Classical/Modern Arabic fluency, Nahw & Sarf grammar, Harakat phonetics)
   - **Agent 03: Business Agent (Barakah Shop BD)** (Inventory management, ethical copy generation, order draft & approvals, customer DB)
   - **Agent 04: Content Creation Agent** (Short video scripts, hooks, TikTok/Reels/Shorts, Islamic-friendly non-music options)
   - **Agent 05: Islamic Research Agent** (Verified Quran verse lookup, Hadith chain verification, Tafsir insights, zero-hallucination rules)
   - **Agent 06: Personal Manager Agent** (Daily priorities, Eisenhower matrix, habit streaks, morning briefs & evening reflection)
   - **Agent 07: Research Agent** (Deep literature and web investigation, evidence synthesis, citations)
   - **Agent 08: Communication Agent** (Bilingual formal emails, DMs, diplomatic replies with human-in-the-loop approval before send)
   - **Agent 09: File Manager Agent** (PDF/DOCX/TXT processing, summarization, metadata tagging, Supabase storage integration)
   - **Agent 10: Coding Agent** (TypeScript, React, Node.js, GitHub workflows, bug isolation, sandboxed safety)
   - **Agent 11: Data Analyst Agent** (Sales margins, productivity rates, token metrics, executive trend reporting)
   - **Agent 12: Automation Agent** (Scheduled cron tasks, daily morning notifications, workflow orchestration)
3. **Security & Human-in-the-Loop Approvals**:
   - Never confirms orders or commits funds without explicit owner approval.
   - Never sends external messages or publishes posts without verification.
   - Owner-only authentication on Telegram (verifies `TELEGRAM_OWNER_ID`).
4. **Mobile-First Android Web Dashboard**:
   - One-thumb bottom navigation dock designed for mobile screens.
   - Dark and Light mode themes.
   - Live Telegram Bot Simulator for testing commands without leaving the browser.
5. **Database & Memory**:
   - Full 15-table Supabase PostgreSQL migration in `supabase/migrations/20261103000000_ismail_ai_init.sql`.
   - Local resilient store fallback when running without cloud credentials.

---

## 🚀 Quick Start & Environment Variables

Copy `.env.example` to `.env`:

```bash
# 1. Google Gemini API (Server-side @google/genai)
GEMINI_API_KEY="AIzaSy..."

# 2. Telegram Bot Configuration
TELEGRAM_BOT_TOKEN="1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ"
TELEGRAM_OWNER_ID="123456789" # Your Telegram user ID

# 3. Supabase PostgreSQL
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."

# 4. Host & Port
APP_URL="http://localhost:3000"
PORT=3000
```

### Run Locally
```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

---

## 📲 Telegram Bot Setup

1. Message **@BotFather** on Telegram: send `/newbot`.
2. Follow prompts and copy the token into `TELEGRAM_BOT_TOKEN`.
3. Message **@userinfobot** to obtain your personal Telegram ID and set it as `TELEGRAM_OWNER_ID`.
4. Run `npm run dev`. Send `/start` to your bot.

Available Commands:
- `/start` - Launch main menu
- `/help` - Command guide
- `/agents` - Switch specialist agents
- `/study` - Agent 01 (Study)
- `/business` - Agent 03 (Barakah Shop BD)
- `/islamic` - Agent 05 (Islamic Research)
- `/tasks` - Agent 06 (Daily tasks & habits)
- `/report` - Daily summary
- `/memory` - Inspect persistent facts
- `/status` - System health check
- `/usage` - AI token consumption

---

## 🐘 Supabase Database Migration

Apply `supabase/migrations/20261103000000_ismail_ai_init.sql` directly inside your Supabase project's SQL Editor to instantiate all 15 tables with Row Level Security (RLS) policies and triggers.
