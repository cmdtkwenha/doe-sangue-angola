-- Seed pilot public records after creating matching Supabase Auth users.
-- Required Auth emails:
-- admin@pilot.doesangue.ao, hospital@pilot.doesangue.ao,
-- dador1@pilot.doesangue.ao ... dador5@pilot.doesangue.ao

begin;

insert into public.hospitals (name, facility_type, province, municipality, address, phone, email, license_number, verified)
values (
  'Hospital Piloto Luanda',
  'Hospital',
  'Luanda',
  'Luanda',
  'Unidade piloto Doe Sangue Angola',
  '+244 900 000 001',
  'hospital@pilot.doesangue.ao',
  'PILOT-LDA-001',
  true
)
on conflict (name, province, municipality) do update
set verified = true,
    email = excluded.email,
    phone = excluded.phone;

insert into public.users (auth_user_id, role, name, email, phone)
select au.id, 'admin', 'Admin Piloto', au.email, '+244 900 000 000'
from auth.users au
where au.email = 'admin@pilot.doesangue.ao'
on conflict (email) do update
set auth_user_id = excluded.auth_user_id,
    role = excluded.role,
    name = excluded.name;

insert into public.users (auth_user_id, role, name, email, phone)
select au.id, 'hospital', 'Hospital Piloto Luanda', au.email, '+244 900 000 001'
from auth.users au
where au.email = 'hospital@pilot.doesangue.ao'
on conflict (email) do update
set auth_user_id = excluded.auth_user_id,
    role = excluded.role,
    name = excluded.name;

insert into public.profiles (auth_user_id, role, linked_entity_id, name, email, phone)
select au.id, 'admin', u.id, u.name, u.email, u.phone
from auth.users au
join public.users u on u.email = au.email
where au.email = 'admin@pilot.doesangue.ao'
on conflict (auth_user_id) do update
set role = excluded.role,
    linked_entity_id = excluded.linked_entity_id,
    name = excluded.name;

insert into public.profiles (auth_user_id, role, linked_entity_id, name, email, phone)
select au.id, 'hospital', h.id, 'Hospital Piloto Luanda', au.email, '+244 900 000 001'
from auth.users au
cross join public.hospitals h
where au.email = 'hospital@pilot.doesangue.ao'
  and h.email = 'hospital@pilot.doesangue.ao'
on conflict (auth_user_id) do update
set role = excluded.role,
    linked_entity_id = excluded.linked_entity_id,
    name = excluded.name;

with pilot_donors(email, name, blood_type, municipality, phone) as (
  values
    ('dador1@pilot.doesangue.ao', 'Ana Piloto', 'O-', 'Luanda', '+244 900 000 011'),
    ('dador2@pilot.doesangue.ao', 'Maria Piloto', 'O+', 'Viana', '+244 900 000 012'),
    ('dador3@pilot.doesangue.ao', 'João Piloto', 'A+', 'Talatona', '+244 900 000 013'),
    ('dador4@pilot.doesangue.ao', 'Paulo Piloto', 'B+', 'Cazenga', '+244 900 000 014'),
    ('dador5@pilot.doesangue.ao', 'Teresa Piloto', 'AB+', 'Belas', '+244 900 000 015')
)
insert into public.users (auth_user_id, role, name, email, phone)
select au.id, 'donor', pd.name, pd.email, pd.phone
from pilot_donors pd
join auth.users au on au.email = pd.email
on conflict (email) do update
set auth_user_id = excluded.auth_user_id,
    role = excluded.role,
    name = excluded.name,
    phone = excluded.phone;

with pilot_donors(email, name, blood_type, municipality, phone) as (
  values
    ('dador1@pilot.doesangue.ao', 'Ana Piloto', 'O-', 'Luanda', '+244 900 000 011'),
    ('dador2@pilot.doesangue.ao', 'Maria Piloto', 'O+', 'Viana', '+244 900 000 012'),
    ('dador3@pilot.doesangue.ao', 'João Piloto', 'A+', 'Talatona', '+244 900 000 013'),
    ('dador4@pilot.doesangue.ao', 'Paulo Piloto', 'B+', 'Cazenga', '+244 900 000 014'),
    ('dador5@pilot.doesangue.ao', 'Teresa Piloto', 'AB+', 'Belas', '+244 900 000 015')
)
insert into public.donors (user_id, auth_user_id, full_name, email, phone, blood_type, province, municipality, eligibility_status, available)
select u.id, au.id, pd.name, pd.email, pd.phone, pd.blood_type, 'Luanda', pd.municipality, 'Elegível', true
from pilot_donors pd
join public.users u on u.email = pd.email
join auth.users au on au.email = pd.email
on conflict (user_id) do update
set full_name = excluded.full_name,
    phone = excluded.phone,
    blood_type = excluded.blood_type,
    province = excluded.province,
    municipality = excluded.municipality,
    available = true;

insert into public.profiles (auth_user_id, role, linked_entity_id, name, email, phone)
select au.id, 'donor', d.id, d.full_name, d.email, d.phone
from public.donors d
join auth.users au on au.email = d.email
where d.email like '%@pilot.doesangue.ao'
on conflict (auth_user_id) do update
set role = excluded.role,
    linked_entity_id = excluded.linked_entity_id,
    name = excluded.name,
    phone = excluded.phone;

commit;
