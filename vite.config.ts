import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      VitePWA({
        strategies: "injectManifest",
        srcDir: "src",
        filename: "sw.ts",
        registerType: "autoUpdate",
        devOptions: {
          enabled: true,
        },
        injectManifest: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,json,wasm}"],
          maximumFileSizeToCacheInBytes: 10485760, // 10MB
        },
        manifest: {
          name: "IVVAB LABS",
          short_name: "IVVAB",
          description: "Offline-First Cybersecurity Practical Environment",
          theme_color: "#e8eef6",
          background_color: "#e8eef6",
          display: "standalone",
          icons: [
            {
              src: "/favicon.ico",
              sizes: "64x64 32x32 24x24 16x16",
              type: "image/x-icon",
            },
          ],
        },
      }),
    ],
  },
});
