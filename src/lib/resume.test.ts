import { describe, expect, test } from "bun:test";
import {
  blankResume,
  dateRange,
  descriptionLines,
  fileName,
  parseResume,
  safeUrl,
  sampleResume,
} from "./resume";
import { localResumeRepository, STORAGE_KEY } from "./storage";

describe("resume document and migration", () => {
  test("round trips a current backup without losing fields", () => {
    const resume = sampleResume();
    resume.projects = [
      {
        id: "p1",
        title: "New project",
        organization: "",
        startDate: "",
        endDate: "",
        city: "",
        description: "A real result",
      },
    ];
    resume.certifications = [
      { ...resume.projects[0], id: "c1", title: "Certification" },
    ];
    resume.basics.dateOfBirth = "12 May 1995";
    resume.settings = { accent: "teal", paper: "LETTER" };
    expect(parseResume(JSON.parse(JSON.stringify(resume)))).toEqual(resume);
  });
  test("migrates every legacy collection and description", () => {
    const convert = (html: string) => html.replace(/<[^>]+>/g, "");
    const migrated = parseResume(
      {
        firstName: "Dendy",
        email: "xxx@xxx.com",
        profileDescription: "<p>Designer</p>",
        profilePicture: "photo-data",
        employmentHistories: [
          {
            jobTitle: "Lead",
            employer: "Studio",
            description: "<p>Built things</p>",
          },
        ],
        educationHistories: [{ school: "University", degree: "Design" }],
        featuredProjects: [{ activity: "Portfolio" }],
        certificationHistories: [{ activity: "Certificate" }],
        skills: [{ skillName: "React", experience: "Expert" }],
        socialLinks: [{ label: "Work", link: "https://example.com" }],
      },
      convert,
    );
    expect(migrated.basics.firstName).toBe("Dendy");
    expect(migrated.basics.email).toBe("");
    expect(migrated.basics.photo).toBe("photo-data");
    expect(migrated.summary).toBe("Designer");
    expect(migrated.experience[0]).toMatchObject({
      title: "Lead",
      organization: "Studio",
      description: "Built things",
    });
    expect(migrated.education[0]).toMatchObject({
      title: "Design",
      organization: "University",
    });
    expect(migrated.projects[0].title).toBe("Portfolio");
    expect(migrated.certifications[0].title).toBe("Certificate");
    expect(migrated.skills[0]).toMatchObject({
      name: "React",
      level: "Expert",
    });
    expect(migrated.links[0]).toMatchObject({
      label: "Work",
      url: "https://example.com",
    });
  });
  test("rejects unrecognized, unsupported, and malformed backups", () => {
    for (const input of [
      null,
      [],
      {},
      { version: 99 },
      { ...blankResume(), skills: "wrong" },
      { ...blankResume(), basics: null },
    ]) {
      expect(() => parseResume(input)).toThrow();
    }
  });
  test("uses safe links and portable filenames", () => {
    expect(safeUrl("example.com/work")).toBe("https://example.com/work");
    for (const input of [
      "javascript:alert(1)",
      "data:text/html,test",
      "file:///etc/passwd",
      "https://",
      "hello world",
    ])
      expect(safeUrl(input)).toBeUndefined();
    const resume = blankResume();
    resume.basics.firstName = "Alex / Morgan";
    expect(fileName(resume)).toBe("Alex-Morgan");
  });
  test("rejects duplicate entry IDs that would make editing ambiguous", () => {
    const resume = sampleResume();
    resume.experience.push({ ...resume.experience[0] });
    expect(() => parseResume(resume)).toThrow();
  });
  test("keeps blank sections empty and formats highlights and dates", () => {
    expect(blankResume().experience).toEqual([]);
    expect(descriptionLines("• First\n- Second\n\nThird")).toEqual([
      "First",
      "Second",
      "Third",
    ]);
    expect(dateRange({ ...sampleResume().experience[0], endDate: "" })).toBe(
      "2022",
    );
  });
});

test("browser repository persists valid documents and never overwrites corrupt data during load", () => {
  const originalStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  );
  const data = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
    },
  });
  try {
    expect(localResumeRepository.load()).toBeNull();
    const resume = sampleResume();
    localResumeRepository.save(resume);
    expect(localResumeRepository.load()).toEqual(resume);
    data.set(STORAGE_KEY, "{bad data");
    expect(() => localResumeRepository.load()).toThrow();
    expect(data.get(STORAGE_KEY)).toBe("{bad data");
  } finally {
    if (originalStorage)
      Object.defineProperty(globalThis, "localStorage", originalStorage);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});
