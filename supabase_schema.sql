-- ============================================================
-- FLP Client Management — Supabase Schema
-- Run this in the Supabase SQL Editor to set up your database
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── LEADS ──────────────────────────────────────────────────────────────────
create table if not exists leads (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  phone             text not null,
  email             text,
  source            text default 'other',
  date_received     date not null default current_date,

  -- Classification
  lead_temp         text not null default 'cold',   -- cold | warm | hot
  customer_type     text default 'self_stay',        -- investor | self_stay | upgrader | downgrader | first_timer
  market            text not null default 'sg',      -- sg | my | both
  ownership_type    text,                            -- bumi | non_bumi | foreigner

  -- Property interest
  property_type_sg  text[],
  property_type_my  text[],
  bedrooms          integer,
  budget_min_sgd    numeric,
  budget_max_sgd    numeric,
  budget_min_myr    numeric,
  budget_max_myr    numeric,
  preferred_areas_sg text[],
  preferred_areas_my text[],
  timeline          text default 'browsing',

  -- Current holdings
  current_property_sg text default 'none',  -- none | hdb | private | multiple
  current_property_my text default 'none',  -- none | landed | condo | multiple

  -- Co-agent
  assisted_by       text,                            -- name of assisting agent (optional)

  -- Pipeline
  pipeline_stage    text not null default 'new_lead',
  last_contacted_at timestamptz,
  went_cold_at      timestamptz,                     -- when lead was marked cold via autopilot
  notes             text,
  tags              text[] default '{}',

  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ─── ACTIVITIES ─────────────────────────────────────────────────────────────
create table if not exists activities (
  id          uuid primary key default uuid_generate_v4(),
  lead_id     uuid not null references leads(id) on delete cascade,
  type        text not null,   -- whatsapp | call | appointment | listing_sent | note | blast
  activity_date timestamptz not null default now(),
  duration    integer,         -- minutes, for calls
  content     text,
  outcome     text,
  created_at  timestamptz default now()
);

-- ─── FOLLOWUPS ──────────────────────────────────────────────────────────────
create table if not exists followups (
  id                uuid primary key default uuid_generate_v4(),
  lead_id           uuid not null references leads(id) on delete cascade,
  due_date          timestamptz not null,
  type              text not null,   -- whatsapp | call | appointment
  notes             text,
  template_id       uuid,
  status            text not null default 'pending',  -- pending | done | snoozed | cancelled
  -- Hot lead autopilot fields
  hot_auto          boolean default false,
  hot_day           integer,                           -- day number in the follow-up streak
  resolved_outcome  text,                              -- continue | appointment | cold
  resolved_at       timestamptz,
  created_at        timestamptz default now()
);

-- ─── TEMPLATE FOLDERS ────────────────────────────────────────────────────────
create table if not exists template_folders (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  created_at  timestamptz default now()
);

-- ─── TEMPLATES ──────────────────────────────────────────────────────────────
create table if not exists templates (
  id          uuid primary key default uuid_generate_v4(),
  folder_id   uuid references template_folders(id) on delete set null,
  name        text not null,
  category    text not null,   -- cold | warm | hot | appointment | post_viewing | investor | market_update | cross_border | tools
  market      text default 'all',  -- sg | my | both | all
  body        text not null,
  created_at  timestamptz default now()
);

-- ─── Updated_at trigger ──────────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on leads
  for each row execute procedure update_updated_at();

-- ─── Row Level Security ──────────────────────────────────────────────────────
alter table leads             enable row level security;
alter table activities        enable row level security;
alter table followups         enable row level security;
alter table template_folders  enable row level security;
alter table templates         enable row level security;

-- Allow all operations via the anon key (app has its own password gate)
create policy "anon_all_leads"            on leads             for all using (true) with check (true);
create policy "anon_all_activities"       on activities         for all using (true) with check (true);
create policy "anon_all_followups"        on followups          for all using (true) with check (true);
create policy "anon_all_template_folders" on template_folders   for all using (true) with check (true);
create policy "anon_all_templates"        on templates          for all using (true) with check (true);

-- ─── SEED: Default WhatsApp Templates ───────────────────────────────────────
insert into templates (name, category, market, body) values

-- COLD SG
('Cold Intro – SG Investor', 'cold', 'sg',
'Hi {name}! 👋 I''m from FLP, specialising in Singapore investment properties.

I noticed you may be looking for a strong investment opportunity. I currently have some high-yield condos in {area} with rental returns of 3–4% p.a. and good capital appreciation potential.

Would you be open to a quick 10-min chat this week? 😊'),

('Cold Intro – SG Self-Stay', 'cold', 'sg',
'Hi {name}! 👋 My name is from FLP Property.

I have some great {property_type} units in {area} that might suit what you''re looking for — great MRT access, good schools nearby and within your budget range.

Would love to share more details with you. Are you free for a quick chat? 🏠'),

-- COLD MY
('Cold Intro – MY Investor (JB/KL)', 'cold', 'my',
'Hi {name}! 👋 I''m from FLP, covering investment properties in Malaysia — including Johor Bahru and KL.

With the RTS Link coming up and Iskandar development booming, there are some excellent early-mover opportunities right now.

Would you be keen to hear more? Happy to share details at your convenience 😊'),

('Cold Intro – MY Self-Stay', 'cold', 'my',
'Hi {name}! 👋 Looking for a home in Malaysia?

I specialise in properties in {area} and have a few great options within your budget — freehold, good connectivity, and move-in ready.

Can I share some details with you? 🏡'),

-- CROSS BORDER
('Cross-Border – SG Buying MY', 'cross_border', 'both',
'Hi {name}! 👋 Thinking of investing in Malaysia?

Great news — as a Singapore resident, you can own Malaysian properties with zero ABSD! Properties in Johor Iskandar are currently priced from RM{price}, with strong rental demand and capital upside.

Shall I send you a curated shortlist? 😊'),

('Cross-Border – MY Buying SG', 'cross_border', 'both',
'Hi {name}! 👋 Interested in Singapore property?

As a Malaysian investor, Singapore''s market offers excellent stability and long-term growth. Key things to note: foreigners pay 60% ABSD, so we''ll need to factor that into ROI calculations.

I have some options that still make strong financial sense — want me to walk you through the numbers? 📊'),

-- WARM
('Warm Follow-Up – Listings Ready', 'warm', 'all',
'Hi {name}! 😊 Hope you''re doing well!

I''ve shortlisted a few properties based on what you''re looking for — {property_type} in {area}, within SGD {budget}. Here are my top picks:

1️⃣ {listing_1}
2️⃣ {listing_2}
3️⃣ {listing_3}

Let me know which one catches your eye and we can arrange a viewing! 🏠'),

('Warm Follow-Up – Check In', 'warm', 'all',
'Hi {name}! Just checking in 😊 Have you had a chance to look through the listings I sent earlier?

Happy to answer any questions or adjust the search if needed. What''s your timeline looking like now?'),

-- APPOINTMENT
('Appointment Confirmation', 'appointment', 'all',
'Hi {name}! ✅ Just confirming our viewing appointment:

📅 Date: {date}
⏰ Time: {time}
📍 Location: {location}

I''ll be there 10 mins early to brief you before we go in. See you then! 😊

P.S. Feel free to WhatsApp me if you need to reschedule.'),

('Appointment Reminder (Day Before)', 'appointment', 'all',
'Hi {name}! 👋 Just a friendly reminder — we have a viewing tomorrow:

📅 {date} at {time}
📍 {location}

Looking forward to seeing you! Let me know if anything changes 😊'),

-- POST VIEWING
('Post-Viewing Follow-Up', 'post_viewing', 'all',
'Hi {name}! Great to meet you today at {location} 😊

What did you think of the unit? I felt {property_type} at {area} ticked a lot of your boxes — especially {highlight}.

Are you keen to move forward, or would you like to see a few more options first? Happy to help either way!'),

-- INVESTOR
('Investor – ROI Breakdown (SG)', 'investor', 'sg',
'Hi {name}! 📊 As promised, here''s a quick ROI snapshot for {property}:

💰 Purchase Price: SGD {price}
🏠 Estimated Rental: SGD {rental}/mo
📈 Gross Yield: {yield}% p.a.
📊 ABSD (your profile): SGD {absd}
💵 Net Effective Yield (post-ABSD): {net_yield}% p.a.

Based on historical trends in {area}, capital appreciation has been ~{appreciation}% over the last 5 years.

Want to do a full cash flow analysis? I can put together a full sheet for you 🙌'),

('Investor – MY Yield Play', 'investor', 'my',
'Hi {name}! 📊 Here''s the investment breakdown for {property} in {area}:

💰 Price: RM {price}
🏠 Est. Rental: RM {rental}/mo
📈 Gross Yield: {yield}% p.a.
🏦 Loan: Up to 70% for foreigners

RPGT note: Selling within 3 years = 30% tax. Holding 6+ years = 0% (for Malaysian citizens).

Shall I put together a full projection for you? 😊'),

-- FIRST TIMER
('First Timer – SG Guide', 'cold', 'sg',
'Hi {name}! Congrats on starting your property journey! 🎉

As a first-time buyer in Singapore, here''s what you need to know:
✅ No ABSD on your first property
✅ CPF OA can be used for down payment & monthly installment
✅ You may qualify for HDB grants up to SGD 80,000
📊 TDSR limit: 55% of gross monthly income

I''d love to walk you through the full process — it''s simpler than you think! Want to set up a quick call? 😊'),

-- MARKET UPDATES
('Market Update – SG Monthly', 'market_update', 'sg',
'Hi {name}! 👋 Your monthly Singapore property update:

📊 Private residential prices: {trend}
🏗️ New launches this month: {launches}
💡 District to watch: {district} — {reason}
📉 Rental market: {rental_trend}

Anything in particular you''d like me to keep an eye out for? Always happy to help 😊'),

('Market Update – JB/Iskandar', 'market_update', 'my',
'Hi {name}! 👋 Johor/Iskandar market update:

🚇 RTS Link update: {rts_update}
🏗️ New launches: {launches}
📊 Price trend in Iskandar: {trend}
💡 Hotspot: {area} — {reason}

Great time to revisit some options if you''ve been on the fence! Want me to share some fresh listings? 😊');
