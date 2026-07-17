import devtoolsJson from 'vite-plugin-devtools-json';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['cookie', 'url', 'baseLocale'],
			cookieName: 'paraglide-locale'
		}),
		Icons({ compiler: 'svelte' }),
		devtoolsJson()
	],
	build: {
		target: 'esnext',
		// Left as a bare import for wrangler, which bundles .wasm as a module —
		// the form workerd accepts (runtime compilation from bytes is rejected).
		rollupOptions: { external: ['@phi-ag/argon2/argon2.wasm'] }
	},
	server: {
		port: 23355,
		host: true
	}
});
