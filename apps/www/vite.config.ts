import { cloudflare } from "@cloudflare/vite-plugin";
import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { varlockVitePlugin } from "@varlock/vite-integration";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    varlockVitePlugin({ ssrInjectMode: "resolved-env" }),
    tailwindcss(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart(),
    mdx(),
    react(),
    tsconfigPaths(),
  ],
});
