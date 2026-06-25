import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // In dev, proxy /api/* to the Netlify function server.
    // Run functions separately with: ./node_modules/.bin/netlify functions:serve --port 9999
    proxy: {
      '/api': {
        target: 'http://localhost:9999',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/(.*)/, '/.netlify/functions/$1'),
      },
    },
  },
})
