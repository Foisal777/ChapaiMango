-- ============================================================
-- Chapai Mango House — Supabase schema
-- Run this in Supabase SQL Editor (one-shot setup)
-- ============================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ---------- Products ----------
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  slug              text unique not null,
  variety           text not null,
  price_per_kg      numeric(10,2) not null check (price_per_kg >= 0),
  stock_kg          numeric(10,2) not null default 0 check (stock_kg >= 0),
  images            text[] not null default '{}',
  description       text not null default '',
  short_description text not null default '',
  is_featured       boolean not null default false,
  rating            numeric(2,1) not null default 5.0 check (rating between 0 and 5),
  origin            text not null default 'নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ, বাংলাদেশ',
  season            text not null default 'মে – আগস্ট',
  created_at        timestamptz not null default now()
);

create index if not exists idx_products_featured on public.products(is_featured);
create index if not exists idx_products_slug on public.products(slug);

-- ---------- Orders ----------
create table if not exists public.orders (
  id                    uuid primary key default gen_random_uuid(),
  customer_name         text not null,
  phone                 text not null,
  email                 text,
  address               text not null,
  district              text not null,
  items                 jsonb not null,
  subtotal              numeric(10,2) not null,
  delivery_fee          numeric(10,2) not null default 0,
  total                 numeric(10,2) not null,
  payment_method        text not null check (payment_method in ('cod','bkash','nagad','rocket')),
  payment_txn_id        text,
  payment_sender_number text,
  notes                 text,
  status                text not null default 'pending'
                        check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  created_at            timestamptz not null default now()
);

create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created on public.orders(created_at desc);

