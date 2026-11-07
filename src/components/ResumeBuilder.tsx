import {
  Component,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import {
  Button,
  TextInput,
  TextArea,
  Select,
  SelectItem,
  Tag,
  InlineNotification,
  Modal,
  FileUploaderButton,
} from "@carbon/react";
import {
  Add,
  ArrowLeft,
  ArrowRight,
  Certificate,
  Checkmark,
  CheckmarkOutline,
  ChevronRight,
  Document,
  Download,
  Education,
  Information,
  Launch,
  Link as LinkIcon,
  Portfolio,
  Renew,
  Security,
  Settings,
  TrashCan,
  Upload,
  User,
  View,
} from "@carbon/icons-react";
import ResumePreview from "./ResumePreview";
import OnlineResumes from "./OnlineResumes";
import {
  blankResume,
  emptyEntry,
  fileName,
  parseResume,
  safeUrl,
  sampleResume,
  type EntrySection,
  type Resume,
  type ResumeEntry,
} from "../lib/resume";
import {
  downloadBlob,
  legacyHtmlToText,
  localResumeRepository,
} from "../lib/storage";

const sections = [
  {
    id: "basics",
    label: "Personal details",
    icon: User,
    description: "Introduce yourself. Start with the essentials.",
  },
  {
    id: "summary",
    label: "Professional summary",
    icon: Document,
    description: "A few good sentences can open a door.",
  },
  {
    id: "experience",
    label: "Experience",
    icon: Portfolio,
    description: "Show the work you’ve done and the difference you made.",
  },
  {
    id: "education",
    label: "Education",
    icon: Education,
    description: "Add your education and relevant qualifications.",
  },
  {
    id: "skills",
    label: "Skills",
    icon: CheckmarkOutline,
    description: "Choose skills that are relevant to your next role.",
  },
  {
    id: "projects",
    label: "Projects",
    icon: Launch,
    description: "Make room for work you’re proud of.",
  },
  {
    id: "certifications",
    label: "Certifications",
    icon: Certificate,
    description: "Highlight your professional certifications and training.",
  },
  {
    id: "links",
    label: "Links",
    icon: LinkIcon,
    description: "Let your portfolio and profiles tell the rest of your story.",
  },
] as const;
type Section = (typeof sections)[number]["id"];
type Notice = {
  kind: "error" | "success" | "info";
  title: string;
  message: string;
};
const entryLabels: Record<EntrySection, [string, string, string]> = {
  experience: ["Role / job title", "Employer", "experience"],
  education: ["Degree / qualification", "School / institution", "education"],
  projects: ["Project name", "Organization (optional)", "project"],
  certifications: [
    "Certification name",
    "Issuing organization",
    "certification",
  ],
};

class BuilderBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="fatal-error">
        <h1>The editor couldn’t load.</h1>
        <p>
          Your saved draft is still in this browser. Reload the page to try
          again.
        </p>
        <Button onClick={() => window.location.reload()}>Reload editor</Button>
      </main>
    ) : (
      this.props.children
    );
  }
}
export default function ResumeBuilder() {
  return (
    <BuilderBoundary>
      <Builder />
    </BuilderBoundary>
  );
}

