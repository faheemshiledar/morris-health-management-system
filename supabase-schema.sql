-- ═══════════════════════════════════════════════════════════════
--   Morris Health Management System — Supabase Schema
--   Run this entire file in Supabase → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension (already enabled on Supabase by default)
create extension if not exists "uuid-ossp";

-- ─── 1. PATIENTS ────────────────────────────────────────────────
create table if not exists patients (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  age              integer,
  gender           text default 'Male',
  phone            text,
  email            text,
  address          text,
  medical_history  text,
  created_at       timestamptz default now()
);

-- ─── 2. DOCTORS ─────────────────────────────────────────────────
create table if not exists doctors (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  specialization   text,
  phone            text,
  email            text,
  qualification    text,
  schedule         text,
  created_at       timestamptz default now()
);

-- ─── 3. APPOINTMENTS ────────────────────────────────────────────
create table if not exists appointments (
  id          uuid primary key default uuid_generate_v4(),
  patient_id  uuid references patients(id) on delete cascade,
  doctor_id   uuid references doctors(id)  on delete set null,
  date        date not null,
  time        time not null,
  status      text default 'Scheduled',   -- Scheduled | Completed | Cancelled | No-Show
  notes       text,
  created_at  timestamptz default now()
);

-- ─── 4. LAB TESTS ───────────────────────────────────────────────
create table if not exists lab_tests (
  id             uuid primary key default uuid_generate_v4(),
  patient_id     uuid references patients(id) on delete cascade,
  test_name      text not null,
  result         text,
  status         text default 'Pending',  -- Pending | Processing | Completed
  notes          text,
  ai_explanation text,
  created_at     timestamptz default now()
);

-- ─── 5. BILLING ─────────────────────────────────────────────────
create table if not exists billing (
  id          uuid primary key default uuid_generate_v4(),
  patient_id  uuid references patients(id) on delete cascade,
  description text,
  amount      numeric(10,2) default 0,
  status      text default 'Pending',   -- Pending | Paid | Overdue
  due_date    date,
  created_at  timestamptz default now()
);

-- ─── Row Level Security (open for MVP — lock down for production) ─
alter table patients     enable row level security;
alter table doctors      enable row level security;
alter table appointments enable row level security;
alter table lab_tests    enable row level security;
alter table billing      enable row level security;

-- Allow all operations using the anon key (suitable for MVP)
create policy "allow_all_patients"     on patients     for all using (true) with check (true);
create policy "allow_all_doctors"      on doctors      for all using (true) with check (true);
create policy "allow_all_appointments" on appointments for all using (true) with check (true);
create policy "allow_all_lab_tests"    on lab_tests    for all using (true) with check (true);
create policy "allow_all_billing"      on billing      for all using (true) with check (true);

-- ─── SAMPLE DATA ────────────────────────────────────────────────
insert into doctors (name, specialization, phone, email, qualification, schedule) values
  ('Dr. Arjun Sharma',   'General Physician',  '9876543210', 'arjun@morrishms.com',  'MBBS, MD',       'Mon–Fri 9am–5pm'),
  ('Dr. Priya Mehta',    'Cardiologist',       '9876543211', 'priya@morrishms.com',  'MBBS, DM Cardio','Mon–Sat 10am–4pm'),
  ('Dr. Ravi Kumar',     'Pediatrician',       '9876543212', 'ravi@morrishms.com',   'MBBS, DCH',      'Tue–Sat 9am–2pm');

insert into patients (name, age, gender, phone, email, address, medical_history) values
  ('Amit Singh',     35, 'Male',   '9123456780', 'amit@email.com',   'Sector 17, Chandigarh', 'Hypertension since 2019'),
  ('Sunita Devi',    52, 'Female', '9123456781', 'sunita@email.com', 'Panchkula, Haryana',    'Type 2 Diabetes, controlled'),
  ('Rahul Verma',    28, 'Male',   '9123456782', 'rahul@email.com',  'Mohali, Punjab',        'No significant history'),
  ('Kavita Joshi',   44, 'Female', '9123456783', 'kavita@email.com', 'Chandigarh, Sector 22', 'Thyroid (hypothyroidism)');
