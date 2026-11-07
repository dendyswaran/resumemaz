# Supabase integration

Project: **Resumemaz**, ref `ygovigmjlwghipczxxyy`, organization `dendyswaran's Org`, region Singapore (`ap-southeast-1`).

[Project dashboard](https://supabase.com/dashboard/project/ygovigmjlwghipczxxyy) · [Auth URL Configuration](https://supabase.com/dashboard/project/ygovigmjlwghipczxxyy/auth/url-configuration)

## Configuration

The ignored local `.env` contains `PUBLIC_SUPABASE_URL` and an enabled publishable key retrieved from this project. Copy `.env.example` for a new checkout. These are browser-facing configuration values; never add a secret/service-role key to public environment variables. The SDK version is pinned and `bun.lock` is tracked.

`bun run dev` uses `http://localhost:3000`, matching Supabase's default Site URL. For a hosted release, configure the production Site URL and exact allowed redirect URLs in Supabase Auth, then supply both `PUBLIC_SUPABASE_*` variables to the build host. Email confirmation and password-recovery links return to the app origin. Changing these settings is required before using a different origin; the build alone does not configure hosted Auth URLs.

The static Astro page remains public. The browser SDK manages the authenticated session; ownership is enforced by the database for every request. The app does not trust browser session data as a substitute for database authorization. Email confirmation remains enabled on the hosted project. No real signup or password-recovery email has been sent during QA.

## Saving model

- Anonymous editing and PDF export remain available. Local changes autosave to `resumemaz:v1`.
- Signing in leaves local content unchanged. **Save online** explicitly sends the current document to the signed-in user's private account.
- Save creates a document or updates the attached document at its expected revision. First-insert retries reuse a client-generated UUID so an acknowledged retry does not create duplicate copies.
- **My resumes** lists saved copies, 50 at a time, with Load more. Open asks before replacing the editor and offers Undo afterward. Rename through the Resume name field and save. **Save as new copy** creates a separate record; **Work on a local copy** detaches the current record.
- A small account-scoped reference stores the document ID, last-known revision, and SHA-256 document fingerprint. It survives reloads without copying the resume a second time or silently loading remote content. It retains the original revision, so a later stale save is still rejected.
- Import, Start blank, and Undo of a document replacement detach the reference. Signing out hides online data and leaves the local draft on the device. On a shared device, clear/reset the local draft before leaving.
- Trash is recoverable. No user-facing permanent delete or account-delete action is implemented. Trashed rows remain private and can be restored. Deleting an auth user administratively cascades their resumes.
- Photos remain embedded in the private resume JSON, so preview and PDF require no public image URLs or separate Storage permissions. Online documents are limited to approximately 4.9 MB before upload, with a 5 MB database guard. A separate private image bucket can be introduced if needed later.

## Database

The applied migration is tracked as `supabase/migrations/20261107011750_create_private_resumes.sql`. The filename matches the version reported by Supabase migration history; the initial local file was created with the CLI and aligned with the returned hosted version.

`public.resumes` contains `id`, `user_id`, `name`, a versioned JSONB `document`, `revision`, timestamps, and nullable `deleted_at`. An index covers owner, trash status, and update order.

Row-level security restricts SELECT/INSERT/UPDATE to the authenticated owner. Inserts derive ownership from `auth.uid()`. UPDATE has both USING and WITH CHECK ownership predicates. Anonymous clients have no table privileges; authenticated clients have no direct DELETE privilege. A security-invoker trigger keeps identity/ownership immutable and advances revision/update time. The trigger function has an empty search path and no public execute grant.

Updates, trash, and restore include a revision predicate. A zero-row result reports a conflict. The app never retries a stale update without that predicate. Open the latest online copy or save the current local work as a new resume.

## Verification

`supabase/tests/resume_access.sql` runs in a transaction, creates two synthetic users, verifies owner isolation, rejects forged ownership and cross-user writes, verifies revision advancement and stale-update rejection, checks document validation and trash/restore, then rolls back all fixtures. It was executed successfully against this project.

Bun tests cover validated document serialization, expected-revision requests, conflict errors, retry IDs, account-scoped reload references, malformed online documents, safe error messages, legacy migration, and local storage preservation. Browser QA uses a temporary synthetic account created directly for testing without email delivery; the account, session, and test resumes are removed afterward.

Browser checks cover sign-in, save/update, reload persistence, conflicts, reopening, Trash/restore, sign-out, error states, responsive layout, and PDF export from online content. Email delivery, real-user signup confirmation, and password-reset completion require a real inbox and remain unverified. Before public release, configure your own SMTP delivery and test both email flows on the deployed origin; Supabase's built-in email service has restrictions and is intended for testing. See [email service documentation](https://supabase.com/docs/guides/auth/auth-smtp).

The integration does not deploy the website or change the existing Vercel publication.
