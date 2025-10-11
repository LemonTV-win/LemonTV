<script lang="ts">
	import IconDiscord from '~icons/simple-icons/discord';
	import IconGithub from '~icons/simple-icons/github';
	import IconTwitch from '~icons/simple-icons/twitch';
	import IconX from '~icons/simple-icons/x';
	import IconYoutube from '~icons/simple-icons/youtube';
	import IconLinktree from '~icons/simple-icons/linktree';
	import IconBilibili from '~icons/simple-icons/bilibili';
	import IconQq from '~icons/simple-icons/qq';
	import IconGlobe from '~icons/pepicons-pencil/internet';
	import IconCalendar from '~icons/icon-park-solid/calendar';
	import IconTrend from '~icons/icon-park-solid/trend-two';
	import IconHome from '~icons/icon-park-solid/home';
	import { m } from '$lib/paraglide/messages';
	import {
		IDREAMSKY_URL_EN,
		IDREAMSKY_URL_ZH,
		STRINOVA_ESPORTS_HUB_DISCORD_URL,
		LEMON_TV_QQ_URL,
		GITHUB_REPO_URL
	} from '$lib/consts';
	import { getLocale } from '$lib/paraglide/runtime';
	import placeholderAvatar from '$assets/placeholder_avatar.png';
	import type { PageProps } from './$types';

	const ROLE_NAMES: Record<string, () => string> = {
		founder: m['about.team_roles_founder'],
		chief_editor: m['about.team_roles_chief_editor'],
		consultant: m['about.team_roles_consultant'],
		editor: m['about.team_roles_editor'],
		translator: m['about.team_roles_translator']
	} as const;

	let { data }: PageProps = $props();

	const SOCIAL_ICONS: Record<string, any> = {
		github: IconGithub,
		x: IconX,
		youtube: IconYoutube,
		twitch: IconTwitch,
		linktree: IconLinktree,
		bilibili: IconBilibili,
		homepage: IconHome
	};
</script>

<svelte:head>
	<title>{m['about.title']()} | LemonTV</title>
</svelte:head>

