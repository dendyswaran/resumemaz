import { z } from "zod";
import type { CloudResume } from "./cloud";
import type { Resume } from "./resume";

const referenceSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  name: z.string(),
  revision: z.number().int().positive(),
  updated_at: z.string(),
  deleted_at: z.null(),
  fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
});
export type CloudReference = z.infer<typeof referenceSchema>;
export const CLOUD_REFERENCE_KEY = "resumemaz:online-reference:v1";
export async function resumeFingerprint(resume: Resume): Promise<string> {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(resume)),
  );
  return Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
export function readCloudReference(userId: string): CloudReference | null {
  try {
    const raw = localStorage.getItem(CLOUD_REFERENCE_KEY);
    if (!raw) return null;
    const result = referenceSchema.safeParse(JSON.parse(raw));
    return result.success && result.data.user_id === userId
      ? result.data
      : null;
  } catch {
    return null;
  }
}
export async function referenceFor(
  record: CloudResume,
): Promise<CloudReference> {
  return referenceSchema.parse({
    ...record,
    fingerprint: await resumeFingerprint(record.document),
  });
}
