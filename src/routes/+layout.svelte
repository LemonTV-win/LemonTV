<script lang="ts">
	import '../app.css';

	let { children } = $props();

	import { m } from '$lib/paraglide/messages.js';
	import { setLocale, type Locale, getLocale } from '$lib/paraglide/runtime';

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
		id: 'Bahasa Indonesia'
	};

	let locale = $state(getLocale());
</script>

<header
	class="flex items-center justify-between border-b-1 border-gray-500 bg-gray-800 px-3 py-4 text-white"
>
	<a href="/" class="text-2xl font-bold">🍋 LemonTV</a>
	<nav class="flex items-center gap-4">
		<a href="/news">{m.news()}</a>
		<a href="/events">{m.events()}</a>
		<a href="/teams">{m.teams()}</a>
		<a href="/players">{m.players()}</a>
		<select
			class="rounded-md bg-gray-800 px-4 py-1 text-white"
			onchange={({ currentTarget }) => {
				setLocale(currentTarget.value as Locale);
			}}
			bind:value={locale}
		>
			{#each Object.entries(locales) as [locale, label]}
				<option value={locale}>{label}</option>
			{/each}
		</select>
	</nav>
</header>

{@render children()}

<footer class="mt-4 border-t-1 border-gray-500 bg-gray-800 px-3 py-4 text-center text-white">
	<p>
		© 2025 LemonTV. Strinova is a trademark of iDreamSky. This site is not affiliated with or
		endorsed by Strinova or iDreamSky.
	</p>
</footer>
