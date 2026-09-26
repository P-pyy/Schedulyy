-- SCHEDULY SUPABASE MIGRATION
-- Run this in Supabase SQL Editor on a fresh project.
-- Does NOT create Auth users or sample business data.
-- Includes checked_in_at for punctuality tracking.

create extension if not exists btree_gist;

do $$ begin create type public.user_role as enum ('customer','business_owner','staff','admin'); exception when duplicate_object then null; end $$;
do $$ begin create type public.business_tier as enum ('BASIC','PRO','ENTERPRISE'); exception when duplicate_object then null; end $$;
do $$ begin create type public.service_category as enum ('HAIRCUTS','COLOR','CHEMICAL','NAILS','WELLNESS'); exception when duplicate_object then null; end $$;
do $$ begin create type public.booking_status as enum ('pending','confirmed','completed','cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type public.payment_status as enum ('unpaid','paid','deposit_paid'); exception when duplicate_object then null; end $$;
do $$ begin create type public.crm_tier as enum ('VIP','Regular','New'); exception when duplicate_object then null; end $$;
do $$ begin create type public.kyc_status as enum ('pending','verified','rejected','resubmitted'); exception when duplicate_object then null; end $$;
do $$ begin create type public.moderation_priority as enum ('high','medium','low'); exception when duplicate_object then null; end $$;
do $$ begin create type public.moderation_status as enum ('open','in_review','resolved','archived'); exception when duplicate_object then null; end $$;
do $$ begin create type public.moderation_target_type as enum ('business','booking','user'); exception when duplicate_object then null; end $$;

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text, email text, phone text, avatar_url text,
 role public.user_role not null default 'customer',
 is_banned boolean not null default false, ban_reason text, banned_at timestamptz,
 banned_by uuid references public.profiles(id) on delete set null,
 is_verified boolean not null default false, fraud_flag text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.businesses (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references public.profiles(id) on delete restrict,
 name text not null, category text, description text, location text, area text,
 image_url text, logo_url text,
 is_verified boolean not null default false, is_top_rated boolean not null default false,
 eco_certified boolean not null default false, tags text[] not null default '{}',
 tier public.business_tier not null default 'BASIC', public_slug text unique,
 is_active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.services (
 id uuid primary key default gen_random_uuid(),
 business_id uuid not null references public.businesses(id) on delete cascade,
 title text not null, category public.service_category, description text,
 duration_minutes integer not null check (duration_minutes > 0),
 price numeric(10,2) not null check (price >= 0),
 deposit numeric(10,2) check (deposit is null or (deposit >= 0 and deposit <= price)),
 is_popular boolean not null default false, is_active boolean not null default true,
 image_url text, sort_order integer not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.staff (
 id uuid primary key default gen_random_uuid(),
 business_id uuid not null references public.businesses(id) on delete cascade,
 user_id uuid references public.profiles(id) on delete set null,
 name text not null, role text, specialty text, avatar_url text,
 is_active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.service_staff (
 service_id uuid not null references public.services(id) on delete cascade,
 staff_id uuid not null references public.staff(id) on delete cascade,
 primary key (service_id, staff_id)
);

create table public.client_crm (
 id uuid primary key default gen_random_uuid(),
 business_id uuid not null references public.businesses(id) on delete cascade,
 user_id uuid references public.profiles(id) on delete set null,
 name text not null, phone text not null, email text, avatar_url text,
 tier public.crm_tier not null default 'New',
 preferred_staff_id uuid references public.staff(id) on delete set null,
 formula_note text, tags text[] not null default '{}',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.client_notes (
 id uuid primary key default gen_random_uuid(),
 client_crm_id uuid not null references public.client_crm(id) on delete cascade,
 business_id uuid not null references public.businesses(id) on delete cascade,
 author_id uuid references public.profiles(id) on delete set null,
 note_text text not null, created_at timestamptz not null default now()
);

create table public.bookings (
 id uuid primary key default gen_random_uuid(),
 booking_number text unique not null,
 business_id uuid not null references public.businesses(id) on delete restrict,
 service_id uuid not null references public.services(id) on delete restrict,
 staff_id uuid references public.staff(id) on delete set null,
 client_user_id uuid references public.profiles(id) on delete set null,
 client_crm_id uuid references public.client_crm(id) on delete set null,
 client_name text not null, client_phone text not null,
 start_at timestamptz not null, end_at timestamptz not null,
 fee numeric(10,2) not null check (fee >= 0),
 status public.booking_status not null default 'pending',
 is_checked_in boolean not null default false, checked_in_at timestamptz,
 payment_status public.payment_status not null default 'unpaid',
 payment_method text, deposit_amount numeric(10,2) not null default 0 check (deposit_amount >= 0),
 client_note text, cancellation_reason text, cancelled_at timestamptz,
 cancelled_by uuid references public.profiles(id) on delete set null,
 created_by uuid references public.profiles(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check (end_at > start_at), check (deposit_amount <= fee),
 check ((is_checked_in = false and checked_in_at is null) or (is_checked_in = true and checked_in_at is not null))
);

alter table public.bookings add constraint bookings_staff_time_no_overlap
exclude using gist (staff_id with =, tstzrange(start_at,end_at,'[)') with &&)
where (staff_id is not null and status in ('pending','confirmed'));

create table public.favorites (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 business_id uuid not null references public.businesses(id) on delete cascade,
 created_at timestamptz not null default now(), unique(user_id,business_id)
);

create table public.reviews (
 id uuid primary key default gen_random_uuid(),
 booking_id uuid unique not null references public.bookings(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete restrict,
 business_id uuid not null references public.businesses(id) on delete cascade,
 staff_id uuid references public.staff(id) on delete set null,
 rating integer not null check (rating between 1 and 5), comment text,
 created_at timestamptz not null default now()
);

create table public.kyc_requests (
 id uuid primary key default gen_random_uuid(),
 business_id uuid not null references public.businesses(id) on delete cascade,
 tin text, dti_verified boolean not null default false, mayors_permit boolean not null default false,
 status public.kyc_status not null default 'pending',
 issue_note text, issue_detail text, document_url text,
 reviewed_by uuid references public.profiles(id) on delete set null, reviewed_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.moderation_tickets (
 id uuid primary key default gen_random_uuid(),
 priority public.moderation_priority not null, status public.moderation_status not null default 'open',
 title text not null, target_type public.moderation_target_type, target_id uuid,
 target_label text, subtitle text,
 reporter_id uuid references public.profiles(id) on delete set null, reporter_label text,
 quote text, disputed_amount numeric(10,2), resolution_text text, action_message text,
 resolved_by uuid references public.profiles(id) on delete set null, resolved_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.audit_logs (
 id uuid primary key default gen_random_uuid(), action text not null,
 author_id uuid references public.profiles(id) on delete set null,
 author_name text, author_role text, details text,
 created_at timestamptz not null default now()
);

create table public.platform_settings (
 id integer primary key default 1 check(id=1),
 platform_fee_percent numeric(5,2) not null default 2.50,
 platform_fee_fixed numeric(10,2) not null default 15.00,
 auto_cancel_timeout_minutes integer not null default 120,
 sms_balance numeric(12,2) not null default 0,
 toggle_gcash boolean not null default true, toggle_vip boolean not null default true,
 toggle_commission boolean not null default true, toggle_maintenance boolean not null default false,
 updated_at timestamptz not null default now()
);

create table public.business_hours (
 id uuid primary key default gen_random_uuid(),
 business_id uuid not null references public.businesses(id) on delete cascade,
 day_of_week integer not null check(day_of_week between 0 and 6),
 open_time time, close_time time, is_closed boolean not null default false,
 unique(business_id,day_of_week)
);

create table public.staff_hours (
 id uuid primary key default gen_random_uuid(),
 staff_id uuid not null references public.staff(id) on delete cascade,
 business_id uuid not null references public.businesses(id) on delete cascade,
 day_of_week integer not null check(day_of_week between 0 and 6),
 start_time time, end_time time, is_off boolean not null default false,
 unique(staff_id,day_of_week)
);

create table public.blocked_slots (
 id uuid primary key default gen_random_uuid(),
 business_id uuid not null references public.businesses(id) on delete cascade,
 staff_id uuid references public.staff(id) on delete cascade,
 start_at timestamptz not null, end_at timestamptz not null, reason text not null,
 created_by uuid references public.profiles(id) on delete set null,
 created_at timestamptz not null default now(), check(end_at > start_at)
);

create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path=''
as $$ begin new.updated_at=now(); return new; end $$;

do $$
declare t text;
begin
 foreach t in array array['profiles','businesses','services','staff','client_crm','bookings','kyc_requests','moderation_tickets','platform_settings'] loop
  execute format('drop trigger if exists %I_updated_at on public.%I',t,t);
  execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()',t,t);
 end loop;
end $$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path=''
as $$
begin
 insert into public.profiles(id,full_name,email,phone,avatar_url)
 values(new.id,new.raw_user_meta_data->>'full_name',new.email,new.phone,new.raw_user_meta_data->>'avatar_url')
 on conflict(id) do update set email=excluded.email,updated_at=now();
 return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path=''
as $$ select exists(
 select 1 from public.profiles p
 where p.id=(select auth.uid()) and p.role='admin'::public.user_role and not p.is_banned
) $$;

create or replace function public.is_business_owner(p_business_id uuid) returns boolean
language sql stable security definer set search_path=''
as $$ select exists(
 select 1 from public.businesses b
 where b.id=p_business_id and b.owner_id=(select auth.uid())
) $$;

create or replace function public.is_business_staff(p_business_id uuid) returns boolean
language sql stable security definer set search_path=''
as $$ select exists(
 select 1 from public.staff s
 join public.profiles p on p.id=s.user_id
 where s.business_id=p_business_id and s.user_id=(select auth.uid())
 and s.is_active and not p.is_banned
) $$;

-- Secure booking creation. If staff_id is omitted, an available staff member is
-- selected atomically; clients cannot directly insert bookings.
create or replace function public.create_booking(
 p_business_id uuid,p_service_id uuid,p_start_at timestamptz,
 p_client_name text,p_client_phone text,p_staff_id uuid default null,
 p_client_user_id uuid default null,p_client_crm_id uuid default null,
 p_client_note text default null,p_payment_method text default null,
 p_deposit_amount numeric default 0
) returns public.bookings
language plpgsql security definer set search_path=''
as $$
declare s public.services%rowtype; b public.bookings%rowtype; v_staff uuid:=p_staff_id;
 v_end timestamptz; n text;
begin
 if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
 if exists(select 1 from public.profiles where id=(select auth.uid()) and is_banned) then raise exception 'Banned users cannot book'; end if;
 if p_client_user_id is not null and p_client_user_id<>(select auth.uid()) then raise exception 'Invalid client user'; end if;

 select * into s from public.services where id=p_service_id and business_id=p_business_id and is_active;
 if not found then raise exception 'Invalid or inactive service'; end if;
 if p_deposit_amount<0 or p_deposit_amount>s.price then raise exception 'Invalid deposit'; end if;
 v_end:=p_start_at+make_interval(mins=>s.duration_minutes);

 if not exists(
  select 1 from public.business_hours h
  where h.business_id=p_business_id
  and h.day_of_week=extract(dow from p_start_at)::int
  and not h.is_closed and (p_start_at at time zone 'UTC')::time>=h.open_time
  and (v_end at time zone 'UTC')::time<=h.close_time
 ) then raise exception 'Appointment is outside business hours'; end if;

 if v_staff is null then
  select st.id into v_staff
  from public.staff st join public.service_staff ss on ss.staff_id=st.id
  where st.business_id=p_business_id and st.is_active and ss.service_id=p_service_id
  and not exists(select 1 from public.blocked_slots x where x.business_id=p_business_id
    and (x.staff_id is null or x.staff_id=st.id)
    and tstzrange(x.start_at,x.end_at,'[)') && tstzrange(p_start_at,v_end,'[)'))
  and not exists(select 1 from public.bookings x where x.staff_id=st.id
    and x.status in('pending','confirmed')
    and tstzrange(x.start_at,x.end_at,'[)') && tstzrange(p_start_at,v_end,'[)'))
  limit 1;
  if v_staff is null then raise exception 'No available staff for this service'; end if;
 else
  if not exists(select 1 from public.staff st join public.service_staff ss on ss.staff_id=st.id
    where st.id=v_staff and st.business_id=p_business_id and st.is_active and ss.service_id=p_service_id)
  then raise exception 'Selected staff cannot perform this service'; end if;
  if exists(select 1 from public.blocked_slots x where x.business_id=p_business_id
    and (x.staff_id is null or x.staff_id=v_staff)
    and tstzrange(x.start_at,x.end_at,'[)') && tstzrange(p_start_at,v_end,'[)'))
  then raise exception 'Selected time is blocked'; end if;
 end if;

 n:='SC-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
 insert into public.bookings(booking_number,business_id,service_id,staff_id,client_user_id,client_crm_id,
 client_name,client_phone,start_at,end_at,fee,status,payment_method,deposit_amount,client_note,created_by)
 values(n,p_business_id,p_service_id,v_staff,coalesce(p_client_user_id,(select auth.uid())),p_client_crm_id,
 p_client_name,p_client_phone,p_start_at,v_end,s.price,'pending',p_payment_method,p_deposit_amount,p_client_note,(select auth.uid()))
 returning * into b;
 return b;
exception when exclusion_violation then
 raise exception 'The selected staff member is already booked';
end $$;

-- Admin-only functions.
create or replace function public.ban_user(p_user_id uuid,p_reason text) returns void
language plpgsql security definer set search_path=''
as $$ begin
 if not public.is_admin() then raise exception 'Admin access required'; end if;
 if p_user_id=(select auth.uid()) then raise exception 'Cannot ban yourself'; end if;
 update public.profiles set is_banned=true,ban_reason=p_reason,banned_at=now(),banned_by=(select auth.uid()),updated_at=now()
 where id=p_user_id;
 if not found then raise exception 'User not found'; end if;
 insert into public.audit_logs(action,author_id,details) values('BAN_USER',(select auth.uid()),'Banned user '||p_user_id);
end $$;

create or replace function public.approve_kyc(p_kyc_id uuid,p_status public.kyc_status,p_issue_note text default null,p_issue_detail text default null)
returns public.kyc_requests language plpgsql security definer set search_path=''
as $$
declare k public.kyc_requests%rowtype;
begin
 if not public.is_admin() then raise exception 'Admin access required'; end if;
 update public.kyc_requests set status=p_status,issue_note=p_issue_note,issue_detail=p_issue_detail,
 reviewed_by=(select auth.uid()),reviewed_at=now(),updated_at=now() where id=p_kyc_id returning * into k;
 if not found then raise exception 'KYC request not found'; end if;
 update public.businesses set is_verified=(p_status='verified'),updated_at=now() where id=k.business_id;
 insert into public.audit_logs(action,author_id,details) values('KYC_REVIEW',(select auth.uid()),'Reviewed KYC '||p_kyc_id);
 return k;
end $$;

create or replace function public.resolve_moderation_ticket(p_ticket_id uuid,p_status public.moderation_status,p_resolution_text text default null,p_action_message text default null)
returns public.moderation_tickets language plpgsql security definer set search_path=''
as $$
declare t public.moderation_tickets%rowtype;
begin
 if not public.is_admin() then raise exception 'Admin access required'; end if;
 update public.moderation_tickets set status=p_status,resolution_text=p_resolution_text,action_message=p_action_message,
 resolved_by=case when p_status='resolved' then (select auth.uid()) else resolved_by end,
 resolved_at=case when p_status='resolved' then now() else resolved_at end,updated_at=now()
 where id=p_ticket_id returning * into t;
 if not found then raise exception 'Ticket not found'; end if;
 insert into public.audit_logs(action,author_id,details) values('MODERATION_REVIEW',(select auth.uid()),'Reviewed ticket '||p_ticket_id);
 return t;
end $$;

create or replace function public.update_platform_settings(
 p_platform_fee_percent numeric default null,p_platform_fee_fixed numeric default null,
 p_auto_cancel_timeout_minutes integer default null,p_sms_balance numeric default null,
 p_toggle_gcash boolean default null,p_toggle_vip boolean default null,
 p_toggle_commission boolean default null,p_toggle_maintenance boolean default null)
returns public.platform_settings language plpgsql security definer set search_path=''
as $$
declare s public.platform_settings%rowtype;
begin
 if not public.is_admin() then raise exception 'Admin access required'; end if;
 update public.platform_settings set
 platform_fee_percent=coalesce(p_platform_fee_percent,platform_fee_percent),
 platform_fee_fixed=coalesce(p_platform_fee_fixed,platform_fee_fixed),
 auto_cancel_timeout_minutes=coalesce(p_auto_cancel_timeout_minutes,auto_cancel_timeout_minutes),
 sms_balance=coalesce(p_sms_balance,sms_balance),toggle_gcash=coalesce(p_toggle_gcash,toggle_gcash),
 toggle_vip=coalesce(p_toggle_vip,toggle_vip),toggle_commission=coalesce(p_toggle_commission,toggle_commission),
 toggle_maintenance=coalesce(p_toggle_maintenance,toggle_maintenance),updated_at=now()
 where id=1 returning * into s;
 insert into public.audit_logs(action,author_id,details) values('UPDATE_PLATFORM_SETTINGS',(select auth.uid()),'Updated platform settings');
 return s;
end $$;

insert into public.platform_settings(id) values(1) on conflict(id) do nothing;

-- RLS
do $$ declare t text; begin
 foreach t in array array['profiles','businesses','services','staff','service_staff','bookings','client_crm','client_notes','favorites','reviews','kyc_requests','moderation_tickets','audit_logs','platform_settings','business_hours','staff_hours','blocked_slots'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on table public.%I from anon,authenticated',t);
 end loop;
end $$;

grant usage on schema public to anon,authenticated;
grant select on public.businesses,public.services,public.staff,public.service_staff,public.business_hours,public.staff_hours,public.reviews to anon,authenticated;
grant select,update on public.profiles to authenticated;
grant insert,update,delete on public.businesses,public.services,public.staff,public.service_staff,public.client_crm,public.client_notes,public.favorites,public.reviews,public.business_hours,public.staff_hours,public.blocked_slots to authenticated;
grant select,update on public.businesses,public.services,public.staff,public.service_staff,public.client_crm,public.client_notes,public.favorites,public.reviews,public.bookings,public.kyc_requests,public.moderation_tickets,public.audit_logs,public.platform_settings,public.business_hours,public.staff_hours,public.blocked_slots to authenticated;
-- Booking creation is intentionally through create_booking().
grant update on public.bookings to authenticated;

revoke execute on function public.create_booking(uuid,uuid,timestamptz,text,text,uuid,uuid,uuid,text,text,numeric) from public,anon;
grant execute on function public.create_booking(uuid,uuid,timestamptz,text,text,uuid,uuid,uuid,text,text,numeric) to authenticated;
grant execute on function public.ban_user(uuid,text),public.approve_kyc(uuid,public.kyc_status,text,text),
 public.resolve_moderation_ticket(uuid,public.moderation_status,text,text),
 public.update_platform_settings(numeric,numeric,integer,numeric,boolean,boolean,boolean,boolean) to authenticated;

create policy profiles_select on public.profiles for select to authenticated using(id=(select auth.uid()) or public.is_admin());
create policy profiles_update on public.profiles for update to authenticated using(id=(select auth.uid()) or public.is_admin()) with check(id=(select auth.uid()) or public.is_admin());
create policy profiles_delete on public.profiles for delete to authenticated using(public.is_admin());

create policy businesses_select on public.businesses for select to anon,authenticated using((is_active and is_verified) or owner_id=(select auth.uid()) or public.is_admin());
create policy businesses_insert on public.businesses for insert to authenticated with check(owner_id=(select auth.uid()) or public.is_admin());
create policy businesses_update on public.businesses for update to authenticated using(owner_id=(select auth.uid()) or public.is_admin()) with check(owner_id=(select auth.uid()) or public.is_admin());
create policy businesses_delete on public.businesses for delete to authenticated using(public.is_admin());

create policy services_select on public.services for select to anon,authenticated using(
 (is_active and exists(select 1 from public.businesses b where b.id=business_id and b.is_active and b.is_verified))
 or public.is_business_owner(business_id) or public.is_admin());
create policy services_insert on public.services for insert to authenticated with check(public.is_business_owner(business_id) or public.is_admin());
create policy services_update on public.services for update to authenticated using(public.is_business_owner(business_id) or public.is_admin()) with check(public.is_business_owner(business_id) or public.is_admin());
create policy services_delete on public.services for delete to authenticated using(public.is_business_owner(business_id) or public.is_admin());

create policy staff_select on public.staff for select to anon,authenticated using(
 (is_active and exists(select 1 from public.businesses b where b.id=business_id and b.is_active and b.is_verified))
 or public.is_business_owner(business_id) or public.is_admin());
create policy staff_insert on public.staff for insert to authenticated with check(public.is_business_owner(business_id) or public.is_admin());
create policy staff_update on public.staff for update to authenticated using(public.is_business_owner(business_id) or public.is_admin()) with check(public.is_business_owner(business_id) or public.is_admin());
create policy staff_delete on public.staff for delete to authenticated using(public.is_business_owner(business_id) or public.is_admin());

create policy service_staff_select on public.service_staff for select to anon,authenticated using(true);
create policy service_staff_insert on public.service_staff for insert to authenticated with check(
 public.is_admin() or exists(select 1 from public.services s join public.staff st on st.business_id=s.business_id where s.id=service_id and st.id=staff_id and public.is_business_owner(s.business_id)));
create policy service_staff_update on public.service_staff for update to authenticated using(public.is_admin() or exists(select 1 from public.services s join public.staff st on st.business_id=s.business_id where s.id=service_id and st.id=staff_id and public.is_business_owner(s.business_id)));
create policy service_staff_delete on public.service_staff for delete to authenticated using(public.is_admin() or exists(select 1 from public.services s join public.staff st on st.business_id=s.business_id where s.id=service_id and st.id=staff_id and public.is_business_owner(s.business_id)));

create policy bookings_select on public.bookings for select to authenticated using(client_user_id=(select auth.uid()) or public.is_business_owner(business_id) or public.is_business_staff(business_id) or public.is_admin());
create policy bookings_update on public.bookings for update to authenticated using(client_user_id=(select auth.uid()) or public.is_business_owner(business_id) or public.is_business_staff(business_id) or public.is_admin())
 with check(client_user_id=(select auth.uid()) or public.is_business_owner(business_id) or public.is_business_staff(business_id) or public.is_admin());
create policy bookings_delete on public.bookings for delete to authenticated using(public.is_admin());

create policy crm_select on public.client_crm for select to authenticated using(public.is_business_owner(business_id) or public.is_admin());
create policy crm_insert on public.client_crm for insert to authenticated with check(public.is_business_owner(business_id) or public.is_admin());
create policy crm_update on public.client_crm for update to authenticated using(public.is_business_owner(business_id) or public.is_admin()) with check(public.is_business_owner(business_id) or public.is_admin());
create policy crm_delete on public.client_crm for delete to authenticated using(public.is_business_owner(business_id) or public.is_admin());

create policy notes_select on public.client_notes for select to authenticated using(public.is_business_owner(business_id) or public.is_admin());
create policy notes_insert on public.client_notes for insert to authenticated with check(public.is_business_owner(business_id) or public.is_business_staff(business_id) or public.is_admin());
create policy notes_update on public.client_notes for update to authenticated using(public.is_business_owner(business_id) or author_id=(select auth.uid()) or public.is_admin()) with check(public.is_business_owner(business_id) or author_id=(select auth.uid()) or public.is_admin());
create policy notes_delete on public.client_notes for delete to authenticated using(public.is_business_owner(business_id) or public.is_admin());

create policy favorites_select on public.favorites for select to authenticated using(user_id=(select auth.uid()));
create policy favorites_insert on public.favorites for insert to authenticated with check(user_id=(select auth.uid()));
create policy favorites_update on public.favorites for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy favorites_delete on public.favorites for delete to authenticated using(user_id=(select auth.uid()));

create policy reviews_select on public.reviews for select to anon,authenticated using(true);
create policy reviews_insert on public.reviews for insert to authenticated with check(
 user_id=(select auth.uid()) and exists(select 1 from public.bookings b where b.id=booking_id and b.client_user_id=(select auth.uid()) and b.status='completed' and b.business_id=reviews.business_id));
create policy reviews_update on public.reviews for update to authenticated using(user_id=(select auth.uid()) or public.is_admin()) with check(user_id=(select auth.uid()) or public.is_admin());
create policy reviews_delete on public.reviews for delete to authenticated using(public.is_admin());

create policy kyc_select on public.kyc_requests for select to authenticated using(public.is_admin() or exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=(select auth.uid())));
create policy kyc_insert on public.kyc_requests for insert to authenticated with check(public.is_admin() or exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=(select auth.uid())));
create policy kyc_update on public.kyc_requests for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy kyc_delete on public.kyc_requests for delete to authenticated using(public.is_admin());

create policy moderation_all on public.moderation_tickets for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy audit_select on public.audit_logs for select to authenticated using(public.is_admin());

create policy settings_select on public.platform_settings for select to anon,authenticated using(true);
create policy settings_update on public.platform_settings for update to authenticated using(public.is_admin()) with check(public.is_admin());

create policy business_hours_select on public.business_hours for select to anon,authenticated using(true);
create policy business_hours_write on public.business_hours for all to authenticated using(public.is_admin() or public.is_business_owner(business_id)) with check(public.is_admin() or public.is_business_owner(business_id));
create policy staff_hours_select on public.staff_hours for select to anon,authenticated using(true);
create policy staff_hours_write on public.staff_hours for all to authenticated using(public.is_admin() or public.is_business_owner(business_id)) with check(public.is_admin() or public.is_business_owner(business_id));
create policy blocked_slots_select on public.blocked_slots for select to authenticated using(public.is_admin() or public.is_business_owner(business_id) or public.is_business_staff(business_id));
create policy blocked_slots_write on public.blocked_slots for all to authenticated using(public.is_admin() or public.is_business_owner(business_id)) with check(public.is_admin() or public.is_business_owner(business_id));

-- Performance indexes
create index businesses_owner_idx on public.businesses(owner_id);
create index businesses_public_idx on public.businesses(is_active,is_verified);
create index services_business_idx on public.services(business_id,is_active);
create index staff_business_idx on public.staff(business_id,is_active);
create index staff_user_idx on public.staff(user_id);
create index service_staff_staff_idx on public.service_staff(staff_id);
create index crm_business_idx on public.client_crm(business_id);
create index crm_user_idx on public.client_crm(user_id);
create index notes_business_idx on public.client_notes(business_id);
create index bookings_business_start_idx on public.bookings(business_id,start_at);
create index bookings_client_start_idx on public.bookings(client_user_id,start_at);
create index bookings_staff_start_idx on public.bookings(staff_id,start_at);
create index bookings_status_idx on public.bookings(status);
create index reviews_business_idx on public.reviews(business_id);
create index reviews_staff_idx on public.reviews(staff_id);
create index kyc_business_idx on public.kyc_requests(business_id);
create index moderation_status_idx on public.moderation_tickets(status,priority);
create index audit_created_idx on public.audit_logs(created_at desc);
create index business_hours_idx on public.business_hours(business_id);
create index staff_hours_idx on public.staff_hours(business_id);
create index blocked_business_time_idx on public.blocked_slots(business_id,start_at,end_at);
create index blocked_staff_time_idx on public.blocked_slots(staff_id,start_at,end_at);

-- IMPORTANT:
-- 1. Do not put the Supabase secret/service-role key in the browser.
-- 2. Create Auth users separately; the trigger above creates their profiles.
-- 3. After creating your first admin Auth user, promote that profile to admin
--    from the SQL editor:
--    update public.profiles set role='admin' where email='YOUR_ADMIN_EMAIL';
