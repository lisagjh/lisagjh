// @ts-check
import { defineConfig } from "astro/config";
import path from "path";

import react from "@astrojs/react";

export default defineConfig({
  output: "static",

  server: {
    port: 4321, // Set the port for the development server
  },

  alias: {
    "@scripts": path.resolve("./src/scripts"),
    "@components": path.resolve("./src/components"),
  },

  integrations: [react()],
});