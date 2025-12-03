import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'DeepCell Tracker',
        short_name: 'DeepCell',
        description: 'Track your sleep and health metrics with DeepCell.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0b0e1a',
        theme_color: '#0b0e1a',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    };
}
