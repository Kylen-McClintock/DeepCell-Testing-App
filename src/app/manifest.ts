import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'DeepCell Tracker',
        short_name: 'DeepCell',
        description: 'Track your sleep and health metrics with DeepCell.',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
            {
                src: '/icon.png',
                sizes: 'any',
                type: 'image/png',
                purpose: 'maskable any' as any,
            },
        ],
    };
}
