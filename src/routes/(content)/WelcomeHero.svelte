<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import IconDiscord from '~icons/simple-icons/discord';
	import IconQq from '~icons/simple-icons/qq';
	import { STRINOVA_ESPORTS_HUB_DISCORD_URL, LEMON_TV_QQ_URL } from '$lib/consts';
	import { getLocale } from '$lib/paraglide/runtime';
</script>

<section class="relative flex min-h-[60vh] items-center justify-center px-4 text-center">
	<div class="absolute inset-0 z-0 bg-gradient-to-b from-black/80 to-transparent"></div>

	<div class="relative z-10 max-w-3xl">
		<h1
			class="text-whit mb-4 text-4xl font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] md:text-6xl"
		>
			{m.welcome_to_lemon_tv()}
		</h1>
		<p class="mb-8 text-xl text-gray-200 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] md:text-2xl">
			{m.hero_description()}
		</p>
		<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
			<a
				href={['zh', 'zh-tw'].includes(getLocale())
					? LEMON_TV_QQ_URL
					: STRINOVA_ESPORTS_HUB_DISCORD_URL}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-8 py-3 text-lg font-bold text-black drop-shadow-[0_0_10px_oklch(79.5%_0.184_86.047_/_20%)] transition-all duration-200 hover:bg-yellow-400 hover:drop-shadow-[0_0_10px_oklch(79.5%_0.184_86.047_/_30%)]"
			>
				{#if ['zh', 'zh-tw'].includes(getLocale())}
					<IconQq class="h-5 w-5" />
					加入QQ群
				{:else}
					<IconDiscord class="h-5 w-5" />
					Join Discord
				{/if}
			</a>
			<a
				href="/login?tab=register"
				class="inline-block rounded-lg border-2 border-white px-8 py-3 text-lg font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
				title={m.sign_up_description()}
			>
				{m.sign_up()}
			</a>
		</div>
	</div>
</section>
