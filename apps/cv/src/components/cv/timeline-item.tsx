interface TimelineItemProps {
  details?: string[];
  href?: string;
  period: string;
  subtitle: string;
  title: string;
}

export function TimelineItem({
  period,
  title,
  subtitle,
  href,
  details,
}: TimelineItemProps) {
  return (
    <div className="flex flex-col pl-4 text-sm md:flex-row md:gap-4 md:pl-0">
      <p className="w-24 shrink-0 text-muted-foreground md:w-32">{period}</p>
      <div className="flex-2">
        <p className="font-medium">
          {href ? (
            <a
              className="hover:underline"
              href={href}
              rel="noopener noreferrer"
              target="_blank"
            >
              {title}
            </a>
          ) : (
            title
          )}
        </p>
        <p className="text-muted-foreground">{subtitle}</p>
        {details && details.length > 0 && (
          <ul className="mt-2 mb-5 list-inside list-disc">
            {details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
