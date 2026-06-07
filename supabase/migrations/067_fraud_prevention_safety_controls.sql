-- Fraud prevention and safety controls for pilot operations.
-- Adds detection fields and DB guards without deleting existing data.

alter table public.donors add column if not exists bi_number text;
alter table public.hospitals add column if not exists nif text;

alter table public.fraud_reviews
  add column if not exists entity_type text,
  add column if not exists entity_id uuid,
  add column if not exists score integer not null default 0,
  add column if not exists flags text[] not null default '{}',
  add column if not exists updated_at timestamptz not null default now();

create index if not exists donors_bi_number_idx on public.donors(bi_number) where bi_number is not null;
create index if not exists donors_phone_idx on public.donors(phone) where phone is not null;
create index if not exists donors_emergency_phone_idx on public.donors(emergency_contact_phone) where emergency_contact_phone is not null;
create index if not exists donors_birth_date_idx on public.donors(birth_date) where birth_date is not null;
create index if not exists hospitals_nif_idx on public.hospitals(nif) where nif is not null;
create index if not exists hospitals_license_number_idx on public.hospitals(license_number) where license_number is not null;
create index if not exists hospitals_institutional_email_idx on public.hospitals(institutional_email) where institutional_email is not null;
create index if not exists hospitals_phone_idx on public.hospitals(phone) where phone is not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'fraud_reviews_score_range_check') then
    alter table public.fraud_reviews
      add constraint fraud_reviews_score_range_check
      check (score between 0 and 100)
      not valid;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'hospital_inventory_reasonable_units_check') then
    alter table public.hospital_inventory
      add constraint hospital_inventory_reasonable_units_check
      check (
        units_available >= 0
        and minimum_threshold >= 0
        and critical_threshold >= 0
        and units_available <= 10000
      )
      not valid;
  end if;
end $$;

create or replace function public.prevent_duplicate_active_blood_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status in ('Aberto', 'Em Correspondência', 'Dador a Caminho', 'PIN Validado')
     and exists (
       select 1
       from public.blood_requests existing
       where existing.id <> new.id
         and existing.hospital_id = new.hospital_id
         and existing.blood_type = new.blood_type
         and coalesce(existing.province, '') = coalesce(new.province, '')
         and coalesce(existing.municipality, '') = coalesce(new.municipality, '')
         and existing.status in ('Aberto', 'Em Correspondência', 'Dador a Caminho', 'PIN Validado')
     ) then
    raise exception 'Já existe um pedido ativo semelhante para este hospital.';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_duplicate_active_blood_request_trigger on public.blood_requests;
create trigger prevent_duplicate_active_blood_request_trigger
before insert or update of hospital_id, blood_type, province, municipality, status
on public.blood_requests
for each row execute function public.prevent_duplicate_active_blood_request();

create or replace function public.prevent_pin_reuse_after_final_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status in ('Doação concluída', 'Cancelado', 'Não Compareceu')
     and new.confirmation_pin <> old.confirmation_pin then
    raise exception 'PIN finalizado não pode ser reutilizado ou alterado.';
  end if;
  if old.donor_id <> new.donor_id or old.blood_request_id <> new.blood_request_id or old.hospital_id <> new.hospital_id then
    raise exception 'Aceitação não pode mudar de dador, pedido ou hospital.';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_pin_reuse_after_final_status_trigger on public.donor_responses;
create trigger prevent_pin_reuse_after_final_status_trigger
before update on public.donor_responses
for each row execute function public.prevent_pin_reuse_after_final_status();
