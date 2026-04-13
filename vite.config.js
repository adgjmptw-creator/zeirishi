import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages base path. Repository name is "zeirishi".
export default defineConfig({
  base: '/zeirishi/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: '税理士試験 学習アプリ',
        short_name: '税理士',
        description: '通勤電車の片手操作で暗記カードを回す税理士試験学習PWA',
        theme_color: '#0ea5e9',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/zeirishi/',
        scope: '/zeirishi/',
        icons: [
          {
            src: 'icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          {
            src: 'icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,json}'],
      },
    }),
  ],
})
