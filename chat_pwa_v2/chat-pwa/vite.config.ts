import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      registerType: "autoUpdate",
      injectRegister: "auto",

      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest: {
        name: "Chat-PWA Version 2",
        short_name: "Chat-PWA",
        description: "This is Chat PWA version 2.",
        start_url: "/index.html",
        display: "standalone",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        screenshots: [
          {
            src: "/images/screenshot-narrow.png",
            sizes: "320x640",
            type: "image/png",
            form_factor: "narrow",
            label: "Mobile Shell",
          },
          {
            src: "/images/screenshot-wide.png",
            sizes: "605x317",
            type: "image/png",
            form_factor: "wide",
            label: "Desktop Shell",
          },
        ],
      },

      injectManifest: {
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,ico,tff}"],
      },

      devOptions: {
        enabled: false,
        navigateFallback: "index.html",
        suppressWarnings: true,
        type: "module",
      },
    }),
  ],
});
