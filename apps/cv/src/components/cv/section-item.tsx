import { ExternalLinkIcon } from "@radix-ui/react-icons";

interface SectionItemProps {
  href?: string;
  label: string;
  value: string;
}

export function SectionItem({ label, value, href }: SectionItemProps) {
  return (
    <div className="flex flex-col pl-4 text-sm md:flex-row md:gap-4 md:pl-0">
      <span className="w-24 shrink-0 text-muted-foreground md:w-32">
        {label}
      </span>
      {href ? (
        <a
          className="flex items-center gap-1 text-foreground hover:underline"
          href={href}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span>{value}</span>
          <ExternalLinkIcon className="h-3.5 w-3.5" />
        </a>
      ) : (
        <span className="text-foreground">{value}</span>
      )}
    </div>
  );
}
