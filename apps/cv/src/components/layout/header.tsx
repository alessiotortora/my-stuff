import { EnvelopeClosedIcon } from "@radix-ui/react-icons";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Link } from "@tanstack/react-router";

export function Header({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8 flex flex-row items-center gap-4 md:mb-12">
      <Avatar className="size-20 hover:animate-spin md:size-24">
        <AvatarImage src="https://github.com/alessiotortora.png" />
        <AvatarFallback>AT</AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-start gap-3">
        <div className="flex flex-col items-start">
          <Link className="inline-block font-medium text-base" to="/">
            <h1>{title}</h1>
          </Link>
          <span className="font-light text-sm leading-none">{description}</span>
        </div>

        <div className="wrap flex flex-row gap-2">
          <Badge variant="secondary">
            <a href="https://www.alessiotortora.com/">alessiotortora.com</a>
          </Badge>
          <Badge icon={<EnvelopeClosedIcon />} variant="default">
            <a href="mailto:hello@alessiotortora.com">contact me</a>
          </Badge>
        </div>
      </div>
    </div>
  );
}
