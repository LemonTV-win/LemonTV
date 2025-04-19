import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		fontFamily: {
			saira: ['Saira', 'sans-serif']
		}
	}
} satisfies Config;
