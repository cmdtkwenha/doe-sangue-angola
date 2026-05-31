alter table public.hospital_inventory
  add column if not exists minimum_threshold integer,
  add column if not exists critical_threshold integer;

update public.hospital_inventory
set minimum_threshold = coalesce(minimum_threshold, safe_minimum, 5),
    critical_threshold = coalesce(critical_threshold, greatest(1, floor(coalesce(safe_minimum, 5) / 2)::integer))
where minimum_threshold is null
   or critical_threshold is null;

alter table public.hospital_inventory
  alter column minimum_threshold set default 5,
  alter column critical_threshold set default 2;

alter table public.hospital_inventory
  drop constraint if exists hospital_inventory_thresholds_check,
  add constraint hospital_inventory_thresholds_check
    check (minimum_threshold >= 0 and critical_threshold >= 0 and critical_threshold <= minimum_threshold);

alter table public.inventory_movements
  drop constraint if exists inventory_movements_type_check,
  add constraint inventory_movements_type_check
    check (movement_type in (
      'donation_received',
      'stock_added',
      'stock_consumed',
      'stock_expired',
      'manual_adjustment'
    ));

create index if not exists hospital_inventory_threshold_idx
  on public.hospital_inventory(hospital_id, blood_type, minimum_threshold, critical_threshold);
