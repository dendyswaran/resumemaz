import { z } from "zod";

const text = z.string().max(30_000).default("");
const entry = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  title: text,
  organization: text,
  city: text,
  startDate: text,
  endDate: text,
  description: text,
});
export const resumeSchema = z
  .object({
    version: z.literal(1),
    name: z.string().max(200).default("My resume"),
    basics: z.object({
      firstName: text,
      lastName: text,
      jobTitle: text,
      email: text,
      phone: text,
      city: text,
      country: text,
      dateOfBirth: text,
      photo: z.string().max(3_000_000).default(""),
    }),
    summary: text,
    experience: z.array(entry).max(100).default([]),
    projects: z.array(entry).max(100).default([]),
    education: z.array(entry).max(100).default([]),
    certifications: z.array(entry).max(100).default([]),
    skills: z
      .array(z.object({ id: z.string(), name: text, level: text }))
      .max(100)
      .default([]),
    links: z
      .array(z.object({ id: z.string(), label: text, url: text }))
      .max(100)
      .default([]),
    settings: z
      .object({
        accent: z.enum(["blue", "graphite", "teal"]).default("blue"),
        paper: z.enum(["A4", "LETTER"]).default("A4"),
      })
      .default({ accent: "blue", paper: "A4" }),
  })
  .superRefine((resume, context) => {
    for (const key of [
      "experience",
      "projects",
      "education",
      "certifications",
      "skills",
      "links",
    ] as const) {
      if (
        new Set(resume[key].map((item) => item.id)).size !== resume[key].length
      ) {
        context.addIssue({
          code: "custom",
          path: [key],
          message: "Entry IDs must be unique within a section",
        });
      }
    }
  });
export type Resume = z.infer<typeof resumeSchema>;
export type ResumeEntry = z.infer<typeof entry>;
export type EntrySection =
  "experience" | "projects" | "education" | "certifications";
export const accents = {
  blue: "#0f62fe",
  graphite: "#393939",
  teal: "#007d79",
};
export const emptyEntry = (): ResumeEntry => ({
  id: crypto.randomUUID(),
  title: "",
  organization: "",
  city: "",
  startDate: "",
  endDate: "",
  description: "",
});
export function blankResume(): Resume {
  return resumeSchema.parse({ version: 1, basics: {}, summary: "" });
}
export function sampleResume(): Resume {
  const resume = blankResume();
  return {
    ...resume,
    basics: {
      ...resume.basics,
      firstName: "Alex",
      lastName: "Morgan",
      jobTitle: "Product Designer",
      email: "alex@example.com",
      phone: "+62 812 3456 7890",
      city: "Jakarta",
      country: "Indonesia",
    },
    summary:
      "Product designer turning complex problems into thoughtful, accessible digital experiences. I bring a systems mindset, an eye for detail, and a belief that the best work starts with listening.",
    experience: [
      {
        id: "sample-job-1",
        title: "Senior Product Designer",
        organization: "Studio North",
        city: "Jakarta",
        startDate: "2022",
        endDate: "Present",
        description:
          "Led the design of a self-service platform, improving task completion by 32%.\nBuilt a design system used by 4 product teams.\nPartnered with engineering to bring accessible experiences to life.",
      },
      {
        id: "sample-job-2",
        title: "Product Designer",
        organization: "Forma Digital",
        city: "Bandung",
        startDate: "2019",
        endDate: "2022",
        description:
          "Designed end-to-end experiences for web and mobile products.\nTurned research insights into simpler onboarding for 12,000 users.",
      },
    ],
    education: [
      {
        id: "sample-education",
        title: "B.A. in Visual Communication Design",
        organization: "Bandung Institute of Technology",
        city: "Bandung",
        startDate: "2015",
        endDate: "2019",
        description: "",
      },
    ],
    skills: [
      "Product design",
      "User research",
      "Design systems",
      "Prototyping",
      "Figma",
      "Accessibility",
    ].map((name, i) => ({ id: `sample-skill-${i}`, name, level: "Advanced" })),
    links: [
      { id: "sample-link", label: "Portfolio", url: "https://example.com" },
    ],
  };
}

