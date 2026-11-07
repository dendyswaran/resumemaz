# Resumemaz design brief

Date: 2026-11-07

Purpose: Create a simple professional resume and download a PDF. Future phase: authenticated Supabase storage.

Audience: People preparing job applications; no account is required in the current phase.

Primary task: Enter career details, review the resume, export a readable document. Backup/import supports moving a draft between browsers.

Direction: An editorial workspace using IBM Carbon. Dark utility header, white editing surface, blue active states, disciplined rules, IBM Plex Sans and Mono. The document itself is the focal point; no stock imagery or decorative marketing cards.

Composition: Persistent section navigation, focused editor, and live document on desktop. Edit/Preview switch and horizontally scrollable section navigation on phones. Document zoom provides a readable view at small widths.

Technical constraints: Latest stable Astro and Bun; React island for interactive state and Carbon components. Local fonts. Lazy-loaded PDF renderer. Existing eight content sections, optional profile photo and date of birth retained. Legacy rich-text HTML is migrated to plain text with line breaks; highlights use one bullet per line.

Data: Versioned schema, validated JSON imports, local autosave, and a separate explicit online save through Supabase. Signing in leaves the editor unchanged. Open requires confirmation, replacements support Undo, and online records can be restored from Trash. Preserve unreadable local data until intentional replacement. Show local changes and online save status separately.

Online phase (2026-11-07): Add a compact workspace bar above the editor, Carbon authentication modals, and an account library. Keep the existing restrained blue/gray composition. Handle loading, authentication errors, expired links, network errors, and stale revisions without losing local work. Email/password signup and recovery use the same static app origin. Supabase ownership policies protect each account's resumes.

Reference: User requested Carbon React Storybook and the design skill for all design/review work. Repository and deployed legacy UI were inspected before implementation.
