import { Link } from "@tanstack/react-router";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type HeadingProps = ComponentPropsWithoutRef<"h1">;
type ParagraphProps = ComponentPropsWithoutRef<"p">;
type ListProps = ComponentPropsWithoutRef<"ul">;
type ListItemProps = ComponentPropsWithoutRef<"li">;
type AnchorProps = ComponentPropsWithoutRef<"a">;
type BlockquoteProps = ComponentPropsWithoutRef<"blockquote">;

export const mdxComponents = {
  h1: (props: HeadingProps) => (
    <h1 className="mb-5 pt-12 font-medium" {...props} />
  ),
  h2: (props: HeadingProps) => (
    <h2
      className="mt-8 mb-3 font-medium text-[0.875rem] md:text-[]"
      {...props}
    />
  ),
  h3: (props: HeadingProps) => (
    <h3 className="mt-8 mb-3 font-medium text-[0.875rem]" {...props} />
  ),
  h4: (props: HeadingProps) => <h4 className="font-medium" {...props} />,
  p: (props: ParagraphProps) => <p className="leading-snug" {...props} />,
  ol: (props: ListProps) => (
    <ol className="list-decimal space-y-2 pl-5" {...props} />
  ),
  ul: (props: ListProps) => (
    <ul className="list-disc space-y-1 pl-5" {...props} />
  ),
  li: (props: ListItemProps) => <li className="pl-1" {...props} />,
  em: (props: ComponentPropsWithoutRef<"em">) => (
    <em className="font-normal" {...props} />
  ),
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-normal" {...props} />
  ),
  a: ({ href, children }: AnchorProps) => {
    const className = "underline-offset-4 underline decoration-dashed";
    if (href?.startsWith("/")) {
      return (
        <Link className={className} to={href}>
          {children as ReactNode}
        </Link>
      );
    }
    if (href?.startsWith("#")) {
      return (
        <a className={className} href={href}>
          {children}
        </a>
      );
    }
    return (
      <a
        className={className}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {children}
      </a>
    );
  },

  blockquote: (props: BlockquoteProps) => (
    <blockquote
      className="ml-[0.075em] border-gray-300 border-l-3 pl-4"
      {...props}
    />
  ),
};
