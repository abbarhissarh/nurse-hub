-- Nurse Hub schema. Run in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), coalesce(new.email,''));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  image_url text,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text not null default '',
  description text not null default '',
  category_id uuid references public.categories(id) on delete set null,
  price integer not null check (price >= 0),            -- naira
  discount_price integer check (discount_price >= 0 and discount_price < price),
  thumbnail_url text,
  file_storage_key text,                                 -- private bucket path, never exposed
  preview_storage_key text,
  file_type text not null default 'PDF',
  file_size bigint,
  tags text[] not null default '{}',
  is_featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published')),
  download_limit integer not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- cannot publish without a real file
  constraint publish_needs_file check (status = 'draft' or file_storage_key is not null)
);
create index on public.products (category_id);
create index on public.products (status, created_at desc);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent','fixed')),
  discount_value integer not null check (discount_value > 0),
  start_date timestamptz, expiry_date timestamptz,
  usage_limit integer, usage_count integer not null default 0,
  status text not null default 'active' check (status in ('active','inactive'))
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references public.profiles(id),
  subtotal integer not null, discount integer not null default 0, total_amount integer not null,
  currency text not null default 'NGN',
  coupon_id uuid references public.coupons(id),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  order_status text not null default 'pending' check (order_status in ('pending','completed','cancelled')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index on public.orders (user_id, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_title_snapshot text not null,
  unit_price integer not null, quantity integer not null default 1, subtotal integer not null
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  payment_provider text not null default 'paystack',
  payment_reference text not null unique,               -- unique = idempotency guard
  amount integer not null, currency text not null default 'NGN',
  status text not null default 'pending' check (status in ('pending','success','failed')),
  verified_at timestamptz, created_at timestamptz not null default now()
);

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  product_id uuid not null references public.products(id),
  order_id uuid not null references public.orders(id),
  purchased_at timestamptz not null default now(),
  download_count integer not null default 0,
  status text not null default 'active' check (status in ('active','disabled')),
  unique (user_id, product_id)
);

create table public.downloads (
  id uuid primary key default gen_random_uuid(),
  entitlement_id uuid not null references public.entitlements(id) on delete cascade,
  user_id uuid not null, product_id uuid not null,
  downloaded_at timestamptz not null default now(), ip_address text
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique, status text not null default 'active',
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  product_id uuid not null references public.products(id) on delete cascade,
  rating integer not null check (rating between 1 and 5), review text,
  status text not null default 'pending', created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid, action text not null, details jsonb, created_at timestamptz not null default now()
);

-- Row level security
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.entitlements enable row level security;
alter table public.downloads enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.reviews enable row level security;
alter table public.audit_logs enable row level security;

create policy "own profile read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "own profile update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
create policy "public read categories" on public.categories for select using (status = 'active' or public.is_admin());
create policy "admin write categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "public read products" on public.products for select using (status = 'published' or public.is_admin());
create policy "admin write products" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "own orders" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "own order items" on public.order_items for select using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));
create policy "own payments" on public.payments for select using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));
create policy "own entitlements" on public.entitlements for select using (user_id = auth.uid() or public.is_admin());
create policy "own downloads" on public.downloads for select using (user_id = auth.uid() or public.is_admin());
create policy "admin coupons" on public.coupons for all using (public.is_admin()) with check (public.is_admin());
create policy "admin newsletter" on public.newsletter_subscribers for select using (public.is_admin());
create policy "own reviews" on public.reviews for select using (user_id = auth.uid() or status = 'approved' or public.is_admin());
create policy "admin audit" on public.audit_logs for select using (public.is_admin());
-- Orders, payments, entitlements and downloads are written only by the server (service role).

-- Storage: product files private, thumbnails public
insert into storage.buckets (id, name, public) values ('product-files','product-files', false) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('thumbnails','thumbnails', true) on conflict do nothing;
create policy "public read thumbnails" on storage.objects for select using (bucket_id = 'thumbnails');
create policy "admin manage thumbnails" on storage.objects for all using (bucket_id = 'thumbnails' and public.is_admin()) with check (bucket_id = 'thumbnails' and public.is_admin());
create policy "admin manage files" on storage.objects for all using (bucket_id = 'product-files' and public.is_admin()) with check (bucket_id = 'product-files' and public.is_admin());
