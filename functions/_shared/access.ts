const allowedOrigins = new Set([
    'https://spark-stem.pages.dev',
]);

function isAllowedOrigin(origin: string): boolean {
    if (allowedOrigins.has(origin)) return true;

    try {
        const url = new URL(origin);
        return (
            url.protocol === 'http:' &&
            ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
        );
    } catch {
        return false;
    }
}

function getAllowedOrigin(request: Request): string | null {
    const origin = request.headers.get('Origin');
    if (origin) return isAllowedOrigin(origin) ? origin : null;

    if (request.headers.get('Sec-Fetch-Site') === 'same-origin') {
        const requestOrigin = new URL(request.url).origin;
        return isAllowedOrigin(requestOrigin) ? requestOrigin : null;
    }

    return null;
}

export function checkDirectoryRequest(request: Request): Response | null {
    if (!getAllowedOrigin(request)) {
        return Response.json(
            { error: 'This origin is not allowed to access the directory.' },
            { status: 403 }
        );
    }

    const headers = directoryHeaders(request);

    if (request.method === 'OPTIONS') {
        headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        headers.set('Access-Control-Allow-Headers', 'Content-Type');
        return new Response(null, { status: 204, headers });
    }

    if (request.method !== 'GET') {
        headers.set('Allow', 'GET, OPTIONS');
        return Response.json(
            { error: 'Method not allowed.' },
            { status: 405, headers }
        );
    }

    return null;
}

export function directoryHeaders(request: Request): Headers {
    const headers = new Headers();
    const origin = getAllowedOrigin(request);

    if (origin) {
        headers.set('Access-Control-Allow-Origin', origin);
        headers.set('Vary', 'Origin');
    }

    return headers;
}
