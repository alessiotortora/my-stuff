import { createFileRoute, notFound } from "@tanstack/react-router";
import type { ComponentType } from "react";
import ThreeDStack from "#/animations/3d-stack";
import Carousel from "#/animations/carousel";
import Cursor from "#/animations/cursor";
import Exposure from "#/animations/exposure";
import FakeThreeDStack from "#/animations/fake-3d-stack";
import Folder from "#/animations/folder";
import Menu from "#/animations/menu";
import Morph from "#/animations/morph";
import Swipe from "#/animations/swipe";
import Unfold from "#/animations/unfold";

const ANIMATIONS: Record<string, ComponentType> = {
  "3d-stack": ThreeDStack,
  carousel: Carousel,
  cursor: Cursor,
  exposure: Exposure,
  "fake-3d-stack": FakeThreeDStack,
  folder: Folder,
  menu: Menu,
  morph: Morph,
  swipe: Swipe,
  unfold: Unfold,
};

const HINTS: Record<string, string> = {
  "3d-stack": "scroll inside the stack",
  carousel: "drag or scroll horizontally",
  cursor: "move the cursor inside the box",
  exposure: "drag the strip left or right",
  "fake-3d-stack": "scroll inside the panel",
  folder: "click the folder to open",
  menu: "hover the nav items",
  morph: "click a card to expand",
  swipe: "swipe the mail left or right",
  unfold: "hover the stack",
};

export const Route = createFileRoute("/animations/$slug")({
  component: AnimationRoute,
  loader: ({ params }) => {
    if (!(params.slug in ANIMATIONS)) {
      throw notFound();
    }
    return { slug: params.slug };
  },
});

function AnimationRoute() {
  const { slug } = Route.useParams();
  const Component = ANIMATIONS[slug];
  const hint = HINTS[slug];
  if (!Component) {
    return null;
  }
  return (
    <>
      <Component />
      {hint && (
        <p className="fixed bottom-6 left-1/2 -translate-x-1/2 font-mono text-sm opacity-50">
          {hint}
        </p>
      )}
    </>
  );
}