function Builder() {
  const [resume, setResume] = useState<Resume>(sampleResume);
  const [section, setSection] = useState<Section>("basics");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [ready, setReady] = useState(false);
  const [example, setExample] = useState(true);
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [saveState, setSaveState] = useState("Loading draft…");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [exporting, setExporting] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [confirm, setConfirm] = useState<"reset" | "import" | null>(null);
  const [pendingImport, setPendingImport] = useState<Resume | null>(null);
  const [undo, setUndo] = useState<Resume | null>(null);
  const [draftEpoch, setDraftEpoch] = useState(0);
  const [undoShouldDetach, setUndoShouldDetach] = useState(false);
  const editorTitle = useRef<HTMLHeadingElement>(null);
  const latest = useRef(resume);
  latest.current = resume;

  useEffect(() => {
    try {
      const saved = localResumeRepository.load();
      if (saved) {
        setResume(saved);
        setExample(false);
        setSaveEnabled(true);
        setSaveState("Saved in this browser");
      } else setSaveState("Example resume");
    } catch {
      setStorageBlocked(true);
      setSaveState("Draft couldn’t be loaded");
      setNotice({
        kind: "error",
        title: "Your saved draft needs attention",
        message:
          "We couldn’t read the saved data. It hasn’t been replaced. Export a backup below before importing a valid draft or starting blank.",
      });
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !saveEnabled) return;
    setSaveState("Saving…");
    const save = () => {
      try {
        localResumeRepository.save(latest.current);
        setSaveState("Saved in this browser");
      } catch {
        setSaveState("Not saved");
        setNotice({
          kind: "error",
          title: "This browser couldn’t save your changes",
          message:
            "Your work is still in the editor. Download a JSON backup to keep it, or try a smaller profile photo.",
        });
      }
    };
    const timer = window.setTimeout(save, 450);
    window.addEventListener("pagehide", save);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pagehide", save);
    };
  }, [resume, ready, saveEnabled]);

  function update(next: Resume) {
    setResume(next);
    setExample(false);
    if (!storageBlocked) setSaveEnabled(true);
  }
  function selectSection(next: Section, focus = false) {
    setSection(next);
    setMobileView("edit");
    if (focus) requestAnimationFrame(() => editorTitle.current?.focus());
  }
  function backup() {
    downloadBlob(
      new Blob([JSON.stringify(resume, null, 2)], { type: "application/json" }),
      `${fileName(resume)}.json`,
    );
  }
  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      if (file.size > 5_000_000) throw new Error("size");
      const next = parseResume(JSON.parse(await file.text()), legacyHtmlToText);
      setPendingImport(next);
      setConfirm("import");
    } catch {
      setNotice({
        kind: "error",
        title: "This file couldn’t be imported",
        message:
          "Choose a Resumemaz JSON backup under 5 MB. Your current resume hasn’t changed.",
      });
    }
  }
  async function exportPdf() {
    setExporting(true);
    try {
      const { createResumePdf } = await import("../lib/pdf");
      downloadBlob(await createResumePdf(resume), `${fileName(resume)}.pdf`);
      setNotice({
        kind: "success",
        title: "Your PDF is ready",
        message:
          "The download contains selectable text and automatically continues onto another page when needed.",
      });
    } catch {
      setNotice({
        kind: "error",
        title: "The PDF couldn’t be created",
        message:
          "Try again, or remove the profile photo if the problem continues. You can still download a JSON backup.",
      });
    } finally {
      setExporting(false);
    }
  }
  function removeItem(key: EntrySection | "skills" | "links", id: string) {
    setUndo(resume);
    setUndoShouldDetach(false);
    update({ ...resume, [key]: resume[key].filter((item) => item.id !== id) });
    setNotice({
      kind: "info",
      title: "Entry removed",
      message: "Use Undo below to restore your previous draft.",
    });
  }
  const currentIndex = sections.findIndex((item) => item.id === section);
  const current = sections[currentIndex];
  const hasContent = (id: Section) =>
    id === "basics"
      ? Boolean(resume.basics.firstName || resume.basics.lastName)
      : id === "summary"
        ? Boolean(resume.summary.trim())
        : resume[id].length > 0;
  const included = sections.filter((item) => hasContent(item.id)).length;
  const basicField = (
    key: keyof Resume["basics"],
    label: string,
    placeholder: string,
    type = "text",
    autoComplete?: string,
  ) => (
    <TextInput
      key={key}
      id={`basic-${key}`}
      labelText={label}
      value={resume.basics[key]}
      placeholder={placeholder}
      type={type}
      autoComplete={autoComplete}
      maxLength={500}
      onChange={(event) =>
        update({
          ...resume,
          basics: { ...resume.basics, [key]: event.target.value },
        })
      }
    />
  );

  async function uploadPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 1_500_000
    ) {
      setNotice({
        kind: "error",
        title: "Choose a smaller image",
        message: "Use a JPG, PNG, or WebP image under 1.5 MB.",
      });
      return;
    }
    try {
      const photo = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const image = new Image();
      image.src = photo;
      await image.decode();
      update({
        ...latest.current,
        basics: { ...latest.current.basics, photo },
      });
    } catch {
      setNotice({
        kind: "error",
        title: "This image couldn’t be read",
        message: "Try another JPG, PNG, or WebP file.",
      });
    }
  }

  function entryForm(key: EntrySection) {
    const [titleLabel, orgLabel, singular] = entryLabels[key];
    const change = (id: string, field: keyof ResumeEntry, value: string) =>
      update({
        ...resume,
        [key]: resume[key].map((item) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
      });
    return (
      <>
        {resume[key].length === 0 && (
          <div className="empty-section">
            <current.icon size={32} />
            <h3>Your {singular} belongs here.</h3>
            <p>
              Add an entry to include it in your resume. You can leave this
              section empty.
            </p>
          </div>
        )}
        {resume[key].map((item, index) => (
          <fieldset className="entry-form" key={item.id}>
            <legend>
              {singular} {String(index + 1).padStart(2, "0")}
            </legend>
            <div className="entry-actions">
              <span>{item.title || `New ${singular}`}</span>
              <Button
                kind="ghost"
                size="sm"
                hasIconOnly
                renderIcon={TrashCan}
                iconDescription={`Remove ${singular} ${index + 1}`}
                onClick={() => removeItem(key, item.id)}
              />
            </div>
            <div className="field-grid">
              <TextInput
                id={`${item.id}-title`}
                labelText={titleLabel}
                value={item.title}
                maxLength={500}
                onChange={(e) => change(item.id, "title", e.target.value)}
              />
              <TextInput
                id={`${item.id}-org`}
                labelText={orgLabel}
                value={item.organization}
                maxLength={500}
                onChange={(e) =>
                  change(item.id, "organization", e.target.value)
                }
              />
              <TextInput
                id={`${item.id}-start`}
                labelText="Start date"
                placeholder="e.g. Jan 2022"
                value={item.startDate}
                maxLength={100}
                onChange={(e) => change(item.id, "startDate", e.target.value)}
              />
              <TextInput
                id={`${item.id}-end`}
                labelText="End date"
                placeholder="e.g. Present"
                value={item.endDate}
                maxLength={100}
                onChange={(e) => change(item.id, "endDate", e.target.value)}
              />
              <TextInput
                className="full-width"
                id={`${item.id}-city`}
                labelText="Location (optional)"
                value={item.city}
                maxLength={500}
                onChange={(e) => change(item.id, "city", e.target.value)}
              />
              <TextArea
                className="full-width"
                id={`${item.id}-description`}
                labelText="Highlights"
                helperText="One achievement per line. These appear as bullet points."
                rows={5}
                value={item.description}
                maxLength={30_000}
                onChange={(e) => change(item.id, "description", e.target.value)}
              />
            </div>
          </fieldset>
        ))}
        <Button
          kind="tertiary"
          renderIcon={Add}
          disabled={resume[key].length >= 100}
          onClick={() =>
            update({ ...resume, [key]: [...resume[key], emptyEntry()] })
          }
        >
          Add {singular}
        </Button>
      </>
    );
  }

  return (
    <>
      <header className="app-header">
        <a className="wordmark" href="/" aria-label="Resumemaz home">
          <span className="brand-icon">
            <Document size={21} />
          </span>
          resume<span className="brand-light">maz</span>
          <span className="brand-period">.</span>
        </a>
        <span className="header-caption">
          A little structure. A new chapter.
        </span>
        <Button
          kind="ghost"
          size="sm"
          renderIcon={Information}
          onClick={() => setShowHelp(true)}
        >
          How it works
        </Button>
      </header>
      <div className="workspace-bar">
        <div className="workspace-name">
          <span>Workspace</span>
          <ChevronRight size={14} />
          <span className="workspace-document-name">
            {resume.name || "My resume"}
          </span>
          <Tag type="gray" size="sm">
            Local draft
          </Tag>
        </div>
        <div className="workspace-actions">
          <span className="save-state" role="status">
            <span
              className={
                saveState.startsWith("Saved")
                  ? "status-dot saved"
                  : "status-dot"
              }
            />
            {saveState}
          </span>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={Download}
            onClick={backup}
            disabled={!ready}
          >
            Backup
          </Button>
          <label className="import-button">
            <Upload size={16} />
            <span>Import</span>
            <input
              aria-label="Import JSON backup"
              type="file"
              accept=".json,application/json"
              onChange={importFile}
              disabled={!ready}
            />
          </label>
          <Button
            size="md"
            renderIcon={Download}
            onClick={exportPdf}
            disabled={!ready || exporting}
          >
            {exporting ? "Creating PDF…" : "Export PDF"}
          </Button>
        </div>
      </div>
      <main className="workspace">
        <div className="workspace-intro">
          <div>
            <p className="eyebrow">YOUR NEXT CHAPTER</p>
            <h1>Make your next move.</h1>
            <p>Bring your experience together. Let your work speak.</p>
          </div>
          <div className="intro-note">
            <Security size={20} />
            <span>
              Your story stays yours.
              <br />
              <strong>Saved on this device.</strong>
            </span>
          </div>
        </div>
        <OnlineResumes
          resume={resume}
          draftEpoch={draftEpoch}
          canSave={ready && !storageBlocked}
          onRename={(name) => update({ ...latest.current, name })}
          onOpen={(next) => {
            setUndo(latest.current);
            setUndoShouldDetach(true);
            setStorageBlocked(false);
            setSaveEnabled(true);
            update(next);
            setSection("basics");
            setMobileView("edit");
            setNotice({
              kind: "info",
              title: "Online resume opened",
              message:
                "Use Undo to return to the previous draft, or continue editing this copy.",
            });
          }}
        />
        {notice && (
          <div className="notice-row">
            <InlineNotification
              kind={notice.kind}
              title={notice.title}
              subtitle={notice.message}
              onCloseButtonClick={() => setNotice(null)}
              lowContrast
            />
            {undo && (
              <Button
                kind="ghost"
                size="sm"
                onClick={() => {
                  update(undo);
                  if (undoShouldDetach) setDraftEpoch((value) => value + 1);
                  setUndoShouldDetach(false);
                  setUndo(null);
                  setNotice(null);
                }}
              >
                Undo
              </Button>
            )}
            {saveState === "Draft couldn’t be loaded" && (
              <Button
                kind="tertiary"
                size="sm"
                onClick={() => {
                  try {
                    downloadBlob(
                      new Blob(
                        [
                          localStorage.getItem("resumemaz:v1") ||
                            localStorage.getItem("resumemaz") ||
                            "",
                        ],
                        { type: "application/json" },
                      ),
                      "resumemaz-recovery.json",
                    );
                  } catch {
                    /* Unavailable browser storage is already reported above. */
                  }
                }}
              >
                Export original data
              </Button>
            )}
          </div>
        )}
        <div className="mobile-switch" aria-label="Workspace view">
          <Button
            kind={mobileView === "edit" ? "primary" : "tertiary"}
            size="sm"
            renderIcon={Document}
            onClick={() => setMobileView("edit")}
            aria-pressed={mobileView === "edit"}
          >
            Edit details
          </Button>
          <Button
            kind={mobileView === "preview" ? "primary" : "tertiary"}
            size="sm"
            renderIcon={View}
            onClick={() => setMobileView("preview")}
            aria-pressed={mobileView === "preview"}
          >
            Live preview
          </Button>
        </div>
        <div className={`builder-grid view-${mobileView}`}>
          <aside className="section-sidebar" aria-label="Resume sections">
            <div className="sidebar-label">
              YOUR RESUME{" "}
              <span>
                {included}/{sections.length}
              </span>
            </div>
            <nav>
              {sections.map((item, i) => (
                <button
                  key={item.id}
                  aria-current={section === item.id ? "step" : undefined}
                  onClick={() => selectSection(item.id)}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  {hasContent(item.id) ? (
                    <Checkmark size={14} className="section-check" />
                  ) : (
                    <span className="section-number">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <div className="sidebar-bottom">
              <div>
                <Document size={18} />
                <p>
                  One story.
                  <br />
                  Plenty of possibilities.
                </p>
              </div>
              <Button
                kind="ghost"
                size="sm"
                renderIcon={Renew}
                onClick={() => setConfirm("reset")}
              >
                Start blank
              </Button>
            </div>
          </aside>
          <section
            id="editor"
            className="editor-panel"
            aria-labelledby="editor-heading"
            tabIndex={-1}
          >
            <div className="editor-heading">
              <p className="step-label">
                SECTION {String(currentIndex + 1).padStart(2, "0")}{" "}
                <span>/ 08</span>
              </p>
              <h2 ref={editorTitle} tabIndex={-1} id="editor-heading">
                {current.label}
              </h2>
              <p>{current.description}</p>
            </div>
            {example && (
              <div className="example-note">
                <Information size={16} />
                <p>
                  This is an example. Make it yours, or{" "}
                  <button onClick={() => setConfirm("reset")}>
                    start with a blank page
                  </button>
                  .
                </p>
              </div>
            )}
            {storageBlocked && (
              <p className="editor-recovery">
                Autosave is paused to protect your unreadable draft. Download
                your original data, then import a backup or choose Start blank
                in How it works.
              </p>
            )}
            <div className="editor-content" key={section}>
              {section === "basics" && (
                <>
                  <div className="photo-field">
                    <div className="photo-avatar">
                      {/^data:image\/(png|jpeg|webp);base64,/.test(
                        resume.basics.photo,
                      ) ? (
                        <img src={resume.basics.photo} alt="Your profile" />
                      ) : (
                        <User size={28} />
                      )}
                    </div>
                    <div>
                      <FileUploaderButton
                        labelText={
                          resume.basics.photo ? "Replace photo" : "Add a photo"
                        }
                        buttonKind="ghost"
                        size="sm"
                        accept={["image/png", "image/jpeg", "image/webp"]}
                        onChange={uploadPhoto}
                        disableLabelChanges
                      />
                      <p>Optional · JPG, PNG, WebP · max 1.5 MB</p>
                    </div>
                    {resume.basics.photo && (
                      <Button
                        kind="ghost"
                        size="sm"
                        hasIconOnly
                        renderIcon={TrashCan}
                        iconDescription="Remove photo"
                        onClick={() =>
                          update({
                            ...resume,
                            basics: { ...resume.basics, photo: "" },
                          })
                        }
                      />
                    )}
                  </div>
                  <div className="field-grid">
                    {basicField(
                      "firstName",
                      "First name",
                      "e.g. Alex",
                      "text",
                      "given-name",
                    )}
                    {basicField(
                      "lastName",
                      "Last name",
                      "e.g. Morgan",
                      "text",
                      "family-name",
                    )}
                    <div className="full-width">
                      {basicField(
                        "jobTitle",
                        "Professional title",
                        "e.g. Product Designer",
                        "text",
                        "organization-title",
                      )}
                    </div>
                    {basicField(
                      "email",
                      "Email address",
                      "you@example.com",
                      "email",
                      "email",
                    )}
                    {basicField(
                      "phone",
                      "Phone number",
                      "+62 812 3456 7890",
                      "tel",
                      "tel",
                    )}
                    {basicField(
                      "city",
                      "City",
                      "e.g. Jakarta",
                      "text",
                      "address-level2",
                    )}
                    {basicField(
                      "country",
                      "Country",
                      "e.g. Indonesia",
                      "text",
                      "country-name",
                    )}
                    <div className="full-width optional-field">
                      {basicField(
                        "dateOfBirth",
                        "Date of birth (optional)",
                        "e.g. 12 May 1995",
                      )}
                      <p>
                        Only include this if it’s relevant to your application.
                      </p>
                    </div>
                  </div>
                </>
              )}
              {section === "summary" && (
                <>
                  <TextArea
                    id="summary"
                    labelText="Professional summary"
                    placeholder="What do you do, what do you bring, and what are you looking for next?"
                    rows={10}
                    maxLength={30_000}
                    value={resume.summary}
                    onChange={(e) =>
                      update({ ...resume, summary: e.target.value })
                    }
                  />
                  <div className="writing-tip">
                    <Information size={18} />
                    <p>
                      Keep it focused. Introduce your role, add a concrete
                      achievement, and show what you bring to your next team.
                    </p>
                  </div>
                </>
              )}
              {(section === "experience" ||
                section === "education" ||
                section === "projects" ||
                section === "certifications") &&
                entryForm(section)}
              {section === "skills" && (
                <>
                  <p className="section-helper">
                    A focused list is easier to scan. Start with your strongest
                    skills.
                  </p>
                  {resume.skills.map((skill, i) => (
                    <div className="skill-row" key={skill.id}>
                      <TextInput
                        id={`${skill.id}-name`}
                        labelText={`Skill ${i + 1}`}
                        value={skill.name}
                        placeholder="e.g. User research"
                        maxLength={500}
                        onChange={(e) =>
                          update({
                            ...resume,
                            skills: resume.skills.map((item) =>
                              item.id === skill.id
                                ? { ...item, name: e.target.value }
                                : item,
                            ),
                          })
                        }
                      />
                      <Select
                        id={`${skill.id}-level`}
                        labelText="Level"
                        value={skill.level}
                        onChange={(e) =>
                          update({
                            ...resume,
                            skills: resume.skills.map((item) =>
                              item.id === skill.id
                                ? { ...item, level: e.target.value }
                                : item,
                            ),
                          })
                        }
                      >
                        {[
                          "",
                          "Beginner",
                          "Intermediate",
                          "Advanced",
                          "Expert",
                        ].map((level) => (
                          <SelectItem
                            key={level}
                            value={level}
                            text={level || "Not shown"}
                          />
                        ))}
                      </Select>
                      <Button
                        kind="ghost"
                        size="md"
                        hasIconOnly
                        renderIcon={TrashCan}
                        iconDescription={`Remove skill ${i + 1}`}
                        onClick={() => removeItem("skills", skill.id)}
                      />
                    </div>
                  ))}
                  <Button
                    kind="tertiary"
                    renderIcon={Add}
                    disabled={resume.skills.length >= 100}
                    onClick={() =>
                      update({
                        ...resume,
                        skills: [
                          ...resume.skills,
                          { id: crypto.randomUUID(), name: "", level: "" },
                        ],
                      })
                    }
                  >
                    Add skill
                  </Button>
                </>
              )}
              {section === "links" && (
                <>
                  <p className="section-helper">
                    Add a portfolio, LinkedIn profile, or a project worth
                    sharing.
                  </p>
                  {resume.links.map((link, i) => (
                    <div className="link-entry" key={link.id}>
                      <div className="entry-actions">
                        <strong>Link {i + 1}</strong>
                        <Button
                          kind="ghost"
                          size="sm"
                          hasIconOnly
                          renderIcon={TrashCan}
                          iconDescription={`Remove link ${i + 1}`}
                          onClick={() => removeItem("links", link.id)}
                        />
                      </div>
                      <TextInput
                        id={`${link.id}-label`}
                        labelText="Label"
                        placeholder="e.g. Portfolio"
                        maxLength={500}
                        value={link.label}
                        onChange={(e) =>
                          update({
                            ...resume,
                            links: resume.links.map((item) =>
                              item.id === link.id
                                ? { ...item, label: e.target.value }
                                : item,
                            ),
                          })
                        }
                      />
                      <TextInput
                        id={`${link.id}-url`}
                        labelText="Website URL"
                        placeholder="https://example.com"
                        maxLength={2000}
                        value={link.url}
                        invalid={Boolean(link.url && !safeUrl(link.url))}
                        invalidText="Enter a valid http or https website address."
                        onChange={(e) =>
                          update({
                            ...resume,
                            links: resume.links.map((item) =>
                              item.id === link.id
                                ? { ...item, url: e.target.value }
                                : item,
                            ),
                          })
                        }
                      />
                    </div>
                  ))}
                  <Button
                    kind="tertiary"
                    renderIcon={Add}
                    disabled={resume.links.length >= 100}
                    onClick={() =>
                      update({
                        ...resume,
                        links: [
                          ...resume.links,
                          { id: crypto.randomUUID(), label: "", url: "" },
                        ],
                      })
                    }
                  >
                    Add link
                  </Button>
                </>
              )}
            </div>
            <div className="editor-footer">
              {currentIndex > 0 ? (
                <Button
                  kind="ghost"
                  size="md"
                  renderIcon={ArrowLeft}
                  onClick={() =>
                    selectSection(sections[currentIndex - 1].id, true)
                  }
                >
                  Back
                </Button>
              ) : (
                <span className="footer-hint">
                  <CheckmarkOutline size={16} /> Your changes save automatically
                </span>
              )}
              {currentIndex < sections.length - 1 ? (
                <Button
                  kind="primary"
                  size="md"
                  renderIcon={ArrowRight}
                  onClick={() =>
                    selectSection(sections[currentIndex + 1].id, true)
                  }
                >
                  Continue
                </Button>
              ) : (
                <Button
                  kind="primary"
                  size="md"
                  renderIcon={Download}
                  onClick={exportPdf}
                  disabled={exporting}
                >
                  Export PDF
                </Button>
              )}
            </div>
          </section>
          <section className="preview-panel" aria-label="Live preview">
            <div className="preview-toolbar">
              <div>
                <span className="live-dot" />
                <h2>Live preview</h2>
              </div>
              <Button
                kind="ghost"
                size="sm"
                renderIcon={View}
                onClick={() => setZoomed(!zoomed)}
                aria-pressed={zoomed}
              >
                {zoomed ? "Fit page" : "Zoom in"}
              </Button>
            </div>
            <div className="preview-controls">
              <span>
                <Settings size={16} /> Make it yours
              </span>
              <Select
                id="accent"
                labelText="Accent color"
                hideLabel
                size="sm"
                value={resume.settings.accent}
                onChange={(e) =>
                  update({
                    ...resume,
                    settings: {
                      ...resume.settings,
                      accent: e.target.value as Resume["settings"]["accent"],
                    },
                  })
                }
              >
                <SelectItem value="blue" text="Carbon blue" />
                <SelectItem value="graphite" text="Graphite" />
                <SelectItem value="teal" text="Teal" />
              </Select>
              <Select
                id="paper"
                labelText="Paper size"
                hideLabel
                size="sm"
                value={resume.settings.paper}
                onChange={(e) =>
                  update({
                    ...resume,
                    settings: {
                      ...resume.settings,
                      paper: e.target.value as "A4" | "LETTER",
                    },
                  })
                }
              >
                <SelectItem value="A4" text="A4" />
                <SelectItem value="LETTER" text="Letter" />
              </Select>
            </div>
            <div className={`preview-canvas${zoomed ? " is-zoomed" : ""}`}>
              {" "}
              <ResumePreview resume={resume} />
            </div>
            <div className="preview-caption">
              <Document size={14} />
              <span>
                {resume.settings.paper === "A4"
                  ? "A4 · 210 × 297 mm"
                  : "Letter · 8.5 × 11 in"}
                <span className="caption-divider">/</span>PDF paginates
                automatically
              </span>
            </div>
          </section>
        </div>
        <footer className="workspace-footer">
          <span>Made for what comes next.</span>
          <span>Free to create. Yours to keep.</span>
        </footer>
      </main>
      <Modal
        open={showHelp}
        modalHeading="Your experience, thoughtfully put together."
        modalLabel="WELCOME TO RESUMEMAZ"
        primaryButtonText="Let’s get started"
        secondaryButtonText="Close"
        onRequestClose={() => setShowHelp(false)}
        onRequestSubmit={() => setShowHelp(false)}
        size="sm"
      >
        <div className="help-content">
          <Button
            kind="ghost"
            renderIcon={Renew}
            onClick={() => {
              setShowHelp(false);
              setConfirm("reset");
            }}
          >
            Start with a blank resume
          </Button>
          <p>
            <strong>01 · Tell your story</strong>
            <br />
            Work through the sections. Everything is optional, and your preview
            updates as you type.
          </p>
          <p>
            <strong>02 · Make it yours</strong>
            <br />
            Choose an accent and paper size. Your draft saves in this browser on
            this device.
          </p>
          <p>
            <strong>03 · Take it with you</strong>
            <br />
            Export a PDF for applications. Download a JSON backup to edit your
            resume later or move it to another device.
          </p>
          <p className="help-local">
            <Security size={20} />
            Sign in to save a private online copy. Local edits save
            automatically; choose Save online to update your online copy. Keep a
            JSON backup before clearing browser data or switching devices.
          </p>
        </div>
      </Modal>
      <Modal
        open={confirm !== null}
        danger={confirm === "reset"}
        modalLabel="YOUR LOCAL DRAFT"
        modalHeading={
          confirm === "reset"
            ? "Start with a blank page?"
            : "Import this resume?"
        }
        primaryButtonText={
          confirm === "reset" ? "Start blank" : "Import resume"
        }
        secondaryButtonText="Keep editing"
        onRequestClose={() => setConfirm(null)}
        onRequestSubmit={() => {
          setUndo(resume);
          setUndoShouldDetach(true);
          setDraftEpoch((value) => value + 1);
          setStorageBlocked(false);
          setSaveEnabled(true);
          update(
            confirm === "import" && pendingImport
              ? pendingImport
              : blankResume(),
          );
          setSection("basics");
          setConfirm(null);
          setPendingImport(null);
          setNotice({
            kind: "info",
            title: "Your draft is ready",
            message: "You can use Undo to return to the previous draft.",
          });
        }}
        size="sm"
      >
        <p>
          This replaces the resume in the editor. Download a backup first if you
          want to keep a separate copy.
        </p>
        <Button kind="ghost" renderIcon={Download} onClick={backup}>
          Download current backup
        </Button>
      </Modal>
    </>
  );
}
