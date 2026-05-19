-- Minimal production-style seed for the required Doe Sangue Angola tables.
-- Create matching Supabase Auth users first, then update auth_user_id values.

insert into public.users (id, role, name, email, phone)
values
  ('00000000-0000-0000-0000-000000000001', 'admin', 'Admin Nacional', 'admin@sangueangola.ao', '+244 923 000 001'),
  ('00000000-0000-0000-0000-000000000002', 'hospital', 'Dr. João Mendes', 'hospital@sangueangola.ao', '+244 923 000 118'),
  ('00000000-0000-0000-0000-000000000003', 'donor', 'Maria João Santos', 'donor@sangueangola.ao', '+244 923 456 789')
on conflict (email) do update
set role = excluded.role,
    name = excluded.name,
    phone = excluded.phone;

insert into public.hospitals (
  id, user_id, name, facility_type, province, municipality,
  address, contact, email, license_number, verified, capacity
)
values (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'Hospital Geral de Luanda',
  'Hospital',
  'Luanda',
  'Kilamba Kiaxi',
  'Luanda',
  '+244 923 000 118',
  'hospital@sangueangola.ao',
  'HGL-001',
  true,
  84
)
on conflict (name, province, municipality) do update
set user_id = excluded.user_id,
    verified = excluded.verified,
    contact = excluded.contact,
    email = excluded.email,
    license_number = excluded.license_number;

insert into public.donors (
  id, user_id, blood_type, province, municipality,
  birth_date, available, last_donation, points, preferred_hospital_id
)
values (
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000003',
  'O-',
  'Luanda',
  'Talatona',
  '1994-05-12',
  true,
  '2026-01-18',
  1280,
  '10000000-0000-0000-0000-000000000001'
)
on conflict (user_id) do update
set blood_type = excluded.blood_type,
    province = excluded.province,
    municipality = excluded.municipality,
    birth_date = excluded.birth_date,
    available = excluded.available,
    points = excluded.points;

insert into public.blood_requests (
  id, hospital_id, patient_code, blood_type, units, urgency, status
)
values (
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'PAC-4821',
  'O-',
  4,
  'Critica',
  'Aberto'
)
on conflict (id) do update
set status = excluded.status,
    units = excluded.units,
    urgency = excluded.urgency;

insert into public.appointments (
  donor_id, hospital_id, blood_request_id, date, time, pin, status
)
values (
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  current_date,
  '09:30',
  '4821',
  'Confirmado'
);

insert into public.notifications (user_id, title, body, type, read)
values (
  '00000000-0000-0000-0000-000000000003',
  'Pedido urgente',
  'Pedido urgente O- perto de si.',
  'request',
  false
);

insert into public.rewards (donor_id, points, reason, tier)
values ('20000000-0000-0000-0000-000000000001', 120, 'Doação concluída', 'Ouro');

insert into public.audit_logs (actor_label, action)
values
  ('Sistema', 'Seed inicial aplicado'),
  ('Hospital Geral de Luanda', 'Pedido O- criado para teste');

insert into public.fraud_reviews (blood_request_id, risk, status, flags)
values ('30000000-0000-0000-0000-000000000001', 'baixo', 'Resolvido', '{}');
