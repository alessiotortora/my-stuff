import { LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import cvData from "../../data/cv.json";
import type { CVData, EducationEntry, TimelineEntry } from "../../types/cv";
import { Section } from "./section";
import { SectionItem } from "./section-item";
import { TimelineItem } from "./timeline-item";

const SENTENCE_SPLIT = /\. /;
const AT_PREFIX = /^@/;

export function Profile({ data = cvData }: { data?: CVData }) {
  return (
    <div className="space-y-12">
      <Section title="About">
        <div className="space-y-4 pl-4 md:pl-0">
          {(() => {
            const [firstPart, ...rest] =
              data.about.summary.split(SENTENCE_SPLIT);
            return [
              <p key="first">{firstPart}.</p>,
              <p key="second">{rest.join(". ")}</p>,
            ];
          })()}
        </div>
      </Section>

      <Section title="Languages">
        {data.languages.map(({ language, level }) => (
          <SectionItem key={language} label={language} value={level} />
        ))}
      </Section>

      <Section title="Soft Skills">
        {Object.entries(data.soft).map(([key, value]) => (
          <SectionItem key={key} label={key} value={value} />
        ))}
      </Section>

      <Section title="Skills">
        <ul className="flex flex-wrap gap-2 pl-4 text-foreground text-sm md:pl-0">
          {data.skills.map((skill) => (
            <li
              className="rounded-md bg-secondary px-2 py-1 font-medium text-xs"
              key={skill}
            >
              {skill}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Projects">
        <p className="pl-4 md:pl-0">
          {data.projects.summary.replace("Website.", "")}{" "}
          <a
            className="inline-flex items-center gap-1 hover:underline"
            href={data.projects.link}
          >
            website
            <HugeiconsIcon className="h-3.5 w-3.5" icon={LinkSquare02Icon} />
          </a>
        </p>
      </Section>

      {[
        { key: "experience" as const, title: "Experience" },
        { key: "volunteering" as const, title: "Volunteering" },
      ].map(({ key, title }) => (
        <Section key={key} title={title}>
          {data[key].map((item: TimelineEntry) => (
            <TimelineItem
              details={item.details}
              href={item.link}
              key={item.period + item.role}
              period={item.period}
              subtitle={item.location}
              title={item.role}
            />
          ))}
        </Section>
      ))}

      <Section title="Education">
        {data.education.map((item: EducationEntry) => (
          <TimelineItem
            href={item.link}
            key={item.period + item.school}
            period={item.period}
            subtitle={item.school}
            title={item.degree}
          />
        ))}
      </Section>

      <Section title="Contact">
        {Object.entries(data.contact).map(([label, handle]) => {
          let url: string;
          switch (label) {
            case "x":
              url = `https://x.com/${handle.replace(AT_PREFIX, "")}`;
              break;
            case "github":
              url = `https://github.com/${handle}`;
              break;
            case "linkedin":
              url = `https://linkedin.com/in/${handle}`;
              break;
            default:
              url = `https://${handle}`;
          }
          return (
            <SectionItem
              href={url}
              key={label}
              label={capitalize(label)}
              value={handle}
            />
          );
        })}
      </Section>
    </div>
  );
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
