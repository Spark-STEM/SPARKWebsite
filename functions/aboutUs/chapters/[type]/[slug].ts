interface Context {
    request: Request;
}

export const onRequest = async ({ request }: Context): Promise<Response> => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response('Method not allowed.', {
            status: 405,
            headers: { Allow: 'GET, HEAD' },
        });
    }

    const destination = new URL(request.url);
    destination.pathname = destination.pathname.replace(
        '/aboutUs/chapters/',
        '/aboutUs/locations/'
    );
    return Response.redirect(destination, 308);
};
