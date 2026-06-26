import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'spa-fallback',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url;
          if (url === '/' || url === '/index.html') {
            req.url = '/index.html';
            return next();
          }
          if (
            url.startsWith('/src/') ||
            url.startsWith('/assets/') ||
            url.startsWith('/@') ||
            url.startsWith('/node_modules/') ||
            url.includes('.')
          ) {
            return next();
          }
          req.url = '/app.html';
          return next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        app: 'app.html'
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'oxc',   // ← changed from 'esbuild' to 'oxc' (built into Vite 8)
    target: 'es2015',
    cssCodeSplit: true,
  },
  appType: 'mpa',
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    fs: { strict: false },
  },
})