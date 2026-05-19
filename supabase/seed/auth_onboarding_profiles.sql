-- Run after creating Supabase Auth users with these emails.
-- It links public profiles and legacy users to auth.users by email.

insert into public.profiles (auth_user_id, role, name, email, phone)
select id, 'admin', 'Admin Nacional', email, '+244 923 000 001'
from auth.users
where email = 'admin@sangueangola.ao'
on conflict (email) do update set
  auth_user_id = excluded.auth_user_id,
  name = excluded.name,
  phone = excluded.phone,
  role = excluded.role;

insert into public.profiles (auth_user_id, role, name, email, phone)
select id, 'hospital', 'Dr. João Mendes', email, '+244 923 000 118'
from auth.users
where email = 'hospital@sangueangola.ao'
on conflict (email) do update set
  auth_user_id = excluded.auth_user_id,
  name = excluded.name,
  phone = excluded.phone,
  role = excluded.role;

insert into public.profiles (auth_user_id, role, name, email, phone)
select id, 'donor', 'Maria João Santos', email, '+244 923 456 789'
from auth.users
where email = 'donor@sangueangola.ao'
on conflict (email) do update set
  auth_user_id = excluded.auth_user_id,
  name = excluded.name,
  phone = excluded.phone,
  role = excluded.role;

insert into public.users (id, auth_user_id, role, name, email, phone)
select id, auth_user_id, role, name, email, phone
from public.profiles
where email in (
  'admin@sangueangola.ao',
  'hospital@sangueangola.ao',
  'donor@sangueangola.ao'
)
on conflict (email) do update set
  auth_user_id = excluded.auth_user_id,
  name = excluded.name,
  phone = excluded.phone,
  role = excluded.role;

insert into public.hospitals (
  user_id, name, province, municipality, verified, capacity, contact
)
select u.id, 'Hospital Geral de Luanda', 'Luanda', 'Kilamba Kiaxi', true, 84, '+244 923 000 118'
from public.users u
where u.email = 'hospital@sangueangola.ao'
on conflict do nothing;

insert into public.donors (
  user_id, blood_type, province, municipality, available, last_donation, points
)
select u.id, 'O-', 'Luanda', 'Talatona', true, '2026-01-18', 1280
from public.users u
where u.email = 'donor@sangueangola.ao'
on conflict do nothing;
