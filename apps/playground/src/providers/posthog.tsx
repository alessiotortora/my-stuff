import { PostHogProvider } from "@posthog/react";
import { ENV } from "varlock/env";

export function PostHogProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!ENV.PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }

  return (
    <PostHogProvider
      apiKey={ENV.PUBLIC_POSTHOG_KEY}
      options={{
        api_host: ENV.PUBLIC_POSTHOG_HOST,
        capture_pageleave: true,
        persistence: "memory",
      }}
    >
      {children}
    </PostHogProvider>
  );
}
