import { describe, expect, test } from "bun:test";
import { createClient } from "@supabase/supabase-js";
import {
  cloudDocument,
  cloudErrorMessage,
  CloudConflictError,
  loadCloudResume,
  saveCloudResume,
  setCloudTrashed,
} from "./cloud";
import { sampleResume } from "./resume";
import {
  CLOUD_REFERENCE_KEY,
  readCloudReference,
  referenceFor,
  resumeFingerprint,
} from "./cloud-reference";

const id = "90800000-0000-4000-8000-000000000001";
const owner = "90800000-0000-4000-8000-000000000002";
const record = () => ({
  id,
  user_id: owner,
  name: "Design role",
  document: { ...sampleResume(), name: "Design role" },
  revision: 3,
  updated_at: new Date().toISOString(),
  deleted_at: null,
});
function api(
  response: unknown,
  inspect?: (url: URL, init?: RequestInit) => void,
) {
  return createClient("https://test.example.com", "test-publishable-key", {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: Object.assign(
        async (input: RequestInfo | URL, init?: RequestInit) => {
          inspect?.(new URL(String(input)), init);
          return new Response(JSON.stringify(response), {
            headers: { "Content-Type": "application/json" },
          });
        },
        { preconnect: fetch.preconnect },
      ),
    },
  });
}
describe("online resume persistence", () => {
  test("validates and names an online snapshot without changing the local draft", () => {
    const local = sampleResume();
    const online = cloudDocument(local, "  Design role  ");
    expect(online.name).toBe("Design role");
    expect(local.name).toBe("My resume");
    expect(() => cloudDocument(local, "  ")).toThrow();
  });
  test("updates only the expected revision and active document", async () => {
    let checked = false;
    const saved = await saveCloudResume(
      api({ ...record(), revision: 4 }, (url, init) => {
        expect(init?.method).toBe("PATCH");
        expect(url.searchParams.get("id")).toBe(`eq.${id}`);
        expect(url.searchParams.get("revision")).toBe("eq.3");
        expect(url.searchParams.get("deleted_at")).toBe("is.null");
        checked = true;
      }),
      sampleResume(),
      "Design role",
      record(),
    );
    expect(checked).toBe(true);
    expect(saved.revision).toBe(4);
  });
  test("reports stale saves without an unguarded overwrite", async () => {
    const error = await saveCloudResume(
      api(null),
      sampleResume(),
      "Design role",
      record(),
    ).catch((error) => error);
    expect(error).toBeInstanceOf(CloudConflictError);
  });
  test("lets the authenticated database determine ownership on insert", async () => {
    await saveCloudResume(
      api(record(), (_url, init) => {
        const body = JSON.parse(String(init?.body));
        expect(body.user_id).toBeUndefined();
        expect(body.name).toBe("Design role");
        expect(init?.method).toBe("POST");
      }),
      sampleResume(),
      "Design role",
      null,
    );
  });
  test("validates documents loaded from the server", async () => {
    const error = await loadCloudResume(
      api({ ...record(), document: { version: 99 } }),
      id,
    ).catch((error) => error);
    expect(error).toBeInstanceOf(Error);
  });
  test("uses revision checks for recoverable removal and restore", async () => {
    await setCloudTrashed(
      api({ id }, (url, init) => {
        expect(url.searchParams.get("revision")).toBe("eq.3");
        expect(JSON.parse(String(init?.body)).deleted_at).not.toBeNull();
      }),
      record(),
      true,
    );
    const error = await setCloudTrashed(api(null), record(), false).catch(
      (error) => error,
    );
    expect(error).toBeInstanceOf(CloudConflictError);
  });
  test("gives recovery guidance without exposing server internals", () => {
    expect(cloudErrorMessage(new Error("Failed to fetch"))).toContain(
      "local draft is safe",
    );
    expect(cloudErrorMessage(new Error("secret server details"))).not.toContain(
      "secret",
    );
    expect(cloudErrorMessage(new Error("Invalid login credentials"))).toBe(
      "The email or password is incorrect.",
    );
    expect(
      cloudErrorMessage({ code: "email_address_not_authorized" }),
    ).toContain("Email delivery");
  });
  test("recovers an acknowledged insert retry without creating another copy", async () => {
    let requests = 0;
    const client = createClient("https://test.example.com", "test-key", {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        fetch: Object.assign(
          async () => {
            requests++;
            return new Response(
              JSON.stringify(
                requests === 1
                  ? { code: "23505", message: "Duplicate id" }
                  : record(),
              ),
              {
                status: requests === 1 ? 409 : 200,
                headers: { "Content-Type": "application/json" },
              },
            );
          },
          { preconnect: fetch.preconnect },
        ),
      },
    });
    const saved = await saveCloudResume(
      client,
      sampleResume(),
      "Design role",
      null,
      id,
    );
    expect(saved.id).toBe(id);
    expect(requests).toBe(2);
  });
  test("remembers the expected revision across reloads, scoped to the account", async () => {
    const originalStorage = Object.getOwnPropertyDescriptor(
      globalThis,
      "localStorage",
    );
    const data = new Map<string, string>();
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: { getItem: (key: string) => data.get(key) ?? null },
    });
    try {
      const reference = await referenceFor(record());
      data.set(CLOUD_REFERENCE_KEY, JSON.stringify(reference));
      expect(readCloudReference(owner)?.revision).toBe(3);
      expect(readCloudReference("another-account")).toBeNull();
      expect("document" in reference).toBe(false);
      expect(await resumeFingerprint(record().document)).toBe(
        reference.fingerprint,
      );
      const changed = record().document;
      changed.basics.city = "A different city";
      expect(await resumeFingerprint(changed)).not.toBe(reference.fingerprint);
      data.set(CLOUD_REFERENCE_KEY, "{bad");
      expect(readCloudReference(owner)).toBeNull();
    } finally {
      if (originalStorage)
        Object.defineProperty(globalThis, "localStorage", originalStorage);
      else Reflect.deleteProperty(globalThis, "localStorage");
    }
  });
});
