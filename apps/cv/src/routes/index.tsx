import { createFileRoute } from "@tanstack/react-router";
import { Profile } from "#/components/cv/cv";
import Container from "#/components/layout/container";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <Container>
      <Profile />
    </Container>
  );
}
