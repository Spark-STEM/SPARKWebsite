interface Env {
    TURNSTILE_SITE_KEY?: string;
}

export const onRequestGet = ({
    env,
}: {
    env: Env;
}): Response => {
    return Response.json(
        { turnstileSiteKey: env.TURNSTILE_SITE_KEY ?? '' },
        { headers: { 'Cache-Control': 'no-store' } }
    );
};
