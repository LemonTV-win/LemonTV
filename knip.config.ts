import type { KnipConfig } from 'knip';

const config: KnipConfig = {
	paths: {
		'~icons/*': ['node_modules/unplugin-icons/types/svelte.d.ts']
	},
	ignore: ['drizzle-dev.config.ts', 'src/hooks.ts'],
	ignoreDependencies: [
		'@fontsource/*',
		'@fontsource-variable/*',
		'@infolektuell/noto-color-emoji',
		'@iconify/json',
		'@tailwindcss/forms'
	],
	ignoreBinaries: ['turso'],
	ignoreUnresolved: ['$env/dynamic/private', '$env/static/private']
};

export default config;
