import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';
import lemonI18n from './tools/eslint-plugin-lemon-i18n/index.ts';
import noEventTarget from './tools/eslint-plugin-no-event-target/index.ts';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default ts.config(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{ ignores: ['scripts/**'] },
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		rules: { 'no-undef': 'off' }
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		ignores: ['eslint.config.js', 'svelte.config.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		},
		plugins: {
			svelte,
			'lemon-i18n': lemonI18n
		},
		rules: {
			'lemon-i18n/no-untranslated-text': [
				'warn',
				{
					ignoreElements: [
						'script',
						'style',
						'link',
						// SVG Graphics
						'polyline',
						'circle',
						'ellipse',
						'line',
						'path',
						'polygon',
						'rect',
						'text',
						'tspan'
					],
					ignoreAttributes: [
						'class',
						'style',
						'id',
						'src',
						'href',
						'data-*',
						'rel',
						'target',
						'lang',
						'role',
						'type',
						'autocomplete',
						'aria-autocomplete',
						'aria-haspopup',
						'aria-describedby',
						'aria-activedescendant',
						'aria-expanded',
						'aria-controls',
						'aria-required',
						'aria-current',
						'aria-disabled',
						'aria-hidden',
						'aria-invalid',
						'aria-roledescription',
						'aria-live',
						'aria-modal',
						'aria-labelledby',
						'height',
						'width',
						'min',
						'max',
						'action',
						'name',
						'for',
						'viewbox',
						'accept',
						'tabindex',
						'fill',
						'stroke',
						'stroke-width',
						'stroke-linecap',
						'stroke-linejoin',
						'points',
						'frameborder',
						'scrolling',
						'colspan',
						'rowspan',
						'popover',
						'iconSize',
						'method',
						'rows'
					],
					ignorePatterns: [
						'^[#.,:;!?(){}\\[\\]<>\\-+*/=&%|^~]+$',
						'^(https?:)?//',
						'^#[0-9A-Fa-f]{3,8}$'
					],
					translateFunctions: ['t', 'm.*']
				}
			]
		}
	},
	{
		plugins: {
			'no-event-target': noEventTarget
		},
		rules: {
			'no-event-target/no-event-target': 'warn'
		}
	}
);
