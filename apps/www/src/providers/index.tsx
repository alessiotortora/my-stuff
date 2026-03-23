import { PostHogProviderWrapper } from "./posthog";

export function Providers({ children }: { children: React.ReactNode }) {
  return <PostHogProviderWrapper>{children}</PostHogProviderWrapper>;
}
