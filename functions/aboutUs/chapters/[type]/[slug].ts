interface Context {
    request: Request;
    next(request?: Request): Promise<Response>;
}

export const onRequest = async ({ request, next }: Context): Promise<Response> => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response('Method not allowed.', {
            status: 405,
            headers: { Allow: 'GET, HEAD' },
        });
    }

    const fallbackUrl = new URL('/404.html', request.url);
    return next(new Request(fallbackUrl, request));
};
