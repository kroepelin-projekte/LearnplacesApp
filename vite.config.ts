import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: process.env.NODE_ENV === 'production' ? { drop: ['console', 'debugger'] } : {},
  base: './',
  plugins: [react(), VitePWA({
    strategies: 'injectManifest',
    srcDir: 'src',
    filename: 'sw.ts',
    registerType: 'autoUpdate',
    injectRegister: 'auto',

    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: 'Lernorte App',
      short_name: 'Lernorte',
      description: 'Lernorte App',
      theme_color: '#ffffff',
      start_url: '/',
      display: 'standalone',
      icons: [
        {
          src: 'icons/Icon-48.png',
          sizes: '48x48',
          type: 'image/png',
        },
        {
          src: 'icons/Icon-72.png',
          sizes: '72x72',
          type: 'image/png',
        },
        {
          src: 'icons/Icon-96.png',
          sizes: '96x96',
          type: 'image/png',
        },
        {
          src: 'icons/Icon-144.png',
          sizes: '144x144',
          type: 'image/png',
        },
        {
          src: 'icons/Icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
      ],
 /*     icons: [
        {
          src: 'pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png',
        },
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],*/
    },

    injectManifest: {
      globPatterns: ['**/*.{js,css,html,svg,png,jpg,ico}'],
    },

    includeAssets: [
      'favicon.svg',
      'icons/Icon-48.png',
      'icons/Icon-72.png',
      'icons/Icon-96.png',
      'icons/Icon-144.png',
      'icons/Icon-192.png',
    ],

    devOptions: {
      enabled: false,
      navigateFallback: 'index.html',
      suppressWarnings: true,
      type: 'module',
    },
  })],
})