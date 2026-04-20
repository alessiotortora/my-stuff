import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@repo/ui/components/button";

const links = [
  { label: "Email", href: "mailto:hello@alessiotortora.com" },
  { label: "CV", href: "https://cv.alessiotortora.com" },
  { label: "GitHub", href: "https://github.com/alessiotortora" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/alessiotortora" },
  { label: "X", href: "https://x.com/alessiotortora_" },
];

export function LinkSection() {
  return (
    <div className="mt-8 flex flex-col gap-3 md:mt-14">
      <h2 className="font-medium text-[0.940rem] md:text-[0.985rem]">
        Let's get in touch
      </h2>
      <div className="flex flex-wrap items-center gap-3">
        {links.map((link) => (
          <Button
            className="font-light"
            icon={
              <HugeiconsIcon className="size-4" icon={ArrowUpRight01Icon} />
            }
            key={link.label}
            variant="link"
          >
            <a href={link.href} rel="noopener noreferrer" target="_blank">
              {link.label}
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
}
