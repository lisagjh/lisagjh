// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  output: "static",
  server: {
    port: 4321, // Set the port for the development server
  },
  integrations: [react()],
});