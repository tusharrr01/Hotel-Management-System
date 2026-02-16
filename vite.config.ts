import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  // Dev proxy: forward `/api` calls to backend when running `vite` locally.
  // Set BACKEND_URL in your environment to override (e.g. http://localhost:5000)
  server: {
    proxy: {
      "/api": {
        target: process.env.BACKEND_URL || "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
