import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/pokedex/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Pokédex',
        short_name: 'Pokédex',
        description:
          'Pokédex completa com todos os Pokémon, formas regionais, megaevoluções, Gigantamax e shinies.',
        lang: 'pt-BR',
        theme_color: '#e3350d',
        background_color: '#f1f3f7',
        display: 'standalone',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // os 16MB de public/data ficam fora do precache; entram via runtime cache
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        globIgnores: ['data/**'],
        runtimeCaching: [
          {
            urlPattern: /\/data\/.+\.json$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'pokedex-data',
              expiration: { maxEntries: 2000 },
            },
          },
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/PokeAPI\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pokedex-media',
              expiration: { maxEntries: 1000, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
