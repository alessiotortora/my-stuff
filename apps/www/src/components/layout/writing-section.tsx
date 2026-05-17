import { Link } from "@tanstack/react-router";

export function WritingSection() {
  const writings = [
    {
      label: "My Stack",
      description: "A list of my favorite tools and technologies",
      href: "/writing/stack",
    },
    {
      label: "Use AI as a tool to be faster and smarter",
      description:
        "Why I lean into AI daily — and where to keep your own brain in the loop",
      href: "/writing/ai",
    },
  ];

  return (
    <div className="mt-8 flex flex-col gap-3 md:mt-14">
      <h2 className="font-medium text-[0.940rem] md:text-[0.985rem]">
        Writing
      </h2>
      <div className="flex flex-col gap-2">
        {writings.map((writing) => (
          <Link
            className="-mx-2 rounded-md p-2 hover:bg-muted-foreground/5"
            key={writing.label}
            to={writing.href}
          >
            <div className="flex flex-col gap-0">
              <p className="font-normal">{writing.label}</p>
              <p>{writing.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
