-- Seed data mirrors the current mock dataset for first Supabase demos.

insert into public.users (id, role, name, email, phone) values
  ('00000000-0000-0000-0000-000000000001', 'admin', 'Admin Nacional', 'admin@sangueangola.ao', '+244 923 000 001'),
  ('00000000-0000-0000-0000-000000000002', 'hospital', 'Dr. João Mendes', 'hospital@sangueangola.ao', '+244 923 000 118'),
  ('00000000-0000-0000-0000-000000000003', 'donor', 'Maria João Santos', 'dador@sangueangola.ao', '+244 923 456 789');

insert into public.hospitals (
  id, user_id, name, province, municipality, verified, capacity, contact
) values
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'Hospital Geral de Luanda',
    'Luanda',
    'Kilamba Kiaxi',
    true,
    84,
    '+244 923 000 118'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    null,
    'Clínica Girassol',
    'Luanda',
    'Ingombota',
    true,
    42,
    '+244 923 000 219'
  );

insert into public.donors (
  id, user_id, blood_type, province, municipality, available,
  last_donation, points, preferred_hospital_id
) values
  (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    'O-',
    'Luanda',
    'Talatona',
    true,
    '2026-01-18',
    1280,
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    null,
    'O+',
    'Luanda',
    'Cazenga',
    true,
    '2025-11-14',
    1510,
    '10000000-0000-0000-0000-000000000001'
  );

insert into public.blood_requests (
  id, hospital_id, patient_code, blood_type, units, urgency, status, created_at
) values
  (
    '30000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'PAC-4821',
    'O-',
    4,
    'Critica',
    'Aberto',
    '2026-05-12T08:30:00Z'
  );

insert into public.appointments (
  donor_id, hospital_id, blood_request_id, date, time, pin, status
) values
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '2026-05-12',
    '09:30',
    '4821',
    'Confirmado'
  );

insert into public.notifications (user_id, title, body, type, read) values
  ('00000000-0000-0000-0000-000000000003', 'Falta de sangue', 'Há falta de O- em Luanda.', 'stock', false),
  ('00000000-0000-0000-0000-000000000003', 'Elegibilidade', 'Já pode doar novamente.', 'eligibility', true);

insert into public.rewards (donor_id, points, reason, tier) values
  ('20000000-0000-0000-0000-000000000001', 120, 'Doação concluída', 'Ouro');

insert into public.referrals (referrer_donor_id, invited_name, status, reward_points) values
  ('20000000-0000-0000-0000-000000000001', 'João Paulo', 'Concluiu cadastro', 250),
  ('20000000-0000-0000-0000-000000000001', 'Carlos Manuel', 'Pendente', 0);

insert into public.family_emergency_requests (
  requester_name, relationship, contact_phone, blood_type,
  hospital_location, units, time_urgency, status
) values
  ('Maria João Santos', 'Filha do paciente', '+244 923 456 789', 'O-', 'Hospital Geral de Luanda', 4, 'Precisa até 14:30', 'Verificado');

insert into public.audit_logs (actor_label, action) values
  ('Hospital Geral de Luanda', 'Criou pedido crítico O-'),
  ('matchingAgent', 'Recomendou dadores compatíveis'),
  ('rewardAgent', 'Adicionou pontos após doação');

insert into public.fraud_reviews (blood_request_id, risk, status, flags) values
  ('30000000-0000-0000-0000-000000000001', 'baixo', 'Resolvido', '{}');
