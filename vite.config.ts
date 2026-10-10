import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    appType: 'spa',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          // Vendor code-splitting: keeps the entry chunk lean so the
          // homepage paints sooner. React/framework code changes rarely,
          // so these chunks also get long-lived cache hits.
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return undefined;
            if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react-vendor';
            if (id.includes('node_modules/framer-motion')) return 'motion-vendor';
            if (id.includes('node_modules/@radix-ui')) return 'radix-vendor';
            return undefined;
          },
        },
      },
    },
});
