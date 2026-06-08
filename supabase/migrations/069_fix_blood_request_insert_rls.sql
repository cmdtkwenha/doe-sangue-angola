drop policy if exists "Requests verified hospital insert" on public.blood_requests;
drop policy if exists "Requests hospital insert linked profile" on public.blood_requests;
drop policy if exists "Hospitals create own requests" on public.blood_requests;

create policy "Requests verified hospital insert" on public.blood_requests
for insert
with check (
  public.is_admin()
  or (
    status = 'Aberto'
    and hospital_id is not null
    and created_by = auth.uid()
    and exists (
      select 1
      from public.users u
      join public.hospitals h on h.id = blood_requests.hospital_id
      where (u.auth_user_id = auth.uid() or u.id = auth.uid())
        and u.role = 'hospital'
        and u.account_status = 'Ativo'
        and u.linked_entity_id = blood_requests.hospital_id
        and h.verified = true
        and coalesce(h.verification_status, h.status) = 'Verificado'
    )
  )
);
