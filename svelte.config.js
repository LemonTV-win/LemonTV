import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: { $assets: './src/assets' },
		// The built-in origin check rejects ALL cross-origin form-encoded POSTs,
		// which would break the OAuth token/register endpoints (public clients POST
		// `application/x-www-form-urlencoded` cross-origin). We disable it here and
		// re-implement the exact same check in hooks.server.ts (`handleCsrf`),
		// carving out only those two OAuth machine endpoints. See that hook.
		csrf: { checkOrigin: false }
	}
};

export default config;
