import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  define: {
    global: "globalThis",
  },
  
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    force: true,
    include: ["react-head", "sockjs-client", "@stomp/stompjs"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

