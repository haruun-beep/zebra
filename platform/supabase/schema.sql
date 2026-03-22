-- ============================================================
-- Zebra Landscaping FSM — Supabase Schema
-- Run this in the Supabase SQL editor (Database > SQL Editor)
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

create type user_role as enum ('admin', 'technician');
create type job_status as enum ('scheduled', 'in_progress', 'complete', 'cancelled');
create type quote_status as enum ('draft', 'sent', 'approved', 'rejected', 'converted');
create type invoice_status as enum ('draft', 'sent', 'paid', 'overdue', 'cancelled');

-- ============================================================
-- COMPANIES
-- ============================================================

create table companies (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  logo_url      text,
  address       text,
  phone         text,
  email         text,
  website       text,
  tax_rate      numeric(5,2) not null default 0,
  payment_terms integer not null default 30,   -- days
  invoice_notes text,
  stripe_account_id text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- PROFILES  (extends auth.users 1-to-1)
-- ============================================================

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  role        user_role not null default 'admin',
  company_id  uuid references companies(id) on delete set null,
  avatar_url  text,
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- CLIENTS
-- ============================================================

create table clients (
  id           uuid primary key default uuid_generate_v4(),
  company_id   uuid not null references companies(id) on delete cascade,
  name         text not null,
  company_name text,
  phone        text,
  email        text,
  address      text,
  city         text,
  state        text,
  zip          text,
  notes        text,
  archived     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index clients_company_id_idx on clients(company_id);
create index clients_archived_idx   on clients(archived);

-- ============================================================
-- JOBS
-- ============================================================

create table jobs (
  id               uuid primary key default uuid_generate_v4(),
  company_id       uuid not null references companies(id) on delete cascade,
  client_id        uuid not null references clients(id) on delete restrict,
  assigned_to      uuid references profiles(id) on delete set null,
  title            text not null,
  description      text,
  status           job_status not null default 'scheduled',
  scheduled_date   date,
  scheduled_time   time,
  duration_minutes integer,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index jobs_company_id_idx      on jobs(company_id);
create index jobs_client_id_idx       on jobs(client_id);
create index jobs_assigned_to_idx     on jobs(assigned_to);
create index jobs_scheduled_date_idx  on jobs(scheduled_date);
create index jobs_status_idx          on jobs(status);

-- ============================================================
-- JOB PHOTOS
-- ============================================================

create table job_photos (
  id          uuid primary key default uuid_generate_v4(),
  job_id      uuid not null references jobs(id) on delete cascade,
  url         text not null,
  caption     text,
  uploaded_by uuid not null references profiles(id) on delete restrict,
  created_at  timestamptz not null default now()
);

create index job_photos_job_id_idx on job_photos(job_id);

-- ============================================================
-- QUOTES
-- ============================================================

create sequence quote_number_seq start 1000;

create table quotes (
  id             uuid primary key default uuid_generate_v4(),
  company_id     uuid not null references companies(id) on delete cascade,
  client_id      uuid not null references clients(id) on delete restrict,
  quote_number   text not null,
  status         quote_status not null default 'draft',
  subtotal       numeric(12,2) not null default 0,
  tax_rate       numeric(5,2) not null default 0,
  tax_amount     numeric(12,2) not null default 0,
  total          numeric(12,2) not null default 0,
  notes          text,
  valid_until    date,
  approval_token uuid default uuid_generate_v4(),
  approved_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index quotes_company_id_idx on quotes(company_id);
create index quotes_client_id_idx  on quotes(client_id);
create index quotes_status_idx     on quotes(status);
create unique index quotes_approval_token_idx on quotes(approval_token);

-- ============================================================
-- QUOTE LINE ITEMS
-- ============================================================

create table quote_items (
  id          uuid primary key default uuid_generate_v4(),
  quote_id    uuid not null references quotes(id) on delete cascade,
  description text not null,
  quantity    numeric(10,2) not null default 1,
  unit_price  numeric(12,2) not null default 0,
  total       numeric(12,2) generated always as (quantity * unit_price) stored,
  sort_order  integer not null default 0
);

create index quote_items_quote_id_idx on quote_items(quote_id);

-- ============================================================
-- INVOICES
-- ============================================================

create sequence invoice_number_seq start 1000;

create table invoices (
  id                       uuid primary key default uuid_generate_v4(),
  company_id               uuid not null references companies(id) on delete cascade,
  client_id                uuid not null references clients(id) on delete restrict,
  job_id                   uuid references jobs(id) on delete set null,
  invoice_number           text not null,
  status                   invoice_status not null default 'draft',
  subtotal                 numeric(12,2) not null default 0,
  tax_rate                 numeric(5,2) not null default 0,
  tax_amount               numeric(12,2) not null default 0,
  total                    numeric(12,2) not null default 0,
  amount_paid              numeric(12,2) not null default 0,
  notes                    text,
  due_date                 date,
  paid_at                  timestamptz,
  stripe_payment_intent_id text,
  stripe_payment_link      text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index invoices_company_id_idx on invoices(company_id);
create index invoices_client_id_idx  on invoices(client_id);
create index invoices_job_id_idx     on invoices(job_id);
create index invoices_status_idx     on invoices(status);

-- ============================================================
-- INVOICE LINE ITEMS
-- ============================================================

create table invoice_items (
  id          uuid primary key default uuid_generate_v4(),
  invoice_id  uuid not null references invoices(id) on delete cascade,
  description text not null,
  quantity    numeric(10,2) not null default 1,
  unit_price  numeric(12,2) not null default 0,
  total       numeric(12,2) generated always as (quantity * unit_price) stored,
  sort_order  integer not null default 0
);

create index invoice_items_invoice_id_idx on invoice_items(invoice_id);

-- ============================================================
-- INVITATIONS
-- ============================================================

create table invitations (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid not null references companies(id) on delete cascade,
  email       text not null,
  role        user_role not null default 'technician',
  token       uuid not null default uuid_generate_v4(),
  expires_at  timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_by  uuid not null references profiles(id) on delete restrict,
  created_at  timestamptz not null default now()
);

create unique index invitations_token_idx on invitations(token);
create index invitations_company_id_idx   on invitations(company_id);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

create or replace function next_quote_number(p_company_id uuid)
returns text language plpgsql as $$
declare
  v_num integer;
begin
  select coalesce(max(cast(regexp_replace(quote_number, '[^0-9]', '', 'g') as integer)), 999) + 1
    into v_num
    from quotes
   where company_id = p_company_id;
  return 'Q-' || lpad(v_num::text, 4, '0');
end;
$$;

create or replace function next_invoice_number(p_company_id uuid)
returns text language plpgsql as $$
declare
  v_num integer;
begin
  select coalesce(max(cast(regexp_replace(invoice_number, '[^0-9]', '', 'g') as integer)), 999) + 1
    into v_num
    from invoices
   where company_id = p_company_id;
  return 'INV-' || lpad(v_num::text, 4, '0');
end;
$$;

-- Auto-update updated_at columns
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger companies_updated_at  before update on companies  for each row execute function touch_updated_at();
create trigger profiles_updated_at   before update on profiles   for each row execute function touch_updated_at();
create trigger clients_updated_at    before update on clients    for each row execute function touch_updated_at();
create trigger jobs_updated_at       before update on jobs       for each row execute function touch_updated_at();
create trigger quotes_updated_at     before update on quotes     for each row execute function touch_updated_at();
create trigger invoices_updated_at   before update on invoices   for each row execute function touch_updated_at();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table companies   enable row level security;
alter table profiles    enable row level security;
alter table clients     enable row level security;
alter table jobs        enable row level security;
alter table job_photos  enable row level security;
alter table quotes      enable row level security;
alter table quote_items enable row level security;
alter table invoices    enable row level security;
alter table invoice_items enable row level security;
alter table invitations enable row level security;

-- Helper: get current user's company_id
create or replace function my_company_id()
returns uuid language sql stable security definer as $$
  select company_id from profiles where id = auth.uid()
$$;

-- Helper: get current user's role
create or replace function my_role()
returns user_role language sql stable security definer as $$
  select role from profiles where id = auth.uid()
$$;

-- ---- companies ----
create policy "users can view their company"
  on companies for select using (id = my_company_id());

create policy "admins can update their company"
  on companies for update using (id = my_company_id() and my_role() = 'admin');

-- ---- profiles ----
create policy "users can view profiles in same company"
  on profiles for select using (company_id = my_company_id());

create policy "users can update own profile"
  on profiles for update using (id = auth.uid());

-- ---- clients ----
create policy "company members can view clients"
  on clients for select using (company_id = my_company_id());

create policy "admins can insert clients"
  on clients for insert with check (company_id = my_company_id() and my_role() = 'admin');

create policy "admins can update clients"
  on clients for update using (company_id = my_company_id() and my_role() = 'admin');

-- ---- jobs ----
create policy "admins see all company jobs"
  on jobs for select using (
    company_id = my_company_id() and my_role() = 'admin'
  );

create policy "technicians see assigned jobs"
  on jobs for select using (
    company_id = my_company_id() and my_role() = 'technician' and assigned_to = auth.uid()
  );

create policy "admins can insert jobs"
  on jobs for insert with check (company_id = my_company_id() and my_role() = 'admin');

create policy "admins can update any job"
  on jobs for update using (company_id = my_company_id() and my_role() = 'admin');

create policy "technicians can update assigned job status"
  on jobs for update using (
    company_id = my_company_id() and my_role() = 'technician' and assigned_to = auth.uid()
  );

-- ---- job_photos ----
create policy "company members can view job photos"
  on job_photos for select using (
    exists (select 1 from jobs j where j.id = job_photos.job_id and j.company_id = my_company_id())
  );

create policy "company members can upload photos"
  on job_photos for insert with check (
    exists (select 1 from jobs j where j.id = job_photos.job_id and j.company_id = my_company_id())
    and uploaded_by = auth.uid()
  );

-- ---- quotes ----
create policy "admins can manage quotes"
  on quotes for all using (company_id = my_company_id() and my_role() = 'admin');

-- ---- quote_items ----
create policy "admins can manage quote items"
  on quote_items for all using (
    exists (select 1 from quotes q where q.id = quote_items.quote_id and q.company_id = my_company_id())
    and my_role() = 'admin'
  );

-- ---- invoices ----
create policy "admins can manage invoices"
  on invoices for all using (company_id = my_company_id() and my_role() = 'admin');

-- ---- invoice_items ----
create policy "admins can manage invoice items"
  on invoice_items for all using (
    exists (select 1 from invoices i where i.id = invoice_items.invoice_id and i.company_id = my_company_id())
    and my_role() = 'admin'
  );

-- ---- invitations ----
create policy "admins can manage invitations"
  on invitations for all using (company_id = my_company_id() and my_role() = 'admin');

-- ============================================================
-- STORAGE BUCKETS  (run after enabling Storage in dashboard)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('job-photos', 'job-photos', true),
       ('company-logos', 'company-logos', true)
on conflict (id) do nothing;

create policy "authenticated upload job photos"
  on storage.objects for insert
  with check (bucket_id = 'job-photos' and auth.role() = 'authenticated');

create policy "public read job photos"
  on storage.objects for select
  using (bucket_id = 'job-photos');

create policy "admins upload logos"
  on storage.objects for insert
  with check (bucket_id = 'company-logos' and auth.role() = 'authenticated');

create policy "public read logos"
  on storage.objects for select
  using (bucket_id = 'company-logos');
