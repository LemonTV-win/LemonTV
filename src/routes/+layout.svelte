<script lang="ts">
	import '../app.css';

	let { children } = $props();

	import { m } from '$lib/paraglide/messages.js';
	import { setLocale, type Locale, getLocale } from '$lib/paraglide/runtime';
	import MaterialSymbolsMenuRounded from '~icons/material-symbols/menu-rounded';
	import MaterialSymbolsCloseRounded from '~icons/material-symbols/close-rounded';

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
	let mobileMenuOpen = $state(false);

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}
</script>

<header
	class="flex items-center justify-between border-b-1 border-gray-500 bg-gray-800 px-3 py-4 text-white"
>
	<a href="/" class="flex items-center gap-2 text-2xl font-bold">
		<img src="/favicon.svg" alt="LemonTV" class="h-10 w-10" />
		LemonTV
	</a>

	<!-- Mobile menu button -->
	<button class="md:hidden" onclick={toggleMobileMenu}>
		{#if mobileMenuOpen}
			<MaterialSymbolsCloseRounded class="h-8 w-8" />
		{:else}
			<MaterialSymbolsMenuRounded class="h-8 w-8" />
		{/if}
	</button>

	<!-- Desktop navigation -->
	<nav class="hidden items-center gap-4 md:flex">
		<a href="/news">{m.news()}</a>
		<a href="/events">{m.events()}</a>
		<a href="/teams">{m.teams()}</a>
		<a href="/players">{m.players()}</a>
		<a href="/community">{m.community()}</a>
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

<!-- Mobile navigation menu -->
{#if mobileMenuOpen}
	<nav class="flex flex-col border-b-1 border-gray-500 bg-gray-800 px-3 py-4 text-white md:hidden">
		<a href="/news" class="py-2 text-lg" onclick={toggleMobileMenu}>{m.news()}</a>
		<a href="/events" class="py-2 text-lg" onclick={toggleMobileMenu}>{m.events()}</a>
		<a href="/teams" class="py-2 text-lg" onclick={toggleMobileMenu}>{m.teams()}</a>
		<a href="/players" class="py-2 text-lg" onclick={toggleMobileMenu}>{m.players()}</a>
		<a href="/community" class="py-2 text-lg" onclick={toggleMobileMenu}>{m.community()}</a>
		<div class="py-2">
			<select
				class="w-full rounded-md bg-gray-700 px-4 py-2 text-white"
				onchange={({ currentTarget }) => {
					setLocale(currentTarget.value as Locale);
				}}
				bind:value={locale}
			>
				{#each Object.entries(locales) as [locale, label]}
					<option value={locale}>{label}</option>
				{/each}
			</select>
		</div>
	</nav>
{/if}

{@render children()}

<footer class="mt-4 border-t-1 border-gray-500 bg-gray-800 px-3 py-4 text-center text-white">
	<p>
		© 2025 <a
			href="https://github.com/mkpoli/LemonTV"
			class="text-yellow-300 hover:text-yellow-400 hover:underline"
			target="_blank">LemonTV</a
		>. Strinova is a trademark of iDreamSky. This site is not affiliated with or endorsed by
		Strinova or iDreamSky.
	</p>
</footer>
