<script lang="ts">
	import LogosTwitch from '~icons/logos/twitch';
	import LogosTwitter from '~icons/devicon/twitter';
	import LogosYoutube from '~icons/logos/youtube-icon';
	import LogosBilibili from '~icons/ant-design/bilibili-outlined';
	import LogosInstagram from '~icons/skill-icons/instagram';
	import LogosTiktokIcon from '~icons/logos/tiktok-icon';
	// TODO: import LogosDiscord from '~icons/logos/discord-icon';
	import LogosFacebook from '~icons/logos/facebook';
	import LogosLinkedin from '~icons/logos/linkedin-icon';
	import LogosGithub from '~icons/logos/github-icon';
	import LogosReddit from '~icons/logos/reddit-icon';
	import IconGlobe from '~icons/pepicons-pencil/internet';
	import { m } from '$lib/paraglide/messages';

	let {
		value = '',
		platforms = [],
		onChange
	}: {
		value?: string;
		platforms?: Array<{ id: string; name: string; url_template: string | null }>;
		onChange: (platformId: string) => void;
	} = $props();

	// Filter out Discord from platforms
	let visiblePlatforms = $derived(platforms.filter((p) => p.id !== 'discord'));

	let isOpen = $state(false);

	function toggle() {
		isOpen = !isOpen;
	}

	function select(platformId: string) {
		onChange(platformId);
		isOpen = false;
	}

	// Close select when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.platform-select')) {
			isOpen = false;
		}
	}

	$effect(() => {
		if (isOpen) {
			window.addEventListener('click', handleClickOutside);
		}
		return () => {
			window.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div class="platform-select relative">
	<button
		type="button"
		onclick={toggle}
		class="mt-1 flex w-full items-center justify-between rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-left text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
	>
		<div class="flex items-center gap-2">
			{#if value}
				{#if value === 'twitch'}
					<LogosTwitch class="h-4 w-4 text-gray-400" />
				{:else if value === 'twitter'}
					<LogosTwitter class="h-4 w-4 text-gray-400" />
				{:else if value === 'youtube'}
					<LogosYoutube class="h-4 w-4 text-gray-400" />
				{:else if value === 'bilibili'}
					<LogosBilibili class="h-4 w-4 text-gray-400" />
				{:else if value === 'instagram'}
					<LogosInstagram class="h-4 w-4 text-gray-400" />
				{:else if value === 'tiktok'}
					<LogosTiktokIcon class="h-4 w-4 text-gray-400" />
				{:else if value === 'facebook'}
					<LogosFacebook class="h-4 w-4 text-gray-400" />
				{:else if value === 'linkedin'}
					<LogosLinkedin class="h-4 w-4 text-gray-400" />
				{:else if value === 'github'}
					<LogosGithub class="h-4 w-4 text-gray-400" />
				{:else if value === 'reddit'}
					<LogosReddit class="h-4 w-4 text-gray-400" />
				{:else if value === 'homepage'}
					<IconGlobe class="h-4 w-4 text-gray-400" />
				{/if}
				{#each visiblePlatforms as platform (platform.id)}
					{#if platform.id === value}
						<span>{platform.name}</span>
					{/if}
				{/each}
			{:else}
				<span class="text-gray-400">{m.select_platform()}</span>
			{/if}
		</div>
		<svg
			class="h-5 w-5 text-gray-400 transition-transform duration-200"
			class:rotate-180={isOpen}
			viewBox="0 0 20 20"
			fill="currentColor"
		>
			<path
				fill-rule="evenodd"
				d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
				clip-rule="evenodd"
			/>
		</svg>
	</button>
	{#if isOpen}
		<div
			class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-700 bg-slate-800 py-1 shadow-lg"
		>
			<button
				type="button"
				class="flex w-full items-center gap-2 px-3 py-2 text-left text-white hover:bg-slate-700"
				onclick={() => select('')}
			>
				<span class="text-gray-400">{m.select_platform()}</span>
			</button>
			{#each visiblePlatforms as platform (platform.id)}
				<button
					type="button"
					class="flex w-full items-center gap-2 px-3 py-2 text-left text-white hover:bg-slate-700"
					onclick={() => select(platform.id)}
				>
					{#if platform.id === 'twitch'}
						<LogosTwitch class="h-4 w-4 text-gray-400" />
					{:else if platform.id === 'twitter'}
						<LogosTwitter class="h-4 w-4 text-gray-400" />
					{:else if platform.id === 'youtube'}
						<LogosYoutube class="h-4 w-4 text-gray-400" />
					{:else if platform.id === 'bilibili'}
						<LogosBilibili class="h-4 w-4 text-gray-400" />
					{:else if platform.id === 'instagram'}
						<LogosInstagram class="h-4 w-4 text-gray-400" />
					{:else if platform.id === 'tiktok'}
						<LogosTiktokIcon class="h-4 w-4 text-gray-400" />
					{:else if platform.id === 'facebook'}
						<LogosFacebook class="h-4 w-4 text-gray-400" />
					{:else if platform.id === 'linkedin'}
						<LogosLinkedin class="h-4 w-4 text-gray-400" />
					{:else if platform.id === 'github'}
						<LogosGithub class="h-4 w-4 text-gray-400" />
					{:else if platform.id === 'reddit'}
						<LogosReddit class="h-4 w-4 text-gray-400" />
					{:else if platform.id === 'homepage'}
						<IconGlobe class="h-4 w-4 text-gray-400" />
					{/if}
					<span>{platform.name}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>
