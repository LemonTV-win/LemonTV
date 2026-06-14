import { ScalarApiReference } from '@scalar/sveltekit';

// `ScalarApiReference` is a SvelteKit request-handler factory, not a Svelte
// component — it returns a handler that renders the Scalar reference HTML.
export const GET = ScalarApiReference({
	url: '/api/openapi.json',
	theme: 'purple'
});
