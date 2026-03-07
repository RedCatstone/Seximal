import { redirect } from '@sveltejs/kit';

export function load() {
    // just immidiately yeet the user to /counting
    redirect(308, `/counting`);
}