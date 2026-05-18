-- Development seed. Safe to run more than once.

insert into public.users (id, role, name, email, phone) values
  ('00000000-0000-0000-0000-000000000001', 'admin', 'Admin Nacional', 'admin@sangueangola.ao', '+244 923 000 001'),
  ('00000000-0000-0000-0000-000000000002', 'hospital', 'Dr. João Mendes', 'hospital@sangueangola.ao', '+244 923 000 118'),
  ('00000000-0000-0000-0000-000000000003', 'donor', 'Maria João Santos', 'donor@sangueangola.ao', '+244 923 456 789')
on conflict (email) do update set
  name = excluded.name,
  phone = excluded.phone,
  role = excluded.role;

insert into public.hospitals (
  id, user_id, name, province, municipality, verified, capacity, contact
) values (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'Hospital Geral de Luanda',
  'Luanda',
  'Kilamba Kiaxi',
  true,
  84,
  '+244 923 000 118'
) on conflict (id) do update set
  name = excluded.name,
  verified = excluded.verified,
  capacity = excluded.capacity;

insert into public.donors (
  id, user_id, blood_type, province, municipality, available,
  last_donation, points, preferred_hospital_id
) values (
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000003',
  'O-',
  'Luanda',
  'Talatona',
  true,
  '2026-01-18',
  1280,
  '10000000-0000-0000-0000-000000000001'
) on conflict (id) do update set
  points = excluded.points,
  available = excluded.available;

insert into public.blood_requests (
  id, hospital_id, patient_code, blood_type, units, urgency, status
) values (
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'PAC-4821',
  'O-',
  4,
  'Critica',
  'Aberto'
) on conflict (id) do update set status = excluded.status;

insert into public.notifications (user_id, title, body, type, read) values
  ('00000000-0000-0000-0000-000000000003', 'Pedido urgente', 'Pedido urgente O- perto de si.', 'urgent', false)
on conflict do nothing;

insert into public.audit_logs (actor_label, action) values
  ('Sistema', 'Seed de desenvolvimento aplicado')
on conflict do nothing;
