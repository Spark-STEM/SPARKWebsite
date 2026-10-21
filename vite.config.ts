import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

/** Serve static/Xcratch/index.html at /Xcratch in local dev and preview. */
function xcratchIndexRewrite(): Plugin {
    const rewrite = (
        req: IncomingMessage,
        _res: ServerResponse,
        next: (err?: unknown) => void
    ) => {
        const raw = req.url;
        if (!raw) return next();

        const q = raw.indexOf('?');
        const path = q === -1 ? raw : raw.slice(0, q);
        const search = q === -1 ? '' : raw.slice(q);

        if (path === '/Xcratch' || path === '/Xcratch/') {
            req.url = `/Xcratch/index.html${search}`;
        } else if (path === '/pages/Xcratch' || path === '/pages/Xcratch/') {
            req.url = `/Xcratch/index.html${search}`;
        }

        next();
    };

    return {
        name: 'xcratch-index-rewrite',
        configureServer(server) {
            server.middlewares.use(rewrite);
        },
        configurePreviewServer(server) {
            server.middlewares.use(rewrite);
        },
    };
}

export default defineConfig({
    plugins: [xcratchIndexRewrite(), sveltekit()],
});
