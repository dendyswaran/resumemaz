import type { CSSProperties } from "react";
import {
  accents,
  dateRange,
  descriptionLines,
  fullName,
  location,
  safeUrl,
  type Resume,
  type ResumeEntry,
} from "../lib/resume";

export function EntryList({
  title,
  items,
}: {
  title: string;
  items: ResumeEntry[];
}) {
  const visible = items.filter(
    (item) => item.title || item.organization || item.description,
  );
  if (!visible.length) return null;
  return (
    <section className="resume-section">
      <h3>{title}</h3>
      {visible.map((item) => (
        <div className="resume-entry" key={item.id}>
          <div className="resume-entry-heading">
            <h4>{item.title || item.organization}</h4>
            <span>{dateRange(item)}</span>
          </div>
          <p className="resume-organization">
            {[item.title && item.organization, item.city]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {item.description && (
            <ul>
              {descriptionLines(item.description).map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </section>
  );
}

export default function ResumePreview({ resume }: { resume: Resume }) {
  const { basics } = resume;
  const photo = /^data:image\/(png|jpeg|webp);base64,/.test(basics.photo)
    ? basics.photo
    : undefined;
  return (
    <article
      aria-label="Resume document"
      className={`resume-paper paper-${resume.settings.paper.toLowerCase()}`}
      style={
        { "--resume-accent": accents[resume.settings.accent] } as CSSProperties
      }
    >
      <header className="resume-heading">
        <div>
          <h2>{fullName(resume) || "Your name"}</h2>
          <p className="resume-role">
            {basics.jobTitle || "Your professional title"}
          </p>
        </div>
        {photo && <img className="resume-photo" src={photo} alt="Profile" />}
      </header>
      <div className="resume-contact">
        {[location(resume), basics.email, basics.phone]
          .filter(Boolean)
          .map((text, i) => (
            <span key={i}>{text}</span>
          ))}
      </div>
      {resume.links.some((link) => link.url) && (
        <div className="resume-links">
          {resume.links
            .filter((link) => link.url)
            .map((link) =>
              safeUrl(link.url) ? (
                <a
                  key={link.id}
                  href={safeUrl(link.url)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.label || link.url}
                </a>
              ) : (
                <span key={link.id}>{link.label || link.url}</span>
              ),
            )}
        </div>
      )}
      {basics.dateOfBirth && (
        <p className="resume-birth">Date of birth: {basics.dateOfBirth}</p>
      )}
      {resume.summary && (
        <section className="resume-section">
          <h3>Profile</h3>
          <p className="resume-summary">{resume.summary}</p>
        </section>
      )}
      <EntryList title="Experience" items={resume.experience} />
      <EntryList title="Projects" items={resume.projects} />
      <EntryList title="Education" items={resume.education} />
      <EntryList title="Certifications" items={resume.certifications} />
      {resume.skills.some((skill) => skill.name) && (
        <section className="resume-section">
          <h3>Skills</h3>
          <p className="resume-skills">
            {resume.skills
              .filter((skill) => skill.name)
              .map((skill) => (
                <span key={skill.id}>
                  {skill.name}
                  {skill.level ? <small> / {skill.level}</small> : ""}
                </span>
              ))}
          </p>
        </section>
      )}
    </article>
  );
}
