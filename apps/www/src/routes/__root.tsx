import { ConsoleArt } from "@repo/ui/components/console-art";
import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { Providers } from "#/providers";
import appCss from "#/styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Alessio's Portfolio" },
      {
        name: "description",
        content: "Brief introduction to my work and skills",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Newsreader:ital,wght@0,200..800;1,200..800&display=swap",
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <Providers>
          <ConsoleArt message="Welcome to my portfolio!\n\nYou opened the console, so you must be interested! Feel free to send me a message: hello@alessiotortora.com" />
          <Outlet />
        </Providers>
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-4 font-bold text-6xl text-gray-900 dark:text-white">
          404
        </h1>
        <h2 className="mb-4 font-semibold text-2xl text-gray-700 dark:text-gray-300">
          Page Not Found
        </h2>
        <p className="mb-8 max-w-md text-gray-600 dark:text-gray-400">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          className="inline-flex items-center rounded-md border border-transparent bg-gray-900 px-6 py-3 font-medium text-base text-white transition-colors duration-200 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          to="/"
        >
          Back to Portfolio
        </Link>
      </div>
    </div>
  );
}
