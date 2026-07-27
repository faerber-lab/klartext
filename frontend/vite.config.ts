import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const SSL_KEY_PATH = process.env.SSL_KEY_PATH ? path.resolve(process.env.SSL_KEY_PATH) : null;
const SSL_CERT_PATH = process.env.SSL_CERT_PATH ? path.resolve(process.env.SSL_CERT_PATH) : null;
const isHttpsEnabled = process.env.DEPLOY_MODE === 'server' && SSL_KEY_PATH && SSL_CERT_PATH;

// `command` is 'serve' for the dev server and 'build' for a production build.
// The server block below applies only to the dev server, and reading the
// certificates during a build would make builds fail anywhere the certs are
// absent. Production is served by nginx from dist/, so nothing here runs there.
export default defineConfig(({ command }) => ({
  define: {
    // Only expose what client code actually reads. Inlining all of process.env
    // risks baking whatever the build environment holds into a public bundle.
    'process.env.DEPLOY_MODE': JSON.stringify(process.env.DEPLOY_MODE),
  },
  plugins: [react()],
  server:
    command === 'serve'
      ? {
          proxy: {
            '/set-cookie': {
              target: 'http://localhost:7171', // Your backend server URL
              changeOrigin: true,
              secure: false,
            },
          },
          https: isHttpsEnabled
            ? {
                key: fs.readFileSync(SSL_KEY_PATH),
                cert: fs.readFileSync(SSL_CERT_PATH),
              }
            : undefined,
        }
      : undefined,
}));
