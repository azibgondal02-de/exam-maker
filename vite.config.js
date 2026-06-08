import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        app: 'app.html'
      }
    }
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
})
