const cloudflareDirectoryApi = 'https://spark-stem.pages.dev/api/directory';

export function getDirectoryApiBase(): string {
    if (typeof window === 'undefined') return '/api/directory';

    const { hostname, port } = window.location;
    const isLocal =
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '[::1]';

    if (!isLocal || port === '8788') return '/api/directory';
    return cloudflareDirectoryApi;
}
