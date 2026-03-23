import { createFileRoute } from "@tanstack/react-router";
import Container from "#/components/layout/container";
import ProjectsContent from "#/content/building/projects.mdx";
import { mdxComponents } from "#/mdx-components";

export const Route = createFileRoute("/building/projects")({
  component: ProjectsPage,
  head: () => ({
    meta: [{ title: "Projects | Alessio Tortora" }],
  }),
});

function ProjectsPage() {
  return (
    <Container>
      <ProjectsContent components={mdxComponents} />
    </Container>
  );
}