-- ---------- Testimonials ----------
create table if not exists public.testimonials (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  location   text,
  message    text not null,
  rating     int not null default 5 check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

-- ---------- Contact messages ----------
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text,
  phone      text,
  message    text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Permissions + Row Level Security
-- ============================================================
-- Both pieces are required: GRANT lets the role see the table at
-- all, and the policy decides which rows it can read/write.
-- ============================================================

alter table public.products          enable row level security;
alter table public.orders            enable row level security;
alter table public.testimonials      enable row level security;
alter table public.contact_messages  enable row level security;

grant usage on schema public to anon, authenticated;

grant insert, select on public.orders           to anon, authenticated;
grant insert         on public.contact_messages to anon, authenticated;
grant select         on public.products         to anon, authenticated;
grant select         on public.testimonials     to anon, authenticated;

grant update, delete on public.orders           to authenticated;
grant update, delete on public.contact_messages to authenticated;
grant insert, update, delete on public.products to authenticated;
grant insert, update, delete on public.testimonials to authenticated;

-- ---------- Policies (drop + recreate, idempotent) ----------

-- Orders: any visitor places an order, admin manages all.
drop policy if exists "orders public insert" on public.orders;
drop policy if exists "orders admin all"     on public.orders;
drop policy if exists "orders insert"        on public.orders;
drop policy if exists "auth all orders"      on public.orders;

create policy "orders public insert"
  on public.orders
  for insert
  to anon, authenticated
  with check (true);

create policy "orders admin all"
  on public.orders
  for all
  to authenticated
  using (true)
  with check (true);

-- Contact messages: any visitor submits, admin reads/manages.
drop policy if exists "contact public insert" on public.contact_messages;
drop policy if exists "contact admin all"     on public.contact_messages;
drop policy if exists "contact insert"        on public.contact_messages;
drop policy if exists "auth all contact"      on public.contact_messages;

create policy "contact public insert"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

create policy "contact admin all"
  on public.contact_messages
  for all
  to authenticated
  using (true)
  with check (true);

-- Products: public read, admin write.
drop policy if exists "products public read" on public.products;
drop policy if exists "products admin all"   on public.products;
drop policy if exists "products read"        on public.products;
drop policy if exists "auth all products"    on public.products;

create policy "products public read"
  on public.products
  for select
  to anon, authenticated
  using (true);

create policy "products admin all"
  on public.products
  for all
  to authenticated
  using (true)
  with check (true);

-- Testimonials: public read, admin write.
drop policy if exists "testimonials public read" on public.testimonials;
drop policy if exists "testimonials admin all"   on public.testimonials;
drop policy if exists "testimonials read"        on public.testimonials;
drop policy if exists "auth all testimonials"    on public.testimonials;

create policy "testimonials public read"
  on public.testimonials
  for select
  to anon, authenticated
  using (true);

create policy "testimonials admin all"
  on public.testimonials
  for all
  to authenticated
  using (true)
  with check (true);

-- ============================================================
-- Seed data (Bengali)
-- ============================================================
insert into public.products
  (name, slug, variety, price_per_kg, stock_kg, images, short_description, description, is_featured, rating, origin, season)
values
  ('প্রিমিয়াম হিমসাগর', 'himsagar', 'Himsagar',
   180, 500,
   array['https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=900'],
   'বাংলা আমের রাজা — মিষ্টি, রসালো, সুগন্ধি।',
   'চাঁপাইনবাবগঞ্জের গাছপাকা হিমসাগর। আঁশহীন মসৃণ শাঁস, কম শাঁসে অসাধারণ মিষ্টি স্বাদ। একবার খেলে বারবার মনে পড়বে।',
   true, 4.9,
   'নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ, বাংলাদেশ', 'মে – জুন'),
  ('ল্যাংড়া (বানারসি)', 'langra', 'Langra',
   200, 400,
   array['https://images.unsplash.com/photo-1553279768-865429fa0078?w=900'],
   'সবুজ-সোনালি রঙ, অসাধারণ মিষ্টি আম।',
   'বানারসি হেরিটেজ জাত — পাতলা খোসা, মাখনের মতো নরম শাঁস। চাঁপাইয়ের মাটি ও আবহাওয়ায় ল্যাংড়া দুনিয়াবিখ্যাত।',
   true, 4.8,
   'নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ, বাংলাদেশ', 'জুন – জুলাই'),
  ('ক্ষীরসাপাত', 'khirsapat', 'Khirsapat',
   220, 350,
   array['https://images.unsplash.com/photo-1605027990121-cbae9e0642df?w=900'],
   'GI ট্যাগ পাওয়া চাঁপাইয়ের গৌরব।',
   'Geographical Indication (GI) নিবন্ধিত ক্ষীরসাপাত — সংরক্ষিত ঐতিহ্য। অত্যন্ত মিষ্টি, হলুদ মাখনের মতো শাঁস, ফাইবার-মুক্ত।',
   true, 5.0,
   'নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ, বাংলাদেশ', 'মে – জুলাই'),
  ('ফজলি', 'fazli', 'Fazli',
   150, 600,
   array['https://images.unsplash.com/photo-1596591868231-05e808fd5ec2?w=900'],
   'বড় সাইজ, লেট সিজন — আচার ও ক্ষীরের জন্য সেরা।',
   'প্রতি ফল ৭০০গ্রাম–১.২ কেজি। লেট-সিজন আম (জুলাই–আগস্ট)। আচার, জ্যাম, ও পাকা খাওয়ার জন্য চমৎকার।',
   false, 4.6,
   'নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ, বাংলাদেশ', 'জুলাই – আগস্ট'),
  ('আম্রপালি', 'amrapali', 'Amrapali',
   170, 450,
   array['https://images.unsplash.com/photo-1631534179872-2b7a577b1ba2?w=900'],
   'হাইব্রিড জাত — ছোট, ঘন মিষ্টি, ফাইবার-মুক্ত।',
   'দশেহারি + নিলাম-এর হাইব্রিড। অত্যন্ত মিষ্টি, ফাইবার কম, লাল-হলুদ রঙ। ছোট পরিবারের জন্য পারফেক্ট।',
   false, 4.7,
   'নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ, বাংলাদেশ', 'জুন – জুলাই'),
  ('গোপালভোগ', 'gopalbhog', 'Gopalbhog',
   160, 300,
   array['https://images.unsplash.com/photo-1605027990121-cbae9e0642df?w=900'],
   'সিজনের প্রথম আম — মে মাসের শুরুতেই পাবেন।',
   'মৌসুমের প্রথম আম। চামড়া পাতলা, সুগন্ধে ভরা, মিষ্টি-টক ব্যালান্স। রমজান/ঈদের প্রিয় আম।',
   false, 4.5,
   'নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ, বাংলাদেশ', 'মে')
on conflict (slug) do nothing;

insert into public.testimonials (name, location, message, rating) values
  ('রাশেদ খান', 'ঢাকা', 'অনেক দিন পর এত ফ্রেশ আম পেলাম। প্যাকেজিং একদম সেফ, একটাও নষ্ট হয়নি। ইনশাআল্লাহ আবার অর্ডার করব।', 5),
  ('নুসরাত জাহান', 'চট্টগ্রাম', 'ক্ষীরসাপাতের স্বাদ একদম চাঁপাইয়ের মতো — যত দিন থাকব Chapai Mango House থেকেই নেব।', 5),
  ('তানভীর আহমেদ', 'সিলেট', 'দাম রিজনেবল, ডেলিভারি ফাস্ট। পরিবারের জন্য গিফট হিসেবে পাঠিয়েছিলাম, সবাই খুশি।', 5)
on conflict do nothing;
