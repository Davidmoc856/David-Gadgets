import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'David Gadgets',
    short_name: 'David Gadgets',
    description: 'Trusted tech marketplace with secure escrow, verified device deals, and wallet-powered checkout.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
