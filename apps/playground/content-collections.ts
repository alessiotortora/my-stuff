import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";

const posts = defineCollection({
  directory: "content",
  include: "**/*.md",
  name: "posts",
  schema: z.object({
    date: z.string(),
    description: z.string().optional(),
    title: z.string(),
  }),
});

export default defineConfig({
  collections: [posts],
});
