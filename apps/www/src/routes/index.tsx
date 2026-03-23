import { createFileRoute } from "@tanstack/react-router";
import Container from "#/components/layout/container";
import { LinkSection } from "#/components/layout/link-section";
import { ProjectSection } from "#/components/layout/project-section";
import { WritingSection } from "#/components/layout/writing-section";
import { SpotifyShowcase } from "#/components/spotify/spotify-showcase";
import { getNowPlaying } from "#/server/spotify";

export const Route = createFileRoute("/")({
  loader: async () => {
    const spotify = await getNowPlaying();
    return { spotify };
  },
  component: Home,
});

function Home() {
  const { spotify } = Route.useLoaderData();

  return (
    <Container>
      <div className="space-y-4">
        <p>
          I'm a full-stack developer and designer at heart. I care deeply about
          aesthetics, UX and crafting thoughtful products. Formerly a physical
          therapist, I now build digital experiences that feel intuitive and
          delightful.
        </p>
        <p>
          Outside coding, I'm usually with Milo, my dog and director of break
          reminders.
        </p>
      </div>
      <SpotifyShowcase song={spotify} />
      <ProjectSection />
      <WritingSection />
      <LinkSection />
    </Container>
  );
}
