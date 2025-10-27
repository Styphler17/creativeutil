import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import legacy from "@vitejs/plugin-legacy";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDevelopment = mode === "development";
  const isSeoBuild = mode === "seo";
  const legacyTargets = [
    "chrome >= 79",
    "edge >= 79",
    "firefox >= 78",
    "safari >= 14",
  ];

  return {
  server: {
    host: "::",
    port: 8081,
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 8081,
    },
  },
    plugins: [
      react(),
      !isDevelopment &&
        legacy({
          targets: legacyTargets,
          modernPolyfills: true,
          renderLegacyChunks: false,
          polyfills: [],
        }),
      isDevelopment && componentTagger(),
    ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
    build: {
      sourcemap: true,
      minify: isSeoBuild ? false : "esbuild",
    },
  };
});
