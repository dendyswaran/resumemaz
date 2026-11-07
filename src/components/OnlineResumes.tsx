import { useEffect, useRef, useState, type SubmitEvent } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import {
  Button,
  InlineNotification,
  Modal,
  PasswordInput,
  TextInput,
} from "@carbon/react";
import {
  Cloud,
  CloudUpload,
  Folder,
  Login,
  Logout,
  Renew,
  TrashCan,
} from "@carbon/icons-react";
import { getSupabaseClient } from "../lib/supabase";
import {
  cloudErrorMessage,
  listCloudResumes,
  loadCloudResume,
  saveCloudResume,
  setCloudTrashed,
  type CloudResume,
  type CloudSummary,
} from "../lib/cloud";
import type { Resume } from "../lib/resume";
import {
  CLOUD_REFERENCE_KEY,
  readCloudReference,
  referenceFor,
  resumeFingerprint,
  type CloudReference,
} from "../lib/cloud-reference";

type AuthMode = "login" | "signup" | "forgot" | "recover";
type Props = {
  resume: Resume;
  draftEpoch: number;
  canSave: boolean;
  onOpen: (resume: Resume) => void;
  onRename: (name: string) => void;
};
export default function OnlineResumes({
  resume,
  draftEpoch,
  canSave,
  onOpen,
  onRename,
}: Props) {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authNote, setAuthNote] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const busyRef = useRef(false);
  const userRef = useRef<string | null>(null);
  const mounted = useRef(true);
  const [active, setActive] = useState<CloudReference | null>(null);
  const [fingerprint, setFingerprint] = useState("");
  const previousEpoch = useRef(draftEpoch);
  const pendingCreate = useRef<{
    owner: string;
    snapshot: string;
    id: string;
  } | null>(null);
  const [library, setLibrary] = useState(false);
  const [trash, setTrash] = useState(false);
  const [records, setRecords] = useState<CloudSummary[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [opening, setOpening] = useState<CloudSummary | null>(null);
  const [openingTitle, setOpeningTitle] = useState("Open resume?");
  const userId = session?.user.id ?? null;
  const dirty = Boolean(active && fingerprint !== active.fingerprint);
  useEffect(() => {
    let cancelled = false;
    void resumeFingerprint(resume)
      .then((hash) => {
        if (!cancelled) setFingerprint(hash);
      })
      .catch(() => {
        if (!cancelled) setFingerprint("");
      });
    return () => {
      cancelled = true;
    };
  }, [resume]);
  function detach() {
    setActive(null);
    try {
      localStorage.removeItem(CLOUD_REFERENCE_KEY);
    } catch {
      /* The editor reports local storage failures separately. */
    }
  }
  async function remember(record: CloudResume) {
    const reference = await referenceFor(record);
    if (!mounted.current || userRef.current !== record.user_id) return;
    setActive(reference);
    try {
      localStorage.setItem(CLOUD_REFERENCE_KEY, JSON.stringify(reference));
    } catch {
      setError(
        "Saved online, but this browser couldn’t remember the connection. Reopen it from My resumes after reloading.",
      );
    }
  }

  useEffect(() => {
    mounted.current = true;
    const supabase = getSupabaseClient();
    setClient(supabase);
    if (!supabase) {
      setReady(true);
      return;
    }
    const acceptSession = (next: Session | null) => {
      if (!mounted.current) return;
      userRef.current = next?.user.id ?? null;
      setSession(next);
      setReady(true);
    };
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, next) => {
      acceptSession(next);
      if (event === "PASSWORD_RECOVERY") {
        setMode("recover");
        setAuthOpen(true);
        setPassword("");
      }
    });
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted.current) return;
        if (error) setError(cloudErrorMessage(error));
        acceptSession(data.session);
      })
      .catch((error) => {
        if (mounted.current) {
          setError(cloudErrorMessage(error));
          setReady(true);
        }
      });
    const hash = new URLSearchParams(window.location.hash.slice(1));
    if (hash.has("error_description")) {
      setError(
        "This sign-in link has expired or is invalid. Request another link or sign in with your password.",
      );
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setActive(userId ? readCloudReference(userId) : null);
    setRecords([]);
    setLibrary(false);
    setOpening(null);
    setMessage("");
  }, [userId]);
  useEffect(() => {
    if (previousEpoch.current !== draftEpoch) {
      previousEpoch.current = draftEpoch;
      detach();
    }
  }, [draftEpoch]);

  async function perform(label: string, action: () => Promise<void>) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(label);
    setError("");
    setMessage("");
    try {
      await action();
    } catch (error) {
      if (mounted.current) setError(cloudErrorMessage(error));
    } finally {
      busyRef.current = false;
      if (mounted.current) setBusy("");
    }
  }
  async function refresh(append = false) {
    if (!client || !userId) return;
    const owner = userId;
    const next = await listCloudResumes(
      client,
      trash,
      append ? records.length : 0,
    );
    if (mounted.current && userRef.current === owner) {
      setRecords(
        append
          ? [...records, ...next].filter(
              (row, i, all) =>
                all.findIndex((other) => other.id === row.id) === i,
            )
          : next,
      );
      setHasMore(next.length === 50);
    }
  }
  useEffect(() => {
    if (library && client && userId) {
      setRecords([]);
      void perform("Loading resumes…", () => refresh());
    }
  }, [library, trash, client, userId]);

  async function authenticate(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client) return;
    await perform(mode === "login" ? "Signing in…" : "Working…", async () => {
      setAuthNote("");
      if (mode === "forgot") {
        const { error } = await client.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo: window.location.origin + "/" },
        );
        if (error) throw error;
        setAuthNote(
          "If an account matches this email, a password reset link is on its way. Check your inbox and spam folder.",
        );
      } else if (mode === "recover") {
        const { error } = await client.auth.updateUser({ password });
        if (error) throw error;
        setPassword("");
        setAuthOpen(false);
        setMessage("Password updated. You can now save your resume online.");
      } else if (mode === "signup") {
        const { data, error } = await client.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin + "/" },
        });
        if (error) throw error;
        setPassword("");
        if (data.session) {
          setAuthOpen(false);
          setMessage(
            "You’re signed in. Your local draft is unchanged. Choose Save online to upload it.",
          );
        } else
          setAuthNote(
            "Check your email to confirm your account, then return here and sign in. Your local draft has not been uploaded.",
          );
      } else {
        const { error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        setPassword("");
        setAuthOpen(false);
        setMessage(
          "Signed in. Your local draft is unchanged. Choose Save online or open one of your saved resumes.",
        );
      }
    });
  }

  async function save(asNew = false) {
    if (!client || !userId || !canSave) return;
    const owner = userId,
      snapshot = resume;
    const current = asNew ? null : active;
    const snapshotKey = JSON.stringify(snapshot);
    if (
      !current &&
      (pendingCreate.current?.owner !== owner ||
        pendingCreate.current.snapshot !== snapshotKey)
    ) {
      pendingCreate.current = {
        owner,
        snapshot: snapshotKey,
        id: crypto.randomUUID(),
      };
    }
    await perform("Saving online…", async () => {
      const saved = await saveCloudResume(
        client,
        snapshot,
        snapshot.name,
        current,
        current ? undefined : pendingCreate.current?.id,
      );
      if (mounted.current && userRef.current === owner) {
        await remember(saved);
        pendingCreate.current = null;
        if (snapshot.name !== saved.name) onRename(saved.name);
        setMessage(
          "Saved online. Further edits stay on this device until you choose Save online again.",
        );
      }
    });
  }
  const showAuth = () => {
    setMode("login");
    setPassword("");
    setAuthNote("");
    setError("");
    setAuthOpen(true);
  };
  const switchMode = (next: AuthMode) => {
    setMode(next);
    setPassword("");
    setAuthNote("");
    setError("");
  };
  const status = !ready
    ? "Checking your session…"
    : !client
      ? "Online saving is not configured. You can keep editing locally."
      : !session
        ? "Sign in to keep a private online copy. Your local draft stays on this device."
        : !canSave
          ? "Resolve the local draft warning before saving online. You can still open a saved resume."
          : active
            ? dirty
              ? "Local changes · choose Save online to update your online copy."
              : "This version is saved online. Your resume is private to your account."
            : "Local draft · choose Save online to create a private online copy.";

  return (
    <section className="online-workspace" aria-label="Online resume storage">
      <div className="online-bar">
        <div className="online-description">
          <Cloud size={24} />
          <div>
            <h2>
              {session
                ? active?.name || "Your online workspace"
                : "Take your resume with you."}
            </h2>
            <p role="status">{status}</p>
          </div>
        </div>
        <div className="online-actions">
          {session ? (
            <>
              <Button
                kind="ghost"
                size="sm"
                renderIcon={Folder}
                disabled={Boolean(busy)}
                onClick={() => {
                  setTrash(false);
                  setLibrary(true);
                }}
              >
                My resumes
              </Button>
              <Button
                kind="primary"
                size="sm"
                renderIcon={CloudUpload}
                disabled={Boolean(busy) || !canSave}
                onClick={() => save()}
              >
                {busy === "Saving online…" ? busy : "Save online"}
              </Button>
            </>
          ) : (
            <Button
              kind="tertiary"
              size="sm"
              renderIcon={Login}
              disabled={!ready || !client || Boolean(busy)}
              onClick={showAuth}
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
      {session && (
        <div className="online-document-tools">
          <TextInput
            id="resume-name"
            labelText="Resume name"
            value={resume.name}
            maxLength={200}
            onChange={(e) => onRename(e.target.value)}
            disabled={Boolean(busy)}
          />
          <div>
            <span className="account-email">{session.user.email}</span>
            {active && (
              <>
                <Button
                  kind="ghost"
                  size="sm"
                  onClick={() => save(true)}
                  disabled={Boolean(busy) || !canSave}
                >
                  Save as new copy
                </Button>
                <Button
                  kind="ghost"
                  size="sm"
                  disabled={Boolean(busy)}
                  onClick={() => {
                    detach();
                    setMessage(
                      "Online copy detached. Your draft stays in the editor. The next save creates a new online resume.",
                    );
                  }}
                >
                  Work on a local copy
                </Button>
              </>
            )}
          </div>
        </div>
      )}
      {error && !authOpen && (
        <InlineNotification
          kind="error"
          title="Online action needs attention"
          subtitle={error}
          onCloseButtonClick={() => setError("")}
          lowContrast
        />
      )}
      {message && (
        <InlineNotification
          kind="success"
          title="Online workspace"
          subtitle={message}
          onCloseButtonClick={() => setMessage("")}
          lowContrast
        />
      )}

      <Modal
        open={authOpen}
        passiveModal
        size="sm"
        modalLabel="YOUR PRIVATE WORKSPACE"
        modalHeading={
          mode === "signup"
            ? "Create your account"
            : mode === "forgot"
              ? "Reset your password"
              : mode === "recover"
                ? "Choose a new password"
                : "Welcome back"
        }
        onRequestClose={() => {
          if (!busy) {
            setAuthOpen(false);
            setPassword("");
            setError("");
          }
        }}
      >
        <form className="auth-form" onSubmit={authenticate}>
          <p>
            {mode === "recover"
              ? "Choose a password with at least 8 characters."
              : mode === "forgot"
                ? "We’ll email a link to help you get back into your account."
                : "Your resume is private to your account. Signing in leaves the draft in your editor unchanged."}
          </p>
          {mode !== "recover" && (
            <TextInput
              id="account-email"
              labelText="Email address"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={Boolean(busy)}
            />
          )}
          {mode !== "forgot" && (
            <PasswordInput
              id="account-password"
              labelText={mode === "recover" ? "New password" : "Password"}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              required
              minLength={mode === "login" ? undefined : 8}
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={Boolean(busy)}
            />
          )}
          {error && (
            <InlineNotification
              kind="error"
              title="Please try again"
              subtitle={error}
              hideCloseButton
              lowContrast
            />
          )}
          {authNote && (
            <InlineNotification
              kind="info"
              title="Check your inbox"
              subtitle={authNote}
              hideCloseButton
              lowContrast
            />
          )}
          <Button type="submit" disabled={Boolean(busy)} renderIcon={Login}>
            {busy ||
              (mode === "signup"
                ? "Create account"
                : mode === "forgot"
                  ? "Send reset link"
                  : mode === "recover"
                    ? "Update password"
                    : "Sign in")}
          </Button>
          {mode === "login" && (
            <div className="auth-alternatives">
              <Button
                kind="ghost"
                size="sm"
                disabled={Boolean(busy)}
                onClick={() => switchMode("signup")}
              >
                Create an account
              </Button>
              <Button
                kind="ghost"
                size="sm"
                disabled={Boolean(busy)}
                onClick={() => switchMode("forgot")}
              >
                Forgot password?
              </Button>
            </div>
          )}
          {(mode === "signup" || mode === "forgot") && (
            <Button
              kind="ghost"
              size="sm"
              disabled={Boolean(busy)}
              onClick={() => switchMode("login")}
            >
              Back to sign in
            </Button>
          )}
        </form>
      </Modal>

      <Modal
        open={library}
        passiveModal
        size="lg"
        modalLabel="YOUR ACCOUNT"
        modalHeading="My resumes"
        onRequestClose={() => {
          if (!busy) setLibrary(false);
        }}
      >
        <div className="resume-library">
          <div className="library-account">
            <span>{session?.user.email}</span>
            <Button
              kind="ghost"
              size="sm"
              renderIcon={Logout}
              disabled={Boolean(busy)}
              onClick={() =>
                perform("Signing out…", async () => {
                  const { error } = await client!.auth.signOut({
                    scope: "local",
                  });
                  if (error) throw error;
                  setLibrary(false);
                  setMessage(
                    "Signed out. The current draft remains on this device. On a shared device, start blank or clear the local draft before leaving.",
                  );
                })
              }
            >
              Sign out
            </Button>
          </div>
          <div className="library-filters">
            <Button
              kind={trash ? "ghost" : "primary"}
              size="sm"
              disabled={Boolean(busy)}
              onClick={() => setTrash(false)}
            >
              Saved resumes
            </Button>
            <Button
              kind={trash ? "primary" : "ghost"}
              size="sm"
              disabled={Boolean(busy)}
              onClick={() => setTrash(true)}
            >
              Trash
            </Button>
            <Button
              kind="ghost"
              size="sm"
              renderIcon={Renew}
              disabled={Boolean(busy)}
              onClick={() => perform("Loading resumes…", () => refresh())}
            >
              Refresh
            </Button>
          </div>
          {error && (
            <InlineNotification
              kind="error"
              title="Please try again"
              subtitle={error}
              hideCloseButton
              lowContrast
            />
          )}
          {busy && <p role="status">{busy}</p>}
          {!busy && records.length === 0 && !error && (
            <div className="library-empty">
              <Folder size={32} />
              <h3>
                {trash
                  ? "Your trash is empty."
                  : "A home for your next chapter."}
              </h3>
              <p>
                {trash
                  ? "Resumes you move to trash can be restored here."
                  : "Close this window and choose Save online to keep your current resume here."}
              </p>
            </div>
          )}
          <ul className="saved-resume-list">
            {records.map((record) => (
              <li key={record.id}>
                <div>
                  <h3>{record.name}</h3>
                  <p>
                    Updated{" "}
                    {new Date(record.updated_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div>
                  {trash ? (
                    <Button
                      kind="tertiary"
                      size="sm"
                      disabled={Boolean(busy)}
                      onClick={() =>
                        perform("Restoring…", async () => {
                          await setCloudTrashed(client!, record, false);
                          await refresh();
                        })
                      }
                    >
                      Restore
                    </Button>
                  ) : (
                    <>
                      <Button
                        kind="tertiary"
                        size="sm"
                        disabled={Boolean(busy)}
                        onClick={() => {
                          setLibrary(false);
                          setOpeningTitle(`Open “${record.name}”?`);
                          setOpening(record);
                        }}
                      >
                        Open
                      </Button>
                      <Button
                        kind="ghost"
                        size="sm"
                        hasIconOnly
                        renderIcon={TrashCan}
                        iconDescription={`Move ${record.name} to trash`}
                        disabled={Boolean(busy)}
                        onClick={() =>
                          perform("Moving to trash…", async () => {
                            await setCloudTrashed(client!, record, true);
                            if (active?.id === record.id) detach();
                            await refresh();
                          })
                        }
                      />
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {hasMore && (
            <Button
              kind="ghost"
              size="sm"
              disabled={Boolean(busy)}
              onClick={() => perform("Loading more…", () => refresh(true))}
            >
              Load more
            </Button>
          )}
          <p className="library-note">
            Opening a resume replaces the editor after confirmation. Move a
            resume to trash to hide it; you can restore it later. Your local
            draft is kept separately.
          </p>
        </div>
      </Modal>
      <Modal
        open={Boolean(opening)}
        size="sm"
        modalLabel="OPEN ONLINE RESUME"
        modalHeading={openingTitle}
        primaryButtonText={busy || "Open resume"}
        primaryButtonDisabled={Boolean(busy)}
        secondaryButtonText="Keep editing"
        onRequestClose={() => {
          if (!busy) setOpening(null);
        }}
        onRequestSubmit={() => {
          if (!client || !opening || !userId) return;
          const record = opening,
            owner = userId;
          void perform("Opening…", async () => {
            const loaded = await loadCloudResume(client, record.id);
            if (mounted.current && userRef.current === owner) {
              onOpen(loaded.document);
              await remember(loaded);
              setOpening(null);
            }
          });
        }}
      >
        <p>
          The draft in your editor will be replaced. Download a JSON backup
          first if you want to keep a separate copy. Undo in the editor can
          restore the previous draft.
        </p>
        {error && (
          <InlineNotification
            kind="error"
            title="Couldn’t open resume"
            subtitle={error}
            hideCloseButton
            lowContrast
          />
        )}
      </Modal>
    </section>
  );
}
