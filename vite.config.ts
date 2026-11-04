import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api/cardgame": {
        target: "https://soul-hunter-api.vercel.app",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cardgame/, "/api"),
      },
    },
  },
})