export function safeUrl(value: string): string | undefined {
  try {
    const url = new URL(
      /^https?:\/\//i.test(value) ? value : `https://${value}`,
    );
    if (
      !url.hostname.includes(".") ||
      /\s/.test(value) ||
      (/^[a-z][\w+.-]*:/i.test(value) && !/^https?:/i.test(value))
    )
      return;
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : undefined;
  } catch {
    return;
  }
}
export const fullName = (resume: Resume) =>
  [resume.basics.firstName, resume.basics.lastName].filter(Boolean).join(" ");
export const location = (resume: Resume) =>
  [resume.basics.city, resume.basics.country].filter(Boolean).join(", ");
export const dateRange = (item: ResumeEntry) =>
  [item.startDate, item.endDate].filter(Boolean).join(" — ");
export const descriptionLines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.replace(/^[•\-*]\s*/, "").trim())
    .filter(Boolean);
export const fileName = (resume: Resume) =>
  (fullName(resume) || resume.name || "resume")
    .replace(/[^\p{L}\p{N}_-]+/gu, "-")
    .slice(0, 100);

export function parseResume(
  value: unknown,
  toText: (html: string) => string = (html) => html,
): Resume {
  if (value && typeof value === "object" && "version" in value)
    return resumeSchema.parse(value);
  const history = z.object({
    city: text,
    startDate: text,
    endDate: text,
    description: text,
  });
  const legacy = z
    .object({
      firstName: text,
      lastName: text,
      jobTitle: text,
      email: text,
      phone: text,
      city: text,
      country: text,
      dateOfBirth: text,
      profilePicture: text,
      profileDescription: text,
      employmentHistories: z
        .array(history.extend({ jobTitle: text, employer: text }))
        .default([]),
      featuredProjects: z.array(history.extend({ activity: text })).default([]),
      educationHistories: z
        .array(history.extend({ degree: text, school: text }))
        .default([]),
      certificationHistories: z
        .array(history.extend({ activity: text }))
        .default([]),
      skills: z
        .array(z.object({ skillName: text, experience: text }))
        .default([]),
      socialLinks: z.array(z.object({ label: text, link: text })).default([]),
    })
    .refine(
      (data) =>
        Boolean(data.firstName || data.lastName || data.jobTitle || data.email),
      "Unrecognized resume format",
    )
    .parse(value);
  const clean = (value: string) =>
    value === "xxx@xxx.com" || /^x+([@.\-]x+)*$/.test(value) ? "" : value;
  const {
    profilePicture,
    profileDescription,
    employmentHistories,
    featuredProjects,
    educationHistories,
    certificationHistories,
    skills,
    socialLinks,
    ...basics
  } = legacy;
  const convert = <
    T extends {
      city: string;
      startDate: string;
      endDate: string;
      description: string;
    },
  >(
    items: T[],
    title: (item: T) => string,
    organization: (item: T) => string,
  ): ResumeEntry[] =>
    items.map((item) => ({
      ...emptyEntry(),
      ...item,
      title: title(item),
      organization: organization(item),
      description: toText(item.description),
    }));
  return resumeSchema.parse({
    ...blankResume(),
    basics: {
      ...Object.fromEntries(
        Object.entries(basics).map(([k, v]) => [k, clean(v)]),
      ),
      photo: profilePicture,
    },
    summary: toText(profileDescription),
    experience: convert(
      employmentHistories,
      (item) => item.jobTitle,
      (item) => item.employer,
    ),
    projects: convert(
      featuredProjects,
      (item) => item.activity,
      () => "",
    ),
    education: convert(
      educationHistories,
      (item) => item.degree,
      (item) => item.school,
    ),
    certifications: convert(
      certificationHistories,
      (item) => item.activity,
      () => "",
    ),
    skills: skills.map((item) => ({
      id: crypto.randomUUID(),
      name: item.skillName,
      level: item.experience,
    })),
    links: socialLinks.map((item) => ({
      id: crypto.randomUUID(),
      label: item.label,
      url: item.link,
    })),
  });
}
