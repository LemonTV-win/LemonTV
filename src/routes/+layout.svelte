<script lang="ts">
	import '../app.css';

	import { m } from '$lib/paraglide/messages.js';
	import { setLocale, type Locale, getLocale } from '$lib/paraglide/runtime';
	import MaterialSymbolsMenuRounded from '~icons/material-symbols/menu-rounded';
	import MaterialSymbolsCloseRounded from '~icons/material-symbols/close-rounded';
	import MaterialSymbolsLogoutRounded from '~icons/material-symbols/logout-rounded';
	import MaterialSymbolsSettingsRounded from '~icons/material-symbols/settings-rounded';
	import MaterialSymbolsTranslateRounded from '~icons/material-symbols/translate-rounded';
	import MaterialSymbolsAdminPanelSettingsRounded from '~icons/material-symbols/admin-panel-settings-rounded';
	import IconDiscord from '~icons/simple-icons/discord';
	import IconGithub from '~icons/simple-icons/github';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import Switch from '$lib/components/ui/Switch.svelte';
	import { settings } from '$lib/settings.svelte';
	import type { LayoutProps } from './$types';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { SITE_CANONICAL_HOST } from '$lib/consts';

	let { data, children }: LayoutProps = $props();

	const navigation = [
		{ href: '/news', label: () => m.news() },
		{ href: '/events', label: () => m.events() },
		{ href: '/teams', label: () => m.teams() },
		{ href: '/players', label: () => m.players() },
		{ href: '/community', label: () => m.community() }
	] as const;

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

	let locale = $state(getLocale());
	let mobileMenuOpen = $state(false);
	let userMenuOpen = $state(false);

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function toggleUserMenu() {
		userMenuOpen = !userMenuOpen;
	}

	// Close user menu when clicking outside
	function clickOutside(node: HTMLElement) {
		const handleClick = (event: MouseEvent) => {
			if (!node.contains(event.target as Node)) {
				userMenuOpen = false;
			}
		};

		document.addEventListener('click', handleClick, true);

		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}

	function isActive(href: string) {
		return page.url.pathname === href;
	}

	let pageTitle = $derived(page.data.metadata?.title || `LemonTV – ${m.title_description()}`);
	let pageDescription = $derived(page.data.metadata?.description || m.about_tagline());
</script>

