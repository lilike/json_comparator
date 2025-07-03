import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Best JSON Compare - Professional JSON Tools',
    short_name: 'JSONTools',
    description: 'Professional JSON comparison, formatting, validation, and repair tools with intelligent diff highlighting and multi-language support.',
    start_url: '/',
    display: 'standalone',
    background_color: '#111827',
    theme_color: '#3B82F6',
    orientation: 'portrait',
    scope: '/',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
    categories: ['productivity', 'developer', 'utilities'],
    lang: 'en',
    dir: 'ltr'
  }
}