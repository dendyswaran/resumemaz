-- Run as the database owner. Every fixture is rolled back, including auth users.
begin;
insert into auth.users (id, email) values
  ('6cebcf0b-bd54-40c5-9f51-2cdf91c92001', 'rls-a@resumemaz.example.invalid'),
  ('6cebcf0b-bd54-40c5-9f51-2cdf91c92002', 'rls-b@resumemaz.example.invalid');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"6cebcf0b-bd54-40c5-9f51-2cdf91c92001","role":"authenticated"}', true);
insert into public.resumes (id, name, document) values
  ('6cebcf0b-bd54-40c5-9f51-2cdf91c93001', 'Owner A', '{"version":1,"basics":{},"summary":""}');

do $$
declare affected integer; current_revision integer;
begin
  if (select count(*) from public.resumes) <> 1 then raise exception 'Owner cannot read own resume'; end if;
  begin
    insert into public.resumes (user_id, name, document) values
      ('6cebcf0b-bd54-40c5-9f51-2cdf91c92002', 'Forged owner', '{"version":1,"basics":{},"summary":""}');
    raise exception 'Ownership forgery succeeded';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.resumes set user_id = '6cebcf0b-bd54-40c5-9f51-2cdf91c92002';
    raise exception 'Ownership transfer succeeded';
  exception when insufficient_privilege then null;
  end;
  update public.resumes set name = 'Updated A' where id = '6cebcf0b-bd54-40c5-9f51-2cdf91c93001' and revision = 1 returning revision into current_revision;
  if current_revision <> 2 then raise exception 'Revision was not advanced'; end if;
  update public.resumes set name = 'Stale update' where id = '6cebcf0b-bd54-40c5-9f51-2cdf91c93001' and revision = 1;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Stale update replaced new work'; end if;
  begin
    insert into public.resumes(name, document) values ('Invalid document', '{}');
    raise exception 'Invalid document accepted';
  exception when check_violation then null;
  end;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"6cebcf0b-bd54-40c5-9f51-2cdf91c92002","role":"authenticated"}', true);
do $$
declare affected integer;
begin
  if (select count(*) from public.resumes) <> 0 then raise exception 'User B read User A resume'; end if;
  update public.resumes set name = 'Cross-user update' where id = '6cebcf0b-bd54-40c5-9f51-2cdf91c93001';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'User B updated User A resume'; end if;
end;
$$;
insert into public.resumes(name, document) values ('Owner B', '{"version":1,"basics":{},"summary":""}');

select set_config('request.jwt.claims', '{"sub":"6cebcf0b-bd54-40c5-9f51-2cdf91c92001","role":"authenticated"}', true);
do $$
begin
  if (select count(*) from public.resumes) <> 1 then raise exception 'User A can see another user resume'; end if;
  update public.resumes set deleted_at = now() where id = '6cebcf0b-bd54-40c5-9f51-2cdf91c93001' and revision = 2;
  if (select count(*) from public.resumes where deleted_at is not null) <> 1 then raise exception 'Trash did not retain the document'; end if;
  update public.resumes set deleted_at = null where id = '6cebcf0b-bd54-40c5-9f51-2cdf91c93001' and revision = 3;
  if (select revision from public.resumes where id = '6cebcf0b-bd54-40c5-9f51-2cdf91c93001') <> 4 then raise exception 'Restore failed'; end if;
end;
$$;
set local role anon;
do $$
begin
  begin
    perform count(*) from public.resumes;
    raise exception 'Anonymous client can access resumes';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;
rollback;
select 'PASS: owner isolation, forged ownership, revisions, stale writes, document validation, trash/restore, and anonymous access' as verification;
