<script lang="ts">
	import '../app.css';

	import { m } from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime';
	import MaterialSymbolsMenuRounded from '~icons/material-symbols/menu-rounded';
	import MaterialSymbolsCloseRounded from '~icons/material-symbols/close-rounded';
	import MaterialSymbolsLogoutRounded from '~icons/material-symbols/logout-rounded';
	import MaterialSymbolsSettingsRounded from '~icons/material-symbols/settings-rounded';
	import MaterialSymbolsAdminPanelSettingsRounded from '~icons/material-symbols/admin-panel-settings-rounded';
	import IconDiscord from '~icons/simple-icons/discord';
	import IconGithub from '~icons/simple-icons/github';
	import IconQq from '~icons/simple-icons/qq';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import Switch from '$lib/components/ui/Switch.svelte';
	import { settings, bannerStore } from '$lib/settings.svelte';
	import SimpleIconsKofi from '~icons/simple-icons/kofi';
	import type { LayoutProps } from './$types';
	import { page } from '$app/state';
	import {
		IDREAMSKY_URL_EN,
		IDREAMSKY_URL_ZH,
		SITE_CANONICAL_HOST,
		STRINOVA_ESPORTS_HUB_DISCORD_URL,
		LEMON_TV_QQ_URL,
		GITHUB_REPO_URL,
		LEMON_TV_ORG_URL
	} from '$lib/consts';
	import GameSelect from './GameSelect.svelte';
	import LanguageSelect from './LanguageSelect.svelte';
	import { browser } from '$app/environment';

	let { data, children }: LayoutProps = $props();

	const navigation = [
		{ href: '/news', label: m.news },
		{ href: '/events', label: m.events },
		{ href: '/teams', label: m.teams },
		{ href: '/players', label: m.players },
		{ href: '/community', label: m.community }
	] as const;

	let mobileMenuOpen = $state(false);
	let userMenuOpen = $state(false);

	// One-time dismissible Ko-fi banner (uses centralized settings storage)
	const DONATION_BANNER_ID = 'donation';
	const DONATION_BANNER_VERSION = 1;
	const DONATION_BANNER_RESHOW_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
	let showDonationBanner = $state(false);

	// Initialize banner visibility on client only
	if (browser) {
		showDonationBanner = !bannerStore.isDismissed(DONATION_BANNER_ID, DONATION_BANNER_VERSION);
	}

	function dismissDonationBanner() {
		showDonationBanner = false;
		bannerStore.dismiss(DONATION_BANNER_ID, DONATION_BANNER_VERSION, {
			expiresAt: Date.now() + DONATION_BANNER_RESHOW_MS
		});
	}

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
	let pageDescription = $derived(page.data.metadata?.description || m['about.tagline']());
	let ogImageUrl = $derived(
		page.data.metadata?.ogImageUrl || `${SITE_CANONICAL_HOST}/screenshot.png`
	);
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
	<meta property="og:image" content={ogImageUrl} />

	<!-- Twitter Card -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:title" content={pageTitle} />
	<meta property="twitter:description" content={pageDescription} />
	<meta property="twitter:creator" content="@mkpoli" />
	<meta property="twitter:image" content={ogImageUrl} />
	<meta property="twitter:url" content={`${SITE_CANONICAL_HOST}${page.url.pathname}`} />

	<!-- Schema.org Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'LemonTV',
		url: SITE_CANONICAL_HOST,
		description: m['about.tagline']()
	})}</script>`}
</svelte:head>

<div class="flex min-h-dvh flex-col">
	{#if showDonationBanner}
		<div
			class="flex items-center justify-center border-b-1 border-yellow-400/40 bg-yellow-500/15 px-3 py-3 text-yellow-100"
		>
			<div
				class="mx-auto grid w-full max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-start gap-3 md:flex md:items-center md:gap-4"
			>
				<p class="text-center text-sm leading-snug md:flex-1 md:text-left md:text-base">
					<strong class="font-semibold">{m['donation.banner_title']()}</strong>
					{m['donation.banner_message']()}
				</p>
				<button
					class="inline-flex cursor-pointer items-center justify-center justify-self-end rounded p-1 text-yellow-200 hover:bg-yellow-400/10 hover:text-yellow-100 focus:ring-2 focus:ring-yellow-300 focus:outline-none md:order-3 md:ml-3"
					onclick={dismissDonationBanner}
					aria-label={m['donation.banner_dismiss_title']()}
					title={m['donation.banner_dismiss_title']()}
				>
					<MaterialSymbolsCloseRounded class="h-6 w-6" />
				</button>
				<a
					href="https://ko-fi.com/mkpoli/"
					target="_blank"
					rel="noopener noreferrer nofollow"
					class="col-span-2 flex w-full shrink-0 items-center justify-center gap-2 rounded-md bg-yellow-400 px-3 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-yellow-300 focus:ring-2 focus:ring-yellow-300 focus:outline-none md:order-2 md:col-span-1 md:w-auto"
				>
					<SimpleIconsKofi class="h-4 w-4" />
					{m['donation.banner_button']()}
				</a>
			</div>
		</div>
	{/if}
	<header
		class="relative z-50 flex items-center justify-between border-b-1 border-white/30 bg-gradient-to-br from-slate-600/60 to-slate-800 px-4 py-4 text-white backdrop-blur-lg"
	>
		<!-- Desktop navigation -->
		<div class="absolute inset-0 hidden items-center justify-center lg:flex">
			<nav class="flex items-center justify-center gap-1">
				{#each navigation as { href, label }}
					<a
						{href}
						class={[
							'rounded-lg px-4 py-2 transition-all duration-200',
							isActive(href)
								? 'bg-gray-700/40 font-semibold shadow-[inset_0_0_0_2px_rgba(255,255,255,0.1)]'
								: 'hover:scale-105 hover:bg-gray-700/60 hover:text-yellow-300',
							'focus:bg-gray-700 focus:text-yellow-300 focus:ring-2 focus:ring-yellow-300 focus:outline-none'
						]}>{label()}</a
					>
				{/each}
			</nav>
		</div>

		<div class="relative z-10 flex items-center gap-4">
			<a
				href="/"
				class="flex items-center gap-2 text-2xl font-bold transition-colors duration-300 hover:text-yellow-300"
			>
				<img src="/favicon.svg" alt="LemonTV" class="h-10 w-10" />
				LemonTV
			</a>
			<GameSelect />
		</div>

		<!-- Mobile menu button -->
		<button class="cursor-pointer lg:hidden" onclick={toggleMobileMenu}>
			{#if mobileMenuOpen}
				<MaterialSymbolsCloseRounded class="h-8 w-8" />
			{:else}
				<MaterialSymbolsMenuRounded class="h-8 w-8" />
			{/if}
		</button>

		{#if data.user}
			<div class="user-menu relative hidden lg:block">
				<button
					onclick={toggleUserMenu}
					class="flex cursor-pointer items-center gap-2 rounded-full bg-gray-700 p-1 hover:bg-gray-600"
				>
					<UserAvatar email={data.user.email} class="h-8 w-8" />
				</button>
				{#if userMenuOpen}
					<div
						class="ring-opacity-5 absolute right-0 z-50 mt-2 w-48 rounded-md border border-white/10 bg-gray-800 py-1 shadow-lg ring-1 ring-black"
						use:clickOutside
					>
						<div class="border-b border-gray-700 px-4 py-2">
							<p class="text-sm font-medium text-white">{data.user.username}</p>
						</div>
						<a
							href="/profile"
							class="flex items-center gap-2 px-4 py-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-yellow-300"
						>
							<MaterialSymbolsSettingsRounded class="h-5 w-5" />
							{m.profile_settings()}
						</a>
						{#if ['admin', 'editor'].some((role) => data.user?.roles.includes(role))}
							<a
								href="/admin"
								class="flex items-center gap-2 px-4 py-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-yellow-300"
							>
								<MaterialSymbolsAdminPanelSettingsRounded class="h-5 w-5" />
								{m.admin_panel()}
							</a>
						{/if}
						<hr class="border-gray-700" />
						<div class="px-4 py-2">
							<LanguageSelect compact class="w-full" />
							<div class="mt-2 flex items-center gap-2">
								<Switch label={m.spoiler_mode()} bind:checked={settings.spoilerMode} />
							</div>
						</div>
						<hr class="border-gray-700" />
						<form method="post" action="/?/logout">
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
			<div class="z-10 hidden items-stretch gap-2 lg:flex">
				<LanguageSelect />
				{#if page.url.pathname !== '/login'}
					<a
						href="/login?redirect={encodeURIComponent(page.url.pathname + page.url.search)}"
						class="flex items-center rounded-md border-1 border-gray-500 bg-gray-800 px-4 py-1 text-white transition-colors duration-300 hover:bg-gray-700"
						>{m.sign_in()}</a
					>
				{/if}
			</div>
		{/if}
	</header>

	<!-- Mobile navigation menu -->
	{#if mobileMenuOpen}
		<nav
			class="flex flex-col border-b-1 border-white/30 bg-gradient-to-br from-slate-600/60 to-slate-800 px-3 py-4 text-white backdrop-blur-lg lg:hidden"
		>
			{#each navigation as { href, label }}
				<a
					{href}
					class={[
						'rounded-lg px-3 py-2 text-lg transition-all duration-200',
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
					<div class="flex flex-col gap-1.5 pl-4">
						<a
							href="/profile"
							class="flex items-center gap-2 rounded-md px-3 py-2 text-lg text-gray-300 transition-all duration-200 hover:bg-gray-700"
							onclick={toggleMobileMenu}
						>
							<MaterialSymbolsSettingsRounded class="h-5 w-5" />
							{m.profile_settings()}
						</a>
						{#if ['admin', 'editor'].some((role) => data.user?.roles.includes(role))}
							<a
								href="/admin"
								class="flex items-center gap-2 rounded-md px-3 py-2 text-lg text-gray-300 transition-all duration-200 hover:bg-gray-700"
								onclick={toggleMobileMenu}
							>
								<MaterialSymbolsAdminPanelSettingsRounded class="h-5 w-5" />
								{m.admin_panel()}
							</a>
						{/if}
						<div class="py-2">
							<LanguageSelect class="w-full" />
							<div class="mt-2 flex items-center gap-2">
								<Switch label={m.spoiler_mode()} bind:checked={settings.spoilerMode} />
							</div>
						</div>
						<hr class="border-gray-700" />
						<form method="post" action="/?/logout">
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
					<div class="flex flex-col gap-1.5 pl-4">
						<LanguageSelect class="w-full" />
						<div
							class="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-700 hover:text-yellow-300"
						>
							<Switch label={m.spoiler_mode()} bind:checked={settings.spoilerMode} />
						</div>
					</div>

					{#if page.url.pathname !== '/login'}
						<hr class="my-2 border-gray-700" />
						<a
							href="/login?redirect={encodeURIComponent(page.url.pathname + page.url.search)}"
							class="flex w-full items-center justify-center rounded-md border-1 border-gray-500 bg-gray-700 px-4 py-2 text-lg text-white transition-colors duration-300 hover:bg-gray-600"
							onclick={toggleMobileMenu}>{m.sign_in()}</a
						>
					{/if}
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
				© 2025 <a
					href="/about"
					class="text-yellow-300 transition-colors duration-100 hover:text-yellow-400 hover:underline"
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
					href={STRINOVA_ESPORTS_HUB_DISCORD_URL}
					target="_blank"
					rel="noopener noreferrer"
					class="text-yellow-300 transition-colors duration-300 hover:text-yellow-400"
				>
					<IconDiscord class="h-6 w-6" />
				</a>
				<a
					href={LEMON_TV_QQ_URL}
					target="_blank"
					rel="noopener noreferrer"
					class="text-yellow-300 transition-colors duration-300 hover:text-yellow-400"
				>
					<IconQq class="h-6 w-6" />
				</a>
				<a
					href={GITHUB_REPO_URL}
					target="_blank"
					rel="noopener noreferrer"
					class="text-yellow-300 transition-colors duration-300 hover:text-yellow-400"
				>
					<IconGithub class="h-6 w-6" />
				</a>
			</div>
			<div class="mb-4 flex justify-center gap-4">
				<a
					href={LEMON_TV_ORG_URL}
					target="_blank"
					rel="noopener noreferrer"
					class="text-yellow-300 transition-colors duration-300 hover:text-yellow-400"
				>
					LemonTV Org
				</a>
				<a
					href="https://lemonade.mkpo.li/"
					target="_blank"
					rel="noopener noreferrer"
					class="text-yellow-300 transition-colors duration-300 hover:text-yellow-400"
				>
					Lemonade
				</a>
				<a
					href="https://slice.lemontv.win/"
					target="_blank"
					rel="noopener noreferrer"
					class="text-yellow-300 transition-colors duration-300 hover:text-yellow-400"
				>
					LemonSlice
				</a>
			</div>
			<p class="text-xs text-gray-400">
				{@html m.footer_trademark({
					strinova: `<a href="https://www.strinova.com/" class="underline hover:text-gray-300" target="_blank">Strinova</a>`,
					idreamsky: `<a href="${['zh', 'zh-tw'].includes(getLocale()) ? IDREAMSKY_URL_ZH : IDREAMSKY_URL_EN}" class="underline hover:text-gray-300" target="_blank">${m.idreamsky()}</a>`
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
