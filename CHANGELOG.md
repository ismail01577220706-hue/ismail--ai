# Changelog

All notable changes to the ISMAIL AI project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-03

### Added
- Central AI Orchestrator with intent recognition and tri-tier memory retrieval.
- Complete implementation of all 12 Specialist Agents:
  - Agent 01: Study Agent (Academics & Lecture Notes)
  - Agent 02: Language Learning Agent (English & Arabic Fluency)
  - Agent 03: Business Agent (Barakah Shop BD Catalog, Orders & Copy)
  - Agent 04: Content Creation Agent (Video Scripts & Halāl Copy)
  - Agent 05: Islamic Research Agent (Verified Quran & Hadith citations)
  - Agent 06: Personal Manager Agent (Tasks & Habit Tracking)
  - Agent 07: Research Agent (Deep Investigation & Synthesis)
  - Agent 08: Communication Agent (Drafting & Diplomatic Messages)
  - Agent 09: File Manager Agent (Document Parsing & Archival)
  - Agent 10: Coding Agent (Full-stack TypeScript & Architecture)
  - Agent 11: Data Analyst Agent (Financial & Productivity Analytics)
  - Agent 12: Automation Agent (Scheduled Workflows & Crons)
- Human-in-the-loop critical action approval gate for orders, emails, and publications.
- Telegram Bot integration using grammY with owner-only authentication and inline menus.
- Complete Supabase PostgreSQL schema with 15 tables, foreign keys, indexes, and RLS policies.
- Full-stack Express backend with server-side `@google/genai` integration and Vite middleware.
- Mobile-first responsive Web Dashboard optimized for Android screens with dark/light theme support.
- Built-in Telegram Bot Simulator modal for zero-setup browser testing.
