create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 200),
  document jsonb not null check ((
    jsonb_typeof(document) = 'object'
    and document ->> 'version' = '1'
    and jsonb_typeof(document -> 'basics') = 'object'
    and jsonb_typeof(document -> 'summary') = 'string'
    and octet_length(document::text) <= 5000000
  ) is true),
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index resumes_owner_updated_idx on public.resumes (user_id, deleted_at, updated_at desc);
alter table public.resumes enable row level security;

revoke all on public.resumes from anon, authenticated;
grant select, insert, update on public.resumes to authenticated;

create policy "Owners can read their resumes" on public.resumes
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Owners can create their resumes" on public.resumes
  for insert to authenticated with check ((select auth.uid()) = user_id and revision = 1);
create policy "Owners can update their resumes" on public.resumes
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create function public.prepare_resume_update() returns trigger
  language plpgsql security invoker set search_path = '' as $$
begin
  if new.id is distinct from old.id or new.user_id is distinct from old.user_id
      or new.created_at is distinct from old.created_at then
    raise exception 'Resume ownership and identity cannot be changed' using errcode = '42501';
  end if;
  new.revision := old.revision + 1;
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.prepare_resume_update() from public, anon, authenticated;
create trigger prepare_resume_update before update on public.resumes
  for each row execute function public.prepare_resume_update();

comment on table public.resumes is 'Private versioned resume documents; deleted_at is a recoverable trash marker.';
