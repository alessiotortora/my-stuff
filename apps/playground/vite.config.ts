import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { varlockCloudflareVitePlugin } from "@varlock/cloudflare-integration";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tailwindcss(),
    varlockCloudflareVitePlugin({
      inspectorPort: 9231,
      viteEnvironment: { name: "ssr" },
    }),
    tanstackStart(),
    react(),
    tsconfigPaths(),
  ],
});
