<script lang="ts">
	import LogosTwitch from '~icons/logos/twitch';
	import LogosTwitter from '~icons/devicon/twitter';
	import LogosYoutube from '~icons/logos/youtube-icon';
	import LogosBilibili from '~icons/ant-design/bilibili-outlined';
	import LogosInstagram from '~icons/skill-icons/instagram';
	import LogosTiktokIcon from '~icons/logos/tiktok-icon';
	import LogosDiscord from '~icons/logos/discord-icon';
	import LogosFacebook from '~icons/logos/facebook';
	import LogosLinkedin from '~icons/logos/linkedin-icon';
	import LogosGithub from '~icons/logos/github-icon';
	import LogosReddit from '~icons/logos/reddit-icon';
	import IconGlobe from '~icons/pepicons-pencil/internet';

	let {
		socialAccounts = [],
		socialPlatforms = [],
		iconSize = 'h-4 w-4'
	}: {
		socialAccounts: Array<{ platformId: string; accountId: string; overridingUrl?: string }>;
		socialPlatforms: Array<{ id: string; name: string; url_template: string | null }>;
		iconSize?: string;
	} = $props();
</script>

{#if socialAccounts.length}
	<div class="flex gap-0.5">
		{#each socialAccounts as account (account.platformId)}
			{#each socialPlatforms as platform (platform.id)}
				{#if platform.id === account.platformId}
					<!-- eslint-disable-next-line no-navigation-without-resolve -->
					<a
						href={platform.url_template
							? platform.url_template.replace('{accountId}', account.accountId)
							: account.overridingUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center justify-center rounded-full p-1.5 transition-all duration-200 hover:bg-slate-700 hover:brightness-125"
						title={platform.url_template
							? platform.url_template.replace('{accountId}', account.accountId)
							: account.overridingUrl}
					>
						{#if platform.id === 'twitch'}
							<LogosTwitch class={iconSize} />
						{:else if platform.id === 'twitter'}
							<LogosTwitter class={iconSize} />
						{:else if platform.id === 'youtube'}
							<LogosYoutube class={iconSize} />
						{:else if platform.id === 'bilibili'}
							<LogosBilibili class={iconSize} />
						{:else if platform.id === 'instagram'}
							<LogosInstagram class={iconSize} />
						{:else if platform.id === 'tiktok'}
							<LogosTiktokIcon class={iconSize} />
						{:else if platform.id === 'discord'}
							<LogosDiscord class={iconSize} />
						{:else if platform.id === 'facebook'}
							<LogosFacebook class={iconSize} />
						{:else if platform.id === 'linkedin'}
							<LogosLinkedin class={iconSize} />
						{:else if platform.id === 'github'}
							<LogosGithub class={iconSize} />
						{:else if platform.id === 'reddit'}
							<LogosReddit class={iconSize} />
						{:else if platform.id === 'homepage'}
							<IconGlobe class={iconSize} />
						{:else}
							<span class="text-sm">{platform.name}</span>
						{/if}
					</a>
				{/if}
			{/each}
		{/each}
	</div>
{/if}
