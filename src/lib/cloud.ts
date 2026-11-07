import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { resumeSchema, type Resume } from "./resume";

const summarySchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  name: z.string(),
  revision: z.number().int().positive(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
});
const recordSchema = summarySchema.extend({ document: resumeSchema });
export type CloudSummary = z.infer<typeof summarySchema>;
export type CloudResume = z.infer<typeof recordSchema>;
const fields = "id,user_id,name,revision,updated_at,deleted_at";
export class CloudConflictError extends Error {
  constructor() {
    super(
      "This online copy changed in another tab or device. Open the latest copy, or save your current work as a new resume.",
    );
  }
}
export function cloudDocument(resume: Resume, name: string): Resume {
  const document = resumeSchema.parse({ ...resume, name: name.trim() });
  if (!document.name) throw new Error("Give your resume a name.");
  if (new TextEncoder().encode(JSON.stringify(document)).length > 4_900_000)
    throw new Error(
      "This resume is too large to save online. Use a smaller photo or download a backup.",
    );
  return document;
}
export async function listCloudResumes(
  client: SupabaseClient,
  trash = false,
  offset = 0,
): Promise<CloudSummary[]> {
  const query = client
    .from("resumes")
    .select(fields)
    .order("updated_at", { ascending: false })
    .range(offset, offset + 49);
  const { data, error } = await (trash
    ? query.not("deleted_at", "is", null)
    : query.is("deleted_at", null));
  if (error) throw error;
  return z.array(summarySchema).parse(data);
}
export async function loadCloudResume(
  client: SupabaseClient,
  id: string,
): Promise<CloudResume> {
  const { data, error } = await client
    .from("resumes")
    .select(`${fields},document`)
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  if (error) throw error;
  return recordSchema.parse(data);
}
export async function saveCloudResume(
  client: SupabaseClient,
  resume: Resume,
  name: string,
  current: CloudSummary | null,
  createId?: string,
): Promise<CloudResume> {
  const document = cloudDocument(resume, name);
  const query = current
    ? client
        .from("resumes")
        .update({ name: document.name, document })
        .eq("id", current.id)
        .eq("revision", current.revision)
        .is("deleted_at", null)
    : client.from("resumes").insert({
        ...(createId ? { id: createId } : {}),
        name: document.name,
        document,
      });
  const { data, error } = await query
    .select(`${fields},document`)
    .maybeSingle();
  if (error) {
    if (!current && createId && error.code === "23505") {
      const existing = await loadCloudResume(client, createId);
      if (JSON.stringify(existing.document) === JSON.stringify(document))
        return existing;
      throw new CloudConflictError();
    }
    throw error;
  }
  if (!data) throw new CloudConflictError();
  return recordSchema.parse(data);
}
export async function setCloudTrashed(
  client: SupabaseClient,
  record: CloudSummary,
  trashed: boolean,
): Promise<void> {
  const { data, error } = await client
    .from("resumes")
    .update({ deleted_at: trashed ? new Date().toISOString() : null })
    .eq("id", record.id)
    .eq("revision", record.revision)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new CloudConflictError();
}
export function cloudErrorMessage(error: unknown): string {
  if (error instanceof CloudConflictError) return error.message;
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "email_address_not_authorized"
  )
    return "Email delivery isn’t configured for this address yet. Please contact the site owner, or sign in if you already have an account.";
  const message =
    error && typeof error === "object" && "message" in error
      ? String(error.message)
      : "";
  if (/Invalid login credentials/i.test(message))
    return "The email or password is incorrect.";
  if (/Email not confirmed/i.test(message))
    return "Confirm your email first, then return here to sign in.";
  if (/rate limit|too many|security purposes/i.test(message))
    return "Too many requests. Wait a little before trying again.";
  if (
    /fetch|network|timeout|aborted/i.test(message) ||
    (typeof navigator !== "undefined" && !navigator.onLine)
  )
    return "We couldn’t reach the online service. Your local draft is safe. Check your connection and try again.";
  if (/JWT|session|refresh token/i.test(message))
    return "Your session has expired. Sign in again; your local draft is safe.";
  if (
    message.startsWith("This resume is too large") ||
    message.startsWith("Give your resume")
  )
    return message;
  return "This action couldn’t be completed. Your local draft is safe. Try again, or download a backup.";
}
