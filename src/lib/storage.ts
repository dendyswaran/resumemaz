import { parseResume, type Resume } from "./resume";

export const STORAGE_KEY = "resumemaz:v1";
export interface ResumeRepository {
  load(): Resume | null;
  save(resume: Resume): void;
}
// Local recovery stays independent of authenticated saves in cloud.ts.
export const localResumeRepository: ResumeRepository = {
  load() {
    const current = localStorage.getItem(STORAGE_KEY);
    const old = localStorage.getItem("resumemaz");
    return current || old
      ? parseResume(JSON.parse((current || old)!), legacyHtmlToText)
      : null;
  },
  save(resume) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
  },
};

export function legacyHtmlToText(html: string): string {
  const document = new DOMParser().parseFromString(html, "text/html");
  document
    .querySelectorAll("script, style, iframe, object")
    .forEach((element) => element.remove());
  document
    .querySelectorAll("br")
    .forEach((element) => element.replaceWith("\n"));
  document
    .querySelectorAll("p, li, h1, h2, h3, blockquote")
    .forEach((element) => element.append("\n"));
  return document.body.textContent?.replace(/\n{3,}/g, "\n\n").trim() || "";
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