<main class="glass-container mx-auto max-w-screen-lg p-12">
	<div class="glass rounded-lg p-8 hover:scale-100">
		<div class="mx-auto max-w-4xl">
			<section class="mb-16 text-center">
				<img src="/favicon.svg" alt="LemonTV Logo" class="mx-auto mb-6 h-24 w-24" />
				<h1 class="mb-4 text-4xl font-bold">{m['about.title']()}</h1>
				<p class="text-xl text-slate-400">{m['about.tagline']()}</p>
			</section>

			<section class="mb-12">
				<h2 class="mb-6 text-3xl font-semibold">{m['about.mission_title']()}</h2>
				<p class="leading-relaxed text-slate-200">
					{m['about.mission_description']()}
				</p>
			</section>

			<section class="mb-12">
				<h2 class="mb-6 text-3xl font-semibold">{m['about.features_title']()}</h2>
				<div class="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
					<div class="glass-card group p-6 transition-all duration-300 hover:scale-105">
						<div class="relative mb-4">
							<div
								class="pointer-events-none absolute -top-4 -right-4 opacity-5 transition-all duration-300 group-hover:text-blue-300 group-hover:opacity-20"
							>
								<IconCalendar class="h-20 w-20 text-blue-400" />
							</div>
							<h3 class="relative z-20 text-xl font-semibold">
								{m['about.features_coverage_title']()}
							</h3>
						</div>
						<p class="relative z-20 text-slate-200">{m['about.features_coverage_description']()}</p>
					</div>
					<div class="glass-card group p-6 transition-all duration-300 hover:scale-105">
						<div class="relative mb-4">
							<div
								class="pointer-events-none absolute -top-4 -right-4 opacity-5 transition-all duration-300 group-hover:text-green-300 group-hover:opacity-20"
							>
								<IconGlobe class="h-20 w-20 text-green-400" />
							</div>
							<h3 class="relative z-20 text-xl font-semibold">
								{m['about.features_community_title']()}
							</h3>
						</div>
						<p class="relative z-20 text-slate-200">
							{m['about.features_community_description']()}
						</p>
					</div>
					<div class="glass-card group p-6 transition-all duration-300 hover:scale-105">
						<div class="relative mb-4">
							<div
								class="pointer-events-none absolute -top-4 -right-4 opacity-5 transition-all duration-300 group-hover:text-purple-300 group-hover:opacity-20"
							>
								<IconTrend class="h-20 w-20 text-purple-400" />
							</div>
							<h3 class="relative z-20 text-xl font-semibold">
								{m['about.features_stats_title']()}
							</h3>
						</div>
						<p class="relative z-20 text-slate-200">{m['about.features_stats_description']()}</p>
					</div>
				</div>
			</section>

			<section class="mb-12 text-center" id="team">
				<h2 class="mb-6 text-3xl font-semibold">{m['about.team_title']()}</h2>
				<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
					{#each data.members as member}
						<div class="glass-card p-6">
							<div class="grid grid-cols-[auto_1fr_auto] items-start gap-4">
								<img
									src={member.avatar || placeholderAvatar}
									alt="{member.name} avatar"
									class="h-16 w-16 min-w-16 rounded-full object-cover"
								/>
								<div class="flex flex-col items-start justify-around">
									<h3
										class="my-0 overflow-hidden text-left text-xl font-semibold text-ellipsis whitespace-nowrap"
									>
										{member.name}
									</h3>
									<p class="my-2 text-left text-slate-300">
										{member.roles
											.map((role) => ROLE_NAMES[role as keyof typeof ROLE_NAMES]())
											.join(m['about.team_roles_delimiter']())}
									</p>
								</div>
								<div class="flex flex-wrap gap-3">
									{#each member.socials as social, i (i)}
										{@const Icon = SOCIAL_ICONS[social.type]}
										<a
											href={social.link}
											target="_blank"
											rel="noopener noreferrer"
											class="text-blue-400 transition-colors duration-200 hover:text-blue-300"
										>
											<Icon class="h-5 w-5" />
										</a>
									{/each}
								</div>
							</div>
						</div>
					{/each}

					<div class="glass-card p-6 md:col-span-2">
						<h3 class="mb-2 text-xl font-semibold">{m['about.team_join_title']()}</h3>
						<p class="mb-4 text-slate-300">{m['about.team_join_description']()}</p>
						<div class="flex justify-center gap-2">
							<a
								href={STRINOVA_ESPORTS_HUB_DISCORD_URL}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-2 text-blue-400 hover:underline"
							>
								<IconDiscord class="h-6 w-6" />
								{m['about.team_join_discord']()}
							</a>
							<a
								href={LEMON_TV_QQ_URL}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-2 text-blue-400 hover:underline"
							>
								<IconQq class="h-6 w-6" />
								{m['about.team_join_qq']()}
							</a>
						</div>
					</div>
				</div>
			</section>

			<p class="text-slate-200">
				{#snippet renderThanks()}
					{@const message = m['about.thanks_message']({
						idreamsky: '{{IDREAMSKY_LINK}}'
					})}
					{@const parts = message.split(/\{\{IDREAMSKY_LINK\}\}/)}
					{#each parts as part, i}
						{#if i % 2 === 1 && part.trim()}
							<a
								href={['zh', 'zh-tw'].includes(getLocale()) ? IDREAMSKY_URL_ZH : IDREAMSKY_URL_EN}
								class="underline hover:text-gray-300"
								target="_blank"
							>
								{part.trim()}
							</a>
						{:else if part.trim()}
							{part}
						{/if}
					{/each}
				{/snippet}
				{@render renderThanks()}
			</p>

			<section class="my-12 text-center">
				<h2 class="mb-6 text-3xl font-semibold">{m['about.links_title']()}</h2>
				<div class="flex flex-col items-center gap-4">
					<a
						href={GITHUB_REPO_URL}
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-2 text-blue-400 hover:underline"
					>
						<IconGithub class="h-6 w-6" />
						{m['about.links_github']()}
					</a>
				</div>
			</section>

			<footer class="mt-8 text-center text-sm text-slate-400">© 2025 LemonTV</footer>
		</div>
	</div>
</main>
