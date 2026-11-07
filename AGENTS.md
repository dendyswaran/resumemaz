# Resumemaz

- Use Bun for dependencies and scripts. Keep `bun.lock` updated; do not introduce another lockfile.
- Astro serves the static page. Keep the interactive Carbon React builder as a hydrated island.
- Use the `design` skill whenever designing, changing, or reviewing the UI. Keep design records in `.codex/design/` and verify affected layouts at narrow and wide widths.
- Use real Carbon components, IBM Plex typography, and the existing restrained blue/gray palette.
- Run `bun run check`, `bun test`, and `bun run build` for application changes. Verify meaningful interactions in a browser.
- Preserve legacy `resumemaz` local storage. New documents use the versioned schema and storage repository in `src/lib/`.
- Supabase stores private online resumes behind authenticated ownership policies. Keep local autosave separate from explicit online saves; never imply that local drafts are saved online.
