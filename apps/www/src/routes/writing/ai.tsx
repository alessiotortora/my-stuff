import { createFileRoute } from "@tanstack/react-router";
import Container from "#/components/layout/container";
import AiContent from "#/content/writing/ai.mdx";
import { mdxComponents } from "#/mdx-components";

export const Route = createFileRoute("/writing/ai")({
  component: AiPage,
  head: () => ({
    meta: [
      { title: "The Rise of AI: A Developer's Perspective | Alessio Tortora" },
    ],
  }),
});

function AiPage() {
  return (
    <Container>
      <AiContent components={mdxComponents} />
    </Container>
  );
}
