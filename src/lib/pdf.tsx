import {
  Document,
  Font,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import regularFont from "@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff?url";
import mediumFont from "@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-500-normal.woff?url";
import {
  accents,
  dateRange,
  descriptionLines,
  fullName,
  location,
  safeUrl,
  type Resume,
  type ResumeEntry,
} from "./resume";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Plex",
    fontSize: 10,
    lineHeight: 1.5,
    paddingTop: 45,
    paddingBottom: 45,
    paddingHorizontal: 45,
    color: "#262626",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 11,
  },
  name: { fontSize: 31, fontWeight: 500, lineHeight: 1.15, maxWidth: 420 },
  role: { fontSize: 13, marginTop: 7 },
  photo: {
    width: 52,
    height: 52,
    objectFit: "cover",
    borderRadius: 26,
    marginLeft: 10,
  },
  contact: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    fontSize: 9,
    color: "#525252",
    marginBottom: 6,
  },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    fontSize: 9,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: 20,
    marginBottom: 9,
    paddingBottom: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#d6d6d6",
  },
  entry: { marginBottom: 11 },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  entryTitle: { fontSize: 11, fontWeight: 500, flexGrow: 1, flexShrink: 1 },
  date: { fontSize: 8.5, color: "#525252", flexShrink: 0, maxWidth: 170 },
  organization: { fontSize: 9, color: "#525252", marginBottom: 4 },
  bullet: { flexDirection: "row", gap: 6, marginBottom: 2 },
  bulletText: { flex: 1 },
  skills: { flexDirection: "row", flexWrap: "wrap", gap: 7, fontSize: 9.5 },
});

function PdfEntries({
  title,
  items,
  color,
}: {
  title: string;
  items: ResumeEntry[];
  color: string;
}) {
  const visible = items.filter(
    (item) => item.title || item.organization || item.description,
  );
  if (!visible.length) return null;
  return (
    <View>
      {visible.map((item, index) => (
        <View key={item.id} style={styles.entry}>
          <View wrap={false} minPresenceAhead={25}>
            {index === 0 && (
              <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
            )}
            <View style={styles.entryHeader}>
              <Text style={styles.entryTitle}>
                {item.title || item.organization}
              </Text>
              <Text style={styles.date}>{dateRange(item)}</Text>
            </View>
            <Text style={styles.organization}>
              {[item.title && item.organization, item.city]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </View>
          {descriptionLines(item.description).map((line, i) => (
            <View key={i} style={styles.bullet}>
              <Text>•</Text>
              <Text style={styles.bulletText}>{line}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export function ResumePdf({ resume }: { resume: Resume }) {
  const color = accents[resume.settings.accent];
  const { basics } = resume;
  return (
    <Document
      title={`${fullName(resume) || "Resume"} — Resume`}
      author={fullName(resume)}
      language="en"
    >
      <Page size={resume.settings.paper} style={styles.page}>
        <View style={styles.header} wrap={false}>
          <View>
            <Text style={styles.name}>{fullName(resume) || "Your name"}</Text>
            <Text style={[styles.role, { color }]}>
              {basics.jobTitle || "Your professional title"}
            </Text>
          </View>
          {/^data:image\/(png|jpeg);base64,/.test(basics.photo) && (
            <Image style={styles.photo} src={basics.photo} />
          )}
        </View>
        <View style={styles.contact}>
          {[location(resume), basics.email, basics.phone]
            .filter(Boolean)
            .map((item, i) => (
              <Text key={i}>{item}</Text>
            ))}
        </View>
        <View style={styles.links}>
          {resume.links
            .filter((item) => item.url)
            .map((item) =>
              safeUrl(item.url) ? (
                <Link key={item.id} src={safeUrl(item.url)!} style={{ color }}>
                  {item.label || item.url}
                </Link>
              ) : (
                <Text key={item.id}>{item.label || item.url}</Text>
              ),
            )}
        </View>
        {basics.dateOfBirth && (
          <Text style={styles.organization}>
            Date of birth: {basics.dateOfBirth}
          </Text>
        )}
        {resume.summary && (
          <View>
            <Text
              style={[styles.sectionTitle, { color }]}
              minPresenceAhead={40}
            >
              Profile
            </Text>
            <Text>{resume.summary}</Text>
          </View>
        )}
        <PdfEntries
          title="Experience"
          items={resume.experience}
          color={color}
        />
        <PdfEntries title="Projects" items={resume.projects} color={color} />
        <PdfEntries title="Education" items={resume.education} color={color} />
        <PdfEntries
          title="Certifications"
          items={resume.certifications}
          color={color}
        />
        {resume.skills.some((item) => item.name) && (
          <View>
            <Text
              style={[styles.sectionTitle, { color }]}
              minPresenceAhead={30}
            >
              Skills
            </Text>
            <View style={styles.skills}>
              {resume.skills
                .filter((item) => item.name)
                .map((item) => (
                  <Text key={item.id}>
                    {item.name}
                    {item.level ? ` / ${item.level}` : ""}
                    {"   "}
                  </Text>
                ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function createResumePdf(resume: Resume): Promise<Blob> {
  Font.register({
    family: "Plex",
    fonts: [
      {
        src: new URL(regularFont, window.location.origin).href,
        fontWeight: 400,
      },
      {
        src: new URL(mediumFont, window.location.origin).href,
        fontWeight: 500,
      },
    ],
  });
  // The PDF renderer accepts PNG/JPEG. Normalize WebP entirely on this device.
  if (/^data:image\/webp;base64,/.test(resume.basics.photo)) {
    const image = new window.Image();
    image.src = resume.basics.photo;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image conversion unavailable");
    context.drawImage(image, 0, 0);
    resume = {
      ...resume,
      basics: { ...resume.basics, photo: canvas.toDataURL("image/png") },
    };
  }
  return pdf(<ResumePdf resume={resume} />).toBlob();
}
