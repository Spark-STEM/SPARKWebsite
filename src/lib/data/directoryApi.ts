const cloudflareDirectoryApi = 'https://spark-stem.pages.dev/api/directory';

function getDirectoryApiBases(): string[] {
    if (typeof window === 'undefined') return ['/api/directory'];

    const { hostname, port } = window.location;
    const isLocal =
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '[::1]';

    if (!isLocal) return ['/api/directory'];
    if (port === '8788') return ['/api/directory'];

    return [
        'http://127.0.0.1:8788/api/directory',
        cloudflareDirectoryApi,
    ];
}

export async function fetchDirectoryApi(path = ''): Promise<Response> {
    const bases = getDirectoryApiBases();

    for (const [index, base] of bases.entries()) {
        try {
            return await fetch(`${base}${path}`);
        } catch (error) {
            if (index === bases.length - 1) throw error;
            console.info(
                'Local Pages API unavailable; using the deployed directory API.'
            );
        }
    }

    throw new Error('No directory API endpoint is available.');
}