<svelte:head>
	<!-- Basic HTML Metadata -->
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta name="keywords" content="LemonTV, Strinova, Esports, News, Community, Tournaments" />
	<link rel="canonical" href={`${SITE_CANONICAL_HOST}${page.url.pathname}`} />

	<!-- Open Graph -->
	<meta property="og:site_name" content="LemonTV" />
	<meta property="og:url" content={`${SITE_CANONICAL_HOST}${page.url.pathname}`} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:type" content="website" />
	<!-- TODO: Generate og:image for sub pages such as Team / Player -->
	<meta property="og:image" content="https://lemontv.win/screenshot.png" />

	<!-- Twitter Card -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:title" content={pageTitle} />
	<meta property="twitter:description" content={pageDescription} />
	<meta property="twitter:creator" content="@mkpoli" />
	<meta property="twitter:image" content="https://lemontv.win/screenshot.png" />
	<meta property="twitter:url" content={`${SITE_CANONICAL_HOST}${page.url.pathname}`} />

	<!-- Schema.org Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'LemonTV',
		url: SITE_CANONICAL_HOST,
		description: m.about_tagline()
	})}</script>`}
</svelte:head>

<div class="flex min-h-dvh flex-col">
	<header
		class="flex items-center justify-between border-b-1 border-white/30 bg-gradient-to-br from-slate-600/60 to-slate-800 px-4 py-4 text-white backdrop-blur-lg"
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
		<nav class="hidden items-center gap-1 md:flex">
			{#each navigation as { href, label }}
				<a
					{href}
					class={[
						'rounded-md px-4 py-2 transition-all duration-200',
						isActive(href)
							? 'bg-gray-700/40 font-semibold shadow-[inset_0_0_0_2px_rgba(255,255,255,0.1)]'
							: 'hover:bg-gray-700/60 hover:text-yellow-300',
						'focus:bg-gray-700 focus:text-yellow-300 focus:ring-2 focus:ring-yellow-300 focus:outline-none'
					]}>{label()}</a
				>
			{/each}
		</nav>

		{#if data.user}
			<div class="user-menu relative hidden md:block">
				<button
					onclick={toggleUserMenu}
					class="flex items-center gap-2 rounded-full bg-gray-700 p-1 hover:bg-gray-600"
				>
					<UserAvatar email={data.user.email} class="h-8 w-8" />
				</button>
				{#if userMenuOpen}
					<div
						class="ring-opacity-5 absolute right-0 z-50 mt-2 w-48 rounded-md bg-gray-800 py-1 shadow-lg ring-1 ring-black"
						use:clickOutside
					>
						<div class="border-b border-gray-700 px-4 py-2">
							<p class="text-sm font-medium text-white">{data.user.username}</p>
						</div>
						<a
							href="/profile"
							class="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
						>
							<MaterialSymbolsSettingsRounded class="h-5 w-5" />
							{m.profile_settings()}
						</a>
						{#if ['admin', 'editor'].some((role) => data.user?.roles.includes(role))}
							<a
								href="/admin"
								class="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
							>
								<MaterialSymbolsAdminPanelSettingsRounded class="h-5 w-5" />
								{m.admin_panel()}
							</a>
						{/if}
						<div class="px-4 py-2">
							<div class="flex items-center gap-2">
								<MaterialSymbolsTranslateRounded class="h-6 w-6 text-gray-300" />
								<select
									class="w-full rounded-md bg-gray-700 px-4 py-0 text-white"
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
							<div class="mt-2 flex items-center gap-2">
								<Switch label={m.spoiler_mode()} bind:checked={settings.spoilerMode} />
							</div>
						</div>
						<hr class="border-gray-700" />
						<form method="post" action="/?/logout" use:enhance>
							<button
								type="submit"
								class="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
							>
								<MaterialSymbolsLogoutRounded class="h-5 w-5" />
								{m.sign_out()}
							</button>
						</form>
					</div>
				{/if}
			</div>
		{:else}
			<div class="hidden items-center gap-2 md:flex">
				<div class="flex items-center gap-2">
					<MaterialSymbolsTranslateRounded class="h-6 w-6 text-gray-300" />
					<select
						class="rounded-md bg-gray-700 px-3 py-1 text-white"
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
				<a
					href="/login?redirect={encodeURIComponent(page.url.pathname + page.url.search)}"
					class="rounded-md border-1 border-gray-500 bg-gray-800 px-4 py-1 text-white transition-colors duration-300 hover:bg-gray-700"
					>{m.sign_in()}</a
				>
			</div>
		{/if}
	</header>

	<!-- Mobile navigation menu -->
	{#if mobileMenuOpen}
		<nav
			class="flex flex-col border-b-1 border-white/30 bg-gradient-to-br from-slate-600/60 to-slate-800 px-3 py-4 text-white backdrop-blur-lg md:hidden"
		>
			{#each navigation as { href, label }}
				<a
					{href}
					class={[
						'rounded-md px-3 py-2 text-lg transition-all duration-200',
						isActive(href)
							? 'bg-gray-700/40 text-yellow-300 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.1)]'
							: 'hover:bg-gray-700/60 hover:text-yellow-300',
						'focus:bg-gray-700 focus:text-yellow-300 focus:ring-2 focus:ring-yellow-300 focus:outline-none'
					]}
					onclick={toggleMobileMenu}>{label()}</a
				>
			{/each}
			{#if data.user}
				<div class="mt-4 border-t border-gray-700 pt-4">
					<div class="mb-4 flex items-center gap-2">
						<UserAvatar email={data.user.email} class="h-8 w-8" />
						<span class="text-lg font-medium">{data.user.username}</span>
					</div>
					<div class="pl-4">
						<a
							href="/profile"
							class="flex items-center gap-2 rounded-md px-3 py-2 text-lg text-gray-300 transition-all duration-200 hover:bg-gray-700"
							onclick={toggleMobileMenu}
						>
							<MaterialSymbolsSettingsRounded class="h-6 w-6" />
							{m.profile_settings()}
						</a>
						{#if ['admin', 'editor'].some((role) => data.user?.roles.includes(role))}
							<a
								href="/admin"
								class="flex items-center gap-2 rounded-md px-3 py-2 text-lg text-gray-300 transition-all duration-200 hover:bg-gray-700"
								onclick={toggleMobileMenu}
							>
								<MaterialSymbolsAdminPanelSettingsRounded class="h-6 w-6" />
								{m.admin_panel()}
							</a>
						{/if}
						<div class="py-2">
							<div
								class="flex items-center gap-2 rounded-md px-3 py-2 transition-all duration-200 hover:bg-gray-700"
							>
								<MaterialSymbolsTranslateRounded class="h-6 w-6 text-gray-300" />
								<select
									class="w-full rounded-md bg-gray-700 px-4 py-2 text-white transition-all duration-200 hover:bg-gray-600"
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
							<div class="mt-2 flex items-center gap-2">
								<Switch label={m.spoiler_mode()} bind:checked={settings.spoilerMode} />
							</div>
						</div>
						<hr class="border-gray-700" />
						<form method="post" action="/?/logout" use:enhance>
							<button
								type="submit"
								class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-lg text-gray-300 transition-all duration-200 hover:bg-gray-700"
								onclick={toggleMobileMenu}
							>
								<MaterialSymbolsLogoutRounded class="h-6 w-6" />
								{m.sign_out()}
							</button>
						</form>
					</div>
				</div>
			{:else}
				<div class="mt-4 border-t border-gray-700 pt-4">
					<div class="mb-4">
						<div class="flex items-center gap-2">
							<MaterialSymbolsTranslateRounded class="h-6 w-6 text-gray-300" />
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
						<div class="mt-2 flex items-center gap-2">
							<Switch label={m.spoiler_mode()} bind:checked={settings.spoilerMode} />
						</div>
					</div>
					<a
						href="/login?redirect={encodeURIComponent(page.url.pathname + page.url.search)}"
						class="flex w-full items-center justify-center rounded-md border-1 border-gray-500 bg-gray-700 px-4 py-2 text-lg text-white transition-colors duration-300 hover:bg-gray-600"
						onclick={toggleMobileMenu}>{m.sign_in()}</a
					>
				</div>
			{/if}
		</nav>
	{/if}

	<main class="mb-4 flex-1">
		{@render children()}
	</main>

	<footer
		class="mt-4 border-t-1 border-white/30 bg-gradient-to-br from-slate-600/60 to-slate-800 px-3 py-8 text-center text-white backdrop-blur-lg"
	>
		<div class="mx-auto max-w-2xl">
			<p class="mb-4 text-lg">
				© 2025 <a href="/about" class="text-yellow-300 hover:text-yellow-400 hover:underline"
					>LemonTV</a
				>
			</p>
			<p class="mb-4 text-sm text-gray-300">
				{@html m.footer_fan_made({
					linkStart: `<a href="/about#team" class="underline hover:text-gray-300" target="_blank">`,
					linkEnd: `</a>`
				})}
			</p>
			<div class="mb-4 flex justify-center gap-4">
				<a
					href="https://discord.gg/mY8DMatXM4"
					target="_blank"
					rel="noopener noreferrer"
					class="text-yellow-300 hover:text-yellow-400"
				>
					<IconDiscord class="h-6 w-6" />
				</a>
				<a
					href="https://github.com/mkpoli/LemonTV"
					target="_blank"
					rel="noopener noreferrer"
					class="text-yellow-300 hover:text-yellow-400"
				>
					<IconGithub class="h-6 w-6" />
				</a>
			</div>
			<div class="mb-4 flex justify-center gap-4">
				<a
					href="https://lemonade.mkpo.li/"
					target="_blank"
					rel="noopener noreferrer"
					class="text-yellow-300 hover:text-yellow-400"
				>
					Lemonade
				</a>
				<a
					href="https://slice.lemontv.win/"
					target="_blank"
					rel="noopener noreferrer"
					class="text-yellow-300 hover:text-yellow-400"
				>
					LemonSlice
				</a>
			</div>
			<p class="text-xs text-gray-400">
				{@html m.footer_trademark({
					strinova: `<a href="https://www.strinova.com/" class="underline hover:text-gray-300" target="_blank">Strinova</a>`,
					idreamsky: `<a href="https://en.idreamsky.com/" class="underline hover:text-gray-300" target="_blank">iDreamSky</a>`
				})}
			</p>
		</div>
	</footer>
</div>

<style>
	:global(body) {
		background-image: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 1)), url('/blurred.jpg');
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		background-attachment: fixed;
		min-height: 100dvh;
	}
</style>
