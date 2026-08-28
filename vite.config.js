import { defineConfig } from "vite";

const webMCPHeaders = {
  "Origin-Agent-Cluster": "?1",
  "Permissions-Policy": "tools=(self)",
};

export default defineConfig({
  base: "./",
  server: { headers: webMCPHeaders },
  preview: { headers: webMCPHeaders },
});
