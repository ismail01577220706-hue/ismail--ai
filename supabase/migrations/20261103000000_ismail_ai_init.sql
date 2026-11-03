-- ==============================================================================
-- ISMAIL AI Database Schema Migration
-- Version: 1.0.0
-- Target: Supabase PostgreSQL
-- Description: Core tables, foreign keys, indexes, RLS policies, and triggers
-- ==============================================================================

-- Enable essential extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- 1. PROFILES (User / Owner metadata)
create table if not exists public.profiles (
    id uuid primary key default gen_random_uuid(),
    auth_user_id uuid references auth.users(id) on delete cascade,
    telegram_user_id bigint unique,
    username text,
    full_name text not null default 'Ismail (Owner)',
    role text not null default 'owner' check (role in ('owner', 'admin', 'assistant', 'user')),
    avatar_url text,
    phone text,
    timezone text not null default 'Asia/Dhaka',
    preferences jsonb not null default '{"language": "bn", "theme": "dark", "notifications_enabled": true}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 2. AGENTS (Specialist agent definitions and configurations)
create table if not exists public.agents (
    id text primary key, -- e.g. 'agent-01-study', 'agent-03-business'
    number integer not null unique,
    name text not null,
    role_title text not null,
    category text not null,
    system_instruction text not null,
    tools jsonb not null default '[]'::jsonb,
    permissions jsonb not null default '{"requires_approval": false, "can_execute_external": false}'::jsonb,
    model_name text not null default 'gemini-3.8-flash',
    is_active boolean not null default true,
    avatar_emoji text not null default '🤖',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 3. CONVERSATIONS (Telegram & Dashboard threads)
create table if not exists public.conversations (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid references public.profiles(id) on delete cascade,
    channel text not null check (channel in ('telegram', 'dashboard', 'api')),
    telegram_chat_id bigint,
    active_agent_id text references public.agents(id) on delete set null,
    title text not null default 'New Conversation',
    is_archived boolean not null default false,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 4. MESSAGES (Short-term memory message store)
create table if not exists public.messages (
    id uuid primary key default gen_random_uuid(),
    conversation_id uuid not null references public.conversations(id) on delete cascade,
    sender text not null check (sender in ('user', 'assistant', 'system', 'tool')),
    agent_id text references public.agents(id) on delete set null,
    content text not null,
    media_url text,
    media_type text check (media_type in ('image', 'audio', 'document', 'voice', 'video', null)),
    tool_calls jsonb,
    tool_results jsonb,
    token_count integer default 0,
    created_at timestamptz not null default now()
);

-- 5. MEMORIES (Short-term, long-term, and knowledge facts)
create table if not exists public.memories (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid references public.profiles(id) on delete cascade,
    type text not null check (type in ('short_term', 'long_term', 'knowledge', 'preference')),
    category text not null default 'general',
    title text not null,
    content text not null,
    tags text[] not null default array[]::text[],
    importance integer not null default 3 check (importance between 1 and 5),
    embedding vector(768),
    metadata jsonb not null default '{}'::jsonb,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 6. TASKS (Daily task management & habit tracking)
create table if not exists public.tasks (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid references public.profiles(id) on delete cascade,
    title text not null,
    description text,
    priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
    status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
    category text not null default 'personal' check (category in ('personal', 'study', 'business', 'islamic', 'coding', 'automation')),
    assigned_agent_id text references public.agents(id) on delete set null,
    due_date timestamptz,
    is_habit boolean not null default false,
    habit_frequency text check (habit_frequency in ('daily', 'weekly', 'custom', null)),
    habit_streak integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 7. SCHEDULED_TASKS (Automated cron & reminder schedules)
create table if not exists public.scheduled_tasks (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid references public.profiles(id) on delete cascade,
    agent_id text references public.agents(id) on delete set null,
    title text not null,
    description text,
    cron_expression text,
    run_at timestamptz,
    is_recurring boolean not null default false,
    target_channel text not null default 'telegram' check (target_channel in ('telegram', 'dashboard', 'both')),
    payload jsonb not null default '{}'::jsonb,
    is_active boolean not null default true,
    last_run_at timestamptz,
    next_run_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 8. FILES (Uploaded documents, voice notes, PDFs, images)
create table if not exists public.files (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid references public.profiles(id) on delete cascade,
    file_name text not null,
    file_type text not null,
    mime_type text not null,
    file_size_bytes bigint not null,
    storage_path text not null,
    public_url text,
    summary text,
    extracted_text text,
    tags text[] not null default array[]::text[],
    processed boolean not null default false,
    created_at timestamptz not null default now()
);

-- 9. KNOWLEDGE_BASE (Study notes, Islamic references, business SOPs)
create table if not exists public.knowledge_base (
    id uuid primary key default gen_random_uuid(),
    category text not null check (category in ('study', 'islamic', 'business', 'coding', 'general')),
    title text not null,
    content text not null,
    source_reference text,
    language text not null default 'en',
    verified boolean not null default true,
    embedding vector(768),
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 10. CUSTOMERS (Barakah Shop BD customer database)
create table if not exists public.customers (
    id uuid primary key default gen_random_uuid(),
    full_name text not null,
    phone text not null unique,
    email text,
    address text,
    district text default 'Dhaka',
    total_orders integer not null default 0,
    total_spent numeric(12,2) not null default 0.00,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 11. PRODUCTS (Barakah Shop BD catalog)
create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    sku text not null unique,
    name text not null,
    category text not null default 'general',
    description text,
    selling_price numeric(10,2) not null,
    cost_price numeric(10,2) not null,
    stock_quantity integer not null default 0,
    is_active boolean not null default true,
    image_url text,
    facebook_post_draft text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 12. ORDERS (Barakah Shop BD orders & fulfillment)
create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    order_number text not null unique,
    customer_id uuid not null references public.customers(id) on delete restrict,
    status text not null default 'draft' check (status in ('draft', 'pending_approval', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    items jsonb not null default '[]'::jsonb,
    subtotal numeric(12,2) not null default 0.00,
    delivery_fee numeric(10,2) not null default 0.00,
    total_amount numeric(12,2) not null default 0.00,
    profit numeric(12,2) not null default 0.00,
    notes text,
    requires_approval boolean not null default true,
    approved_by text,
    approved_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 13. ACTIVITY_LOGS (Audit logging and audit trail)
create table if not exists public.activity_logs (
    id uuid primary key default gen_random_uuid(),
    actor text not null default 'system',
    action text not null,
    entity_type text not null,
    entity_id text,
    details jsonb not null default '{}'::jsonb,
    ip_address text,
    created_at timestamptz not null default now()
);

-- 14. API_USAGE (Gemini API token usage & rate limiting tracker)
create table if not exists public.api_usage (
    id uuid primary key default gen_random_uuid(),
    model_name text not null,
    agent_id text references public.agents(id) on delete set null,
    prompt_tokens integer not null default 0,
    completion_tokens integer not null default 0,
    total_tokens integer not null default 0,
    latency_ms integer not null default 0,
    status text not null default 'success' check (status in ('success', 'error', 'rate_limited')),
    created_at timestamptz not null default now()
);

-- 15. APPROVALS (Human-in-the-loop critical action security approval queue)
create table if not exists public.approvals (
    id uuid primary key default gen_random_uuid(),
    agent_id text not null references public.agents(id) on delete cascade,
    action_type text not null check (action_type in ('send_email', 'publish_post', 'confirm_order', 'make_payment', 'delete_data', 'execute_code', 'external_api')),
    title text not null,
    description text not null,
    payload jsonb not null,
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'expired')),
    decided_by text,
    decided_at timestamptz,
    reason text,
    created_at timestamptz not null default now()
);

-- INDEXES for high query performance
create index if not exists idx_conversations_profile on public.conversations(profile_id);
create index if not exists idx_messages_conversation on public.messages(conversation_id);
create index if not exists idx_memories_profile on public.memories(profile_id);
create index if not exists idx_memories_type on public.memories(type);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_priority on public.tasks(priority);
create index if not exists idx_scheduled_next_run on public.scheduled_tasks(next_run_at);
create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_approvals_status on public.approvals(status);

-- Automatic updated_at Trigger Function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Apply triggers
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.handle_updated_at();

drop trigger if exists set_conversations_updated_at on public.conversations;
create trigger set_conversations_updated_at before update on public.conversations for each row execute function public.handle_updated_at();

drop trigger if exists set_memories_updated_at on public.memories;
create trigger set_memories_updated_at before update on public.memories for each row execute function public.handle_updated_at();

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at before update on public.tasks for each row execute function public.handle_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at before update on public.orders for each row execute function public.handle_updated_at();

-- ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.memories enable row level security;
alter table public.agents enable row level security;
alter table public.tasks enable row level security;
alter table public.scheduled_tasks enable row level security;
alter table public.files enable row level security;
alter table public.knowledge_base enable row level security;
alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.activity_logs enable row level security;
alter table public.api_usage enable row level security;
alter table public.approvals enable row level security;

-- Public read access to active agents
create policy "Allow read access to agents" on public.agents for select using (true);

-- Authenticated owner / service role access for all tables
create policy "Owner can access own profile" on public.profiles for all using (auth.uid() = auth_user_id or auth.role() = 'service_role');
create policy "Service role full access on conversations" on public.conversations for all using (auth.role() = 'service_role' or true);
create policy "Service role full access on messages" on public.messages for all using (auth.role() = 'service_role' or true);
create policy "Service role full access on memories" on public.memories for all using (auth.role() = 'service_role' or true);
create policy "Service role full access on tasks" on public.tasks for all using (auth.role() = 'service_role' or true);
create policy "Service role full access on scheduled_tasks" on public.scheduled_tasks for all using (auth.role() = 'service_role' or true);
create policy "Service role full access on files" on public.files for all using (auth.role() = 'service_role' or true);
create policy "Service role full access on knowledge_base" on public.knowledge_base for all using (auth.role() = 'service_role' or true);
create policy "Service role full access on customers" on public.customers for all using (auth.role() = 'service_role' or true);
create policy "Service role full access on products" on public.products for all using (auth.role() = 'service_role' or true);
create policy "Service role full access on orders" on public.orders for all using (auth.role() = 'service_role' or true);
create policy "Service role full access on activity_logs" on public.activity_logs for all using (auth.role() = 'service_role' or true);
create policy "Service role full access on api_usage" on public.api_usage for all using (auth.role() = 'service_role' or true);
create policy "Service role full access on approvals" on public.approvals for all using (auth.role() = 'service_role' or true);
