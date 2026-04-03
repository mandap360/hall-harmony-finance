var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// public/manifest.json
var require_manifest = __commonJS({
  "public/manifest.json"(exports, module) {
    module.exports = {
      name: "Mandap360 Hall Harmony Finance",
      short_name: "Mandap360",
      description: "Finance Management Simplified",
      start_url: ".",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#673ab7",
      orientation: "portrait",
      icons: [
        {
          src: "/icon-192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png"
        }
      ]
    };
  }
});

// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react-swc/index.mjs";
import { VitePWA } from "file:///home/project/node_modules/vite-plugin-pwa/dist/index.js";
import path from "path";
import { componentTagger } from "file:///home/project/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: require_manifest(),
      devOptions: {
        enabled: true
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicHVibGljL21hbmlmZXN0Lmpzb24iLCAidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIntcbiAgXCJuYW1lXCI6IFwiTWFuZGFwMzYwIEhhbGwgSGFybW9ueSBGaW5hbmNlXCIsXG4gIFwic2hvcnRfbmFtZVwiOiBcIk1hbmRhcDM2MFwiLFxuICBcImRlc2NyaXB0aW9uXCI6IFwiRmluYW5jZSBNYW5hZ2VtZW50IFNpbXBsaWZpZWRcIixcbiAgXCJzdGFydF91cmxcIjogXCIuXCIsXG4gIFwiZGlzcGxheVwiOiBcInN0YW5kYWxvbmVcIixcbiAgXCJiYWNrZ3JvdW5kX2NvbG9yXCI6IFwiI2ZmZmZmZlwiLFxuICBcInRoZW1lX2NvbG9yXCI6IFwiIzY3M2FiN1wiLFxuICBcIm9yaWVudGF0aW9uXCI6IFwicG9ydHJhaXRcIixcbiAgXCJpY29uc1wiOiBbXG4gICAge1xuICAgICAgXCJzcmNcIjogXCIvaWNvbi0xOTIucG5nXCIsXG4gICAgICBcInNpemVzXCI6IFwiMTkyeDE5MlwiLFxuICAgICAgXCJ0eXBlXCI6IFwiaW1hZ2UvcG5nXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwic3JjXCI6IFwiL2ljb24tNTEyLnBuZ1wiLFxuICAgICAgXCJzaXplc1wiOiBcIjUxMng1MTJcIixcbiAgICAgIFwidHlwZVwiOiBcImltYWdlL3BuZ1wiXG4gICAgfVxuICBdXG59IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tIFwidml0ZS1wbHVnaW4tcHdhXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmIGNvbXBvbmVudFRhZ2dlcigpLFxuICAgIFZpdGVQV0Eoe1xuICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXG4gICAgICBtYW5pZmVzdDogcmVxdWlyZSgnLi9wdWJsaWMvbWFuaWZlc3QuanNvbicpLFxuICAgICAgZGV2T3B0aW9uczoge1xuICAgICAgICBlbmFibGVkOiB0cnVlXG4gICAgICB9XG4gICAgfSksXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG59KSk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUNFLE1BQVE7QUFBQSxNQUNSLFlBQWM7QUFBQSxNQUNkLGFBQWU7QUFBQSxNQUNmLFdBQWE7QUFBQSxNQUNiLFNBQVc7QUFBQSxNQUNYLGtCQUFvQjtBQUFBLE1BQ3BCLGFBQWU7QUFBQSxNQUNmLGFBQWU7QUFBQSxNQUNmLE9BQVM7QUFBQSxRQUNQO0FBQUEsVUFDRSxLQUFPO0FBQUEsVUFDUCxPQUFTO0FBQUEsVUFDVCxNQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxVQUNFLEtBQU87QUFBQSxVQUNQLE9BQVM7QUFBQSxVQUNULE1BQVE7QUFBQSxRQUNWO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQTtBQUFBOzs7QUNyQnlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFDeEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBSmhDLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFNBQVMsaUJBQWlCLGdCQUFnQjtBQUFBLElBQzFDLFFBQVE7QUFBQSxNQUNOLGNBQWM7QUFBQSxNQUNkLFVBQVU7QUFBQSxNQUNWLFlBQVk7QUFBQSxRQUNWLFNBQVM7QUFBQSxNQUNYO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSCxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
