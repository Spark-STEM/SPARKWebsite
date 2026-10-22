import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = ({ params }) => {
    redirect(
        308,
        `/aboutUs/locations/${encodeURIComponent(params.type)}/${encodeURIComponent(params.slug)}`
    );
};
