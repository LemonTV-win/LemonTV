<script lang="ts">
	import LogosTwitch from '~icons/logos/twitch';
	import LogosTwitter from '~icons/devicon/twitter';
	import LogosYoutube from '~icons/logos/youtube-icon';
	import LogosBilibili from '~icons/ant-design/bilibili-outlined';

	let {
		socialAccounts = [],
		socialPlatforms = [],
		iconSize = 'h-4 w-4'
	} = $props<{
		socialAccounts: Array<{ platformId: string; accountId: string; overridingUrl?: string }>;
		socialPlatforms: Array<{ id: string; name: string; url_template: string | null }>;
		iconSize?: string;
	}>();
</script>

{#if socialAccounts.length}
	<div class="flex gap-2">
		{#each socialAccounts as account}
			{#each socialPlatforms as platform}
				{#if platform.id === account.platformId}
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
						{:else}
							<span class="text-sm">{platform.name}</span>
						{/if}
					</a>
				{/if}
			{/each}
		{/each}
	</div>
{/if}
