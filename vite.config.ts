import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

function saveEnvPlugin(): Plugin {
  return {
    name: 'save-env-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/save-env' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: Buffer) => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              const envPath = path.resolve(__dirname, '.env');
              let existingEnv = '';
              if (fs.existsSync(envPath)) {
                existingEnv = fs.readFileSync(envPath, 'utf-8');
              }

              const lines = existingEnv.split('\n');
              const envMap = new Map<string, string>();

              lines.forEach(line => {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#')) {
                  const eqIndex = trimmed.indexOf('=');
                  if (eqIndex > -1) {
                    const key = trimmed.slice(0, eqIndex).trim();
                    const val = trimmed.slice(eqIndex + 1).trim();
                    envMap.set(key, val);
                  }
                }
              });

              Object.entries(data).forEach(([key, val]) => {
                if (key && typeof val === 'string') {
                  envMap.set(key, val);
                }
              });

              let newContent = '';
              envMap.forEach((val, key) => {
                newContent += `${key}=${val}\n`;
              });

              fs.writeFileSync(envPath, newContent, 'utf-8');

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: '.env file updated successfully' }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(), 
      saveEnvPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'بی‌صف (BiSaf)',
          short_name: 'BiSaf',
          theme_color: '#059669',
          background_color: '#ffffff',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
