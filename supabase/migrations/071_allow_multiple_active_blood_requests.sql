-- Allow hospitals to create multiple active requests for the same blood type.
-- This removes the old duplicate-active-request guard without touching data.

drop trigger if exists prevent_duplicate_active_blood_request_trigger on public.blood_requests;
drop function if exists public.prevent_duplicate_active_blood_request();
