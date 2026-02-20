-- =====================================================
-- TaskMaster - Supabase Database Schema
-- Run this in your Supabase SQL editor
-- =====================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================================================
-- PROFILES TABLE (extends auth.users)
-- =====================================================
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email varchar(50) unique not null,
  full_name varchar(50),
  avatar_url text,
  mobile_number varchar(15),
  subscription text default 'free' check (subscription in ('free', 'premium', 'enterprise')),
  role text default 'member' check (role in ('admin', 'member')),
  status text default 'active' check (status in ('active', 'inactive')),
  selected_language varchar(10) default 'en',
  theme text default 'dark' check (theme in ('light', 'dark', 'system')),
  timezone varchar(100) default 'UTC',
  mfa_enabled boolean default false,
  sync_status text default 'synced',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title varchar(50) not null,
  color_code varchar(20) default '#135bec',
  icon varchar(50) default 'folder',
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- PROJECTS TABLE
-- =====================================================
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  project_name varchar(50) not null,
  description text,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  is_team_project boolean default false,
  status text default 'active' check (status in ('active', 'in_review', 'completed', 'delayed', 'on_hold')),
  start_date date,
  end_date date,
  color_code varchar(20) default '#135bec',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint end_after_start check (end_date >= start_date)
);

-- =====================================================
-- USER_PROJECTS TABLE (team members)
-- =====================================================
create table public.user_projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  joined_at timestamptz default now(),
  unique(user_id, project_id)
);

-- =====================================================
-- TASKS TABLE
-- =====================================================
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  task_name varchar(50) not null,
  task_summary text,
  status text default 'todo' check (status in ('todo', 'in_progress', 'in_review', 'done')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  created_by uuid references public.profiles(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  project_id uuid references public.projects(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  parent_task_id uuid references public.tasks(id) on delete cascade,
  deadline timestamptz,
  schedule_time timestamptz,
  completed_at timestamptz,
  is_recurring boolean default false,
  recurrence_pattern text,
  snooze_until timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint deadline_future check (deadline > created_at)
);

-- =====================================================
-- TASK COMMENTS TABLE
-- =====================================================
create table public.task_comments (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- ATTACHMENTS TABLE
-- =====================================================
create table public.attachments (
  id uuid default uuid_generate_v4() primary key,
  file_name varchar(50) not null,
  file_url varchar(255) not null,
  file_size integer,
  file_type varchar(50),
  task_id uuid references public.tasks(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  uploaded_at timestamptz default now()
);

-- =====================================================
-- REMINDERS TABLE
-- =====================================================
create table public.reminders (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  remind_at timestamptz not null,
  reminder_type text default 'push' check (reminder_type in ('push', 'email', 'sms')),
  is_sent boolean default false,
  created_at timestamptz default now()
);

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================
create table public.payments (
  id serial primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  transaction_id varchar(50) unique not null,
  payment_date timestamptz default now(),
  amount numeric(10,2) not null check (amount > 0),
  currency varchar(3) default 'USD',
  status text default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  subscription_tier text,
  payment_method text
);

-- =====================================================
-- ACTIVITY LOG TABLE
-- =====================================================
create table public.activity_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  action text not null,
  details jsonb,
  created_at timestamptz default now()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.projects enable row level security;
alter table public.user_projects enable row level security;
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.attachments enable row level security;
alter table public.reminders enable row level security;
alter table public.payments enable row level security;
alter table public.activity_logs enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Categories: users manage their own categories
create policy "Users manage own categories" on public.categories for all using (auth.uid() = user_id);

-- Projects: owners manage, members can view
create policy "Project owner full access" on public.projects for all using (auth.uid() = owner_id);
create policy "Project members can view" on public.projects for select using (
  exists (select 1 from public.user_projects where project_id = id and user_id = auth.uid())
);

-- User Projects: users can see their memberships
create policy "Users see own project memberships" on public.user_projects for select using (auth.uid() = user_id);
create policy "Project owners manage memberships" on public.user_projects for all using (
  exists (select 1 from public.projects where id = project_id and owner_id = auth.uid())
);

-- Tasks: task creator or assignee
create policy "Users can manage own tasks" on public.tasks for all using (
  auth.uid() = created_by or auth.uid() = assigned_to
);
create policy "Project members can view project tasks" on public.tasks for select using (
  project_id is not null and exists (
    select 1 from public.user_projects where project_id = tasks.project_id and user_id = auth.uid()
  )
);

-- Task Comments: members of a project
create policy "Users manage own comments" on public.task_comments for all using (auth.uid() = user_id);

-- Attachments
create policy "Users manage own attachments" on public.attachments for all using (auth.uid() = user_id);

-- Reminders
create policy "Users manage own reminders" on public.reminders for all using (auth.uid() = user_id);

-- Payments: own payments only
create policy "Users view own payments" on public.payments for select using (auth.uid() = user_id);

-- Activity Logs: own logs
create policy "Users view own activity" on public.activity_logs for select using (auth.uid() = user_id);

-- =====================================================
-- DEFAULT CATEGORIES FOR NEW USERS
-- =====================================================
create or replace function public.create_default_categories()
returns trigger as $$
begin
  insert into public.categories (user_id, title, color_code, icon, is_default) values
    (new.id, 'Personal',  '#10b981', 'person',       true),
    (new.id, 'Work',      '#135bec', 'work',         true),
    (new.id, 'Family',    '#f59e0b', 'family_star',  true),
    (new.id, 'Projects',  '#8b5cf6', 'folder',       true);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.create_default_categories();

-- =====================================================
-- UPDATED_AT AUTO-UPDATE FUNCTION
-- =====================================================
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at_column();
create trigger update_tasks_updated_at before update on public.tasks
  for each row execute procedure public.update_updated_at_column();
create trigger update_projects_updated_at before update on public.projects
  for each row execute procedure public.update_updated_at_column();

-- =====================================================
-- HELPFUL INDEXES
-- =====================================================
create index idx_tasks_created_by on public.tasks(created_by);
create index idx_tasks_assigned_to on public.tasks(assigned_to);
create index idx_tasks_project_id on public.tasks(project_id);
create index idx_tasks_status on public.tasks(status);
create index idx_tasks_deadline on public.tasks(deadline);
create index idx_projects_owner on public.projects(owner_id);
create index idx_user_projects_user on public.user_projects(user_id);
create index idx_activity_user on public.activity_logs(user_id);
