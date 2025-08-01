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
			strategy: ['cookie', 'url', 'baseLocale']
		}),
		Icons({
			compiler: 'svelte'
		})
	],
	optimizeDeps: {
		exclude: ['@node-rs/argon2']
	},
	build: {
		target: 'esnext',
		rollupOptions: {
			external: ['@node-rs/argon2-wasm32-wasi']
		}
	}
});
