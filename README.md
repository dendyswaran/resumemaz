# Resumemaz

A focused resume builder with a Carbon editing workspace, live document preview, and PDF downloads. Edit without an account, or sign in to save private online copies with Supabase. Local edits save in the browser; online saves happen when you choose **Save online**.

## Run locally

Install Bun 1.4.4 or newer, then:

```sh
bun install --frozen-lockfile
# Copy .env.example to .env and add the project's publishable key for online saving.
bun run dev
```

Open `http://localhost:3000`. This origin matches Supabase's default email-confirmation redirect. Scripts explicitly use Bun. Astro also declares Node 22.23.4+ support when using Node-based tooling or hosting build systems. The local `.env` is configured for the Resumemaz project and excluded from Git; a checkout without environment variables still supports local editing and PDF export.

```sh
bun run check    # Astro and strict TypeScript validation
bun test         # Document validation, legacy migration, and persistence tests
bun run build   # Static production output in dist/
bun run preview # Serve the production build locally
```

## Stack

- Astro 7.4.7 with the official React integration; one immediately hydrated React island for the editor.
- Bun 1.4.4 for dependency management, scripts, and tests; reproducible `bun.lock`.
- React 19.3.1 and Carbon React 1.120.0, with only the necessary Carbon Sass components.
- Locally bundled IBM Plex fonts, strict TypeScript, and Zod validation.
- Supabase JS 2.119.0 for email/password authentication and private online resumes, with database ownership policies and revision checks.
- A lazy-loaded React PDF renderer for selectable text, clickable links, automatic pagination, A4/Letter, and embedded fonts. The PDF renderer is downloaded only when exporting.

Versions were checked against the stable npm registry on November 7, 2026, then pinned. TypeScript remains at 6.0.3 because the current Astro checker does not support TypeScript 7. Bun intentionally skips dependency telemetry postinstall scripts; no lifecycle-script approval is required to build this project.

## Editing and saving

The eight sections are personal details, professional summary, experience, education, skills, projects, certifications, and links. Photos and dates of birth are optional. New visitors see a clearly identified example; edit it or choose **Start blank**. After editing, changes save automatically. The phone layout offers separate Edit and Preview views. Preview zoom supports reading the document on smaller screens.

**Export PDF** downloads the resume directly. The live preview is a continuous scaled document; PDF page boundaries and wrapping are determined by the PDF renderer.

**Backup** downloads an editable JSON document. **Import** validates and confirms a replacement before changing the draft. Removal, reset, and import support one-step Undo. Clearing browser data clears the saved draft, so use a backup to move between devices or keep a separate copy.

The original `resumemaz` storage key is read if no new draft exists. Legacy content is migrated to the versioned `resumemaz:v1` document. The old key is retained. Old rich-text HTML becomes plain text with paragraph and bullet line breaks; inline bold/italic styling is not retained. Unreadable stored data pauses autosave and offers an original-data download. Automatic migration only works on the same origin; local development cannot access drafts saved on the old production domain.

## Structure

```text
src/pages/index.astro              Static page, metadata, and editor island
src/components/ResumeBuilder.tsx   Carbon editor and application state
src/components/ResumePreview.tsx   Semantic document preview
src/lib/resume.ts                  Versioned schema, migration, and formatting
src/lib/storage.ts                 Browser repository and file downloads
src/lib/pdf.tsx                    PDF document, fonts, and export
src/styles/app.scss               Carbon components and responsive layout
.codex/design/                    Design brief and verification notes
```

Deploy `dist/` to a static host. For Vercel, select Astro, use `bun install --frozen-lockfile` and `bun run build`, and set the output directory to `dist`. Configure both `PUBLIC_SUPABASE_*` variables before building, and add the deployed origin to Supabase Auth URL Configuration before testing signup or password recovery there. The app has not been deployed by this integration.

## Online saving

Sign in or create an account from the online workspace. Confirm your email if requested. Choose **Save online** to create or update the attached resume; **My resumes** opens your private list. You can rename the current document, save a new copy, detach to a local copy, or move a saved resume to recoverable Trash. Opening a saved resume asks before replacing the editor. Signing out leaves the local draft on the device.

The saved document link survives reloads for the same account while retaining its expected revision. If another tab or device updates the online copy, a stale save is rejected; open the latest version or save your local work as a new copy. No background process silently uploads local edits.

See [Supabase setup and verification](docs/supabase.md) for the project, migration, access model, and deployment requirements.

Use the `design` skill for future UI design and review, as recorded in `AGENTS.md`.
