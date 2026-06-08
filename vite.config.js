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
          // Landing page at root
          if (url === '/' || url === '/index.html') {
            req.url = '/index.html';
            return next();
          }
          // Static assets — pass through
          if (
            url.startsWith('/src/') ||
            url.startsWith('/assets/') ||
            url.startsWith('/@') ||
            url.startsWith('/node_modules/') ||
            url.includes('.')
          ) {
            return next();
          }
          // Everything else (/login, /test-maker, etc.) → app.html
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
      }
    }
  },
  appType: 'mpa',
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    fs: { strict: false },
  },
})