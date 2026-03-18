-- =============================================
-- 揪車 JiuChe — Initial Schema
-- =============================================

-- users (關聯 Supabase auth.users)
create table public.users (
  id            uuid references auth.users on delete cascade primary key,
  phone         text unique not null,
  name          text not null,
  company       text not null,
  is_driver     boolean default false,
  vehicle_type  text,
  vehicle_plate text,
  vehicle_color text,
  avatar_url    text,
  balance       integer default 0,       -- TWD 整數
  co2_total     numeric(10,2) default 0, -- 累積節省 kg
  rating        numeric(3,2) default 0,  -- 司機平均評分
  rating_count  integer default 0,
  created_at    timestamptz default now()
);

-- rides (共乘行程)
create table public.rides (
  id              uuid default gen_random_uuid() primary key,
  driver_id       uuid references public.users(id) on delete cascade not null,
  from_location   text not null,
  to_location     text not null,
  departure_time  timestamptz not null,
  price           integer not null,                -- TWD / 每座
  total_seats     integer not null,
  available_seats integer not null,
  is_recurring    boolean default false,
  recurring_days  text[],                          -- ['MON','TUE','WED','THU','FRI']
  co2_saved       numeric(6,2) default 0,          -- kg / 每座
  notes           text,
  status          text default 'active'
    check (status in ('active','cancelled','completed')),
  created_at      timestamptz default now()
);

-- bookings (乘客預訂)
create table public.bookings (
  id           uuid default gen_random_uuid() primary key,
  ride_id      uuid references public.rides(id) on delete cascade not null,
  passenger_id uuid references public.users(id) on delete cascade not null,
  seats        integer default 1,
  total_price  integer not null,
  status       text default 'confirmed'
    check (status in ('confirmed','cancelled','completed')),
  created_at   timestamptz default now()
);

-- reviews (行程評價)
create table public.reviews (
  id          uuid default gen_random_uuid() primary key,
  booking_id  uuid references public.bookings(id) on delete cascade unique not null,
  reviewer_id uuid references public.users(id) on delete cascade not null,
  reviewee_id uuid references public.users(id) on delete cascade not null,
  rating      integer check (rating between 1 and 5) not null,
  tags        text[],
  comment     text,
  created_at  timestamptz default now()
);

-- wallet_transactions (錢包明細)
create table public.wallet_transactions (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references public.users(id) on delete cascade not null,
  type         text not null
    check (type in ('topup','payment','refund','earning')),
  amount       integer not null,  -- 正數=入帳, 負數=扣款
  description  text not null,
  reference_id uuid,              -- booking_id 或儲值單號
  created_at   timestamptz default now()
);

-- notifications (通知中心)
create table public.notifications (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references public.users(id) on delete cascade not null,
  type         text not null
    check (type in ('booking_confirmed','ride_reminder','payment','review','esg','system')),
  title        text not null,
  body         text not null,
  is_read      boolean default false,
  reference_id uuid,
  created_at   timestamptz default now()
);

-- =============================================
-- Row Level Security
-- =============================================

alter table public.users               enable row level security;
alter table public.rides               enable row level security;
alter table public.bookings            enable row level security;
alter table public.reviews             enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.notifications       enable row level security;

-- users
create policy "users_select_own"   on public.users for select using (auth.uid() = id);
create policy "users_update_own"   on public.users for update using (auth.uid() = id);
create policy "users_insert_own"   on public.users for insert with check (auth.uid() = id);

-- rides（所有人可看 active 行程，司機可管理自己的）
create policy "rides_select_active" on public.rides for select using (status = 'active' or driver_id = auth.uid());
create policy "rides_insert_own"    on public.rides for insert with check (driver_id = auth.uid());
create policy "rides_update_own"    on public.rides for update using (driver_id = auth.uid());

-- bookings（乘客看自己的、司機看自己行程的預訂）
create policy "bookings_select_own" on public.bookings for select
  using (
    passenger_id = auth.uid() or
    exists (select 1 from public.rides where rides.id = bookings.ride_id and rides.driver_id = auth.uid())
  );
create policy "bookings_insert_own"  on public.bookings for insert with check (passenger_id = auth.uid());
create policy "bookings_update_own"  on public.bookings for update using (passenger_id = auth.uid());

-- reviews（所有人可看，本人可新增）
create policy "reviews_select_all"  on public.reviews for select using (true);
create policy "reviews_insert_own"  on public.reviews for insert with check (reviewer_id = auth.uid());

-- wallet_transactions（只看自己的）
create policy "wallet_select_own"   on public.wallet_transactions for select using (user_id = auth.uid());

-- notifications（只看自己的，可更新已讀狀態）
create policy "notif_select_own"    on public.notifications for select using (user_id = auth.uid());
create policy "notif_update_own"    on public.notifications for update using (user_id = auth.uid());
