-- Creates production profiles automatically when Supabase Auth users sign up.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text := coalesce(new.raw_user_meta_data->>'role', 'donor');
  requested_name text := coalesce(new.raw_user_meta_data->>'name', new.email);
  profile_id uuid;
begin
  if requested_role not in ('admin', 'hospital', 'donor') then
    requested_role := 'donor';
  end if;

  insert into public.profiles (auth_user_id, role, name, email)
  values (new.id, requested_role, requested_name, new.email)
  on conflict (auth_user_id) do update
    set role = excluded.role,
        name = excluded.name,
        email = excluded.email
  returning id into profile_id;

  if requested_role = 'donor' then
    insert into public.donors (
      auth_user_id,
      user_id,
      full_name,
      email,
      phone,
      blood_type,
      province,
      municipality,
      available,
      eligibility_status,
      total_donations
    )
    values (
      new.id,
      profile_id,
      requested_name,
      new.email,
      '',
      'O+',
      '',
      '',
      true,
      'Pendente',
      0
    )
    on conflict (auth_user_id) do nothing;

    update public.profiles p
    set linked_entity_id = d.id
    from public.donors d
    where d.auth_user_id = new.id
      and p.auth_user_id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();
