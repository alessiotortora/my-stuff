import { Link } from "@tanstack/react-router";

export function Header({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8 flex flex-col items-start md:mb-12">
      <Link className="inline-block font-medium text-base" to="/">
        <h1>{title}</h1>
      </Link>
      <span className="font-light text-sm leading-none">{description}</span>
    </div>
  );
}
