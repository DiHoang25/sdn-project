import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: "https://robena-nonapparitional-knox.ngrok-free.dev",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/auth": {
        target: "https://robena-nonapparitional-knox.ngrok-free.dev",
        changeOrigin: true,
      },
      "/quizzes": {
        target: "https://robena-nonapparitional-knox.ngrok-free.dev",
        changeOrigin: true,
      },
      "/questions": {
        target: "https://robena-nonapparitional-knox.ngrok-free.dev",
        changeOrigin: true,
      },
    },
  },
});