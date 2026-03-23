import { createFileRoute } from "@tanstack/react-router";
import Container from "#/components/layout/container";
import AnimationsContent from "#/content/building/animations.mdx";
import { mdxComponents } from "#/mdx-components";

export const Route = createFileRoute("/building/animations")({
  component: AnimationsPage,
  head: () => ({
    meta: [{ title: "Animations | Alessio Tortora" }],
  }),
});

function AnimationsPage() {
  return (
    <Container>
      <AnimationsContent components={mdxComponents} />
    </Container>
  );
}
