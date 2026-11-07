# Online workspace review

Date: 2026-11-07. Scope: Supabase integration on `/`. Modes: interaction, surface, and finish, extending the existing Carbon design.

## Implemented

A compact online workspace separates optional account access and explicit online saves from existing local autosave. Carbon modals provide sign-in, signup, password-reset requests, password-recovery completion, and a saved-resume library. The library supports opening with confirmation, renaming through the current document, creating a separate copy, and recoverable Trash/restore.

The editor retains the same eight sections, live preview, JSON backups, photo support, and PDF download. Imported or reset drafts detach from their online record. Undo of a document replacement also detaches, preventing accidental replacement of the previously opened online record. An unreadable local draft disables online saving until the user resolves it or intentionally opens/replaces a document.

## Browser evidence

- Reviewed wide (1440 px), intermediate (768 px), and phone (390 px) layouts. No page overflow was measured. Modal layouts fit the viewport; saved-resume actions wrap on phones. Section navigation and document zoom keep their deliberate internal scrolling.
- Used a temporary synthetic account to sign in against the real project, create a resume, update it, open it, create a separate copy, move/restore a record through Trash, and sign out. No confirmation or reset emails were sent.
- A database update simulated another device. The stale browser save displayed a conflict and preserved local edits. Opening the latest copy required confirmation and provided Undo.
- Reload preserved both the local content and the account-scoped online document reference. The stored reference retains the last-known revision instead of fetching a newer revision and silently enabling an overwrite.
- Verified a WebP photo was stored in the private online document, then reopened from the online library. PDF download after save/reload contained one embedded image, selectable text, and a clickable link. The exported page was rendered and inspected.
- Verified sign-out leaves local content intact. An incorrect password produced a clear inline error. Signup and reset screens were inspected without sending email. Email-delivery and recovery-completion flows remain unverified pending SMTP.
- Desktop and phone login screenshots were saved locally as `artifacts/supabase-login-desktop.png` and `artifacts/supabase-login-mobile.png`.
- Signed out, removed the temporary account and its two online resumes, confirmed zero remaining fixtures, and reset the test draft through the UI. No real account or resume was used in testing.

## Data and checks

The ownership SQL test passed for two users and an anonymous client, including forged ownership, cross-user writes, stale revisions, validation, and trash/restore. Its transaction rolls back all fixtures. Supabase security and performance advisors returned no findings.

`bun run check`: zero diagnostics. `bun test`: 16 tests, 61 assertions passed. `bun run build`: passed. `git diff --check`: passed. The existing deferred PDF engine still produces the large-chunk warning; it is loaded when exporting.

## Design decisions and limits

- The local-save indicator continues to say “Saved in this browser.” The separate online status indicates attachment and whether the document has changed since its last online save. Further edits require an explicit Save online action.
- Signing in never chooses a remote resume or uploads local work automatically. Open and replacement require an explicit choice; failure and conflict messages preserve recovery options.
- The optional online workspace adds vertical space on phones. Controls remain readable and available, with no essential actions hidden to avoid overflow.
- Only the available Chromium-based browser was exercised. Other browsers and assistive technology remain unverified.
- SMTP is explicitly postponed by the user. Public email signup and recovery delivery must wait for a mail provider; hosted email verification was not disabled to bypass this requirement.
- Hosted Auth redirect URLs must be configured for the deployment's actual origin. This task keeps the website local and applies the database migration to the dedicated Supabase project.
