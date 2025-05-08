<script lang="ts">
	import LogosTwitch from '~icons/logos/twitch';
	import LogosTwitter from '~icons/devicon/twitter';
	import LogosYoutube from '~icons/logos/youtube-icon';
	import { m } from '$lib/paraglide/messages';

	let {
		value = '',
		platforms = [],
		onChange
	} = $props<{
		value?: string;
		platforms?: Array<{ id: string; name: string }>;
		onChange: (platformId: string) => void;
	}>();

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
				{/if}
				{#each platforms as platform}
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
			{#each platforms as platform}
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
					{/if}
					<span>{platform.name}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>
