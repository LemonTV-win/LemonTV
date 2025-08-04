<script lang="ts">
	import MaterialSymbolsTranslateRounded from '~icons/material-symbols/translate-rounded';
	import { setLocale, type Locale, getLocale } from '$lib/paraglide/runtime';
	import IconSelect from '$lib/components/ui/IconSelect.svelte';
	import IconOption from '$lib/components/ui/IconOption.svelte';

	let locale = $state(getLocale());

	const locales: Record<Locale, string> = {
		en: 'English',
		ja: '日本語',
		zh: '简体中文',
		'zh-tw': '繁體中文',
		es: 'Español',
		ko: '한국어',
		'pt-br': 'Português',
		de: 'Deutsch',
		fr: 'Français',
		ru: 'Русский',
		vi: 'Tiếng Việt',
		id: 'Bahasa Indonesia',
		'uk-ua': 'Українська'
	};

	let { class: className = '', compact = false }: { class?: string; compact?: boolean } = $props();
</script>

<IconSelect
	value={locale}
	onselect={(locale) => setLocale(locale as Locale)}
	showDefaultSelectIcon={false}
	class={className}
	optionClass={compact ? 'h-8' : ''}
>
	{#snippet selectIcon()}
		<MaterialSymbolsTranslateRounded class="h-5 w-5" />
	{/snippet}
	{#each Object.entries(locales) as [locale, label]}
		<IconOption value={locale} {label}></IconOption>
	{/each}
</IconSelect>
