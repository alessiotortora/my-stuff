import { createFileRoute } from "@tanstack/react-router";
import Container from "#/components/layout/container";
import StackContent from "#/content/writing/stack.mdx";
import { mdxComponents } from "#/mdx-components";

export const Route = createFileRoute("/writing/stack")({
  component: StackPage,
  head: () => ({
    meta: [{ title: "My Stack | Alessio Tortora" }],
  }),
});

function StackPage() {
  return (
    <Container>
      <StackContent components={mdxComponents} />
    </Container>
  );
}
