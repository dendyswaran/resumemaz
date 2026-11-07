# Resumemaz UI review

Historical modernization review, before the online phase. See [the online workspace review](online-review.md) for the subsequent Supabase implementation and current verification.

Date: 2026-11-07. Scope: `/`, all editor sections, local saving, backup/import, and exported PDF. Direction: Carbon editorial workspace. Methods: redesign and finish, with browser inspection and interaction.

## Outcome

The legacy React/Vite/Tailwind form has been replaced with an Astro page and an interactive Carbon React island. The eight original content sections remain. Desktop separates navigation, editing, and preview; smaller widths use an Edit/Preview switch. PDF export downloads a text document directly.

## Evidence

- Inspected the original deployed page and source before replacing it. The original fixed half-width preview squeezed the editor on a narrow screen. The remote logo was broken. Rich-text toolbar buttons lacked useful accessible names.
- Inspected the replacement at 390 px, 768 px, and 1440 px. Document width measurements did not exceed the viewport; the section navigation and zoomed paper scroll intentionally within their own containers.
- Verified live edits, save/restore after reload, section navigation, add/edit/remove/undo, backup download, invalid import rejection, legacy import, reset/undo, accent and paper selection, and document zoom.
- Verified production-build PDF download, a one-page A4 document, a four-page Letter stress case, a final three-page A4 stress case, selectable extracted text, clickable links, and WebP-to-PNG photo conversion. The final stress document contained the first and last of 55 long achievement paragraphs and all subsequent career sections, with no words outside page bounds and no Unicode replacement characters.
- Inspected rendered PDF pages. Grouped section headings with the first entry to avoid orphaned headings. Omitted an unreliable page-number footer; automatic pagination remains.
- `bun run check`: zero errors, warnings, or hints. `bun test`: seven tests, 32 assertions passed. `bun run build`: passed using Bun. `git diff --check`: passed.

## Repairs from review

1. Material friction: original narrow-screen columns squeezed both editor and preview. Replaced with the view switch and section strip; verified by browser inspection.
2. Readability: initial document-preview text was too small. Added proportional document typography and an independently scrollable zoom view; verified on phone and desktop.
3. Readability: phone contact fields clipped realistic email/phone values. Made these fields span the editor width on phones; verified in the final mobile source and layout pass.
4. Recovery: malformed stored data could be overwritten by an example. Added a protected state with autosave paused, original-data export, and intentional replacement; storage preservation has a unit test, UI wiring was source-reviewed.
5. Delivery size: including all Carbon styles generated about 1.18 MB CSS. Selective component styles reduced this to about 271 KB before compression. Required Carbon layout and form foundations are retained.

## Limits and retained decisions

- The preview is a continuous document and does not promise exact PDF page boundaries.
- Existing rich-text content retains text and line breaks; inline bold/italic styles are not retained.
- The lazy PDF engine is about 1.2 MB before compression. It is fetched on export; the build reports a large-chunk warning for this deliberate deferred dependency.
- Tested in the available Chromium-based browser. Safari, Firefox, assistive-technology audits, and additional writing systems have not been verified.
- Storage failure UI was source-reviewed and repository preservation tested; browser storage quotas and disabled storage were not forced in browser QA.
- No authentication, online saves, Supabase keys, deployment, or external publication was added.

Future UI work should continue using the design skill and this brief. Review authenticated loading, empty, offline, and conflict states when online saving is implemented.
