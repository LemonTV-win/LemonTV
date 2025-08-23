<script lang="ts">
	import {
		SERVER_ABBREVIATIONS,
		type GameAccountRegion,
		type GameAccountServer
	} from '$lib/data/players';

	let {
		account
	}: {
		account: {
			accountId: number;
			currentName: string;
			region?: GameAccountRegion;
			server: GameAccountServer;
		};
	} = $props();
</script>

<div class="flex items-center gap-1">
	<span class="font-mono text-xs text-gray-400" title={`${account.server}: ${account.accountId}`}>
		{SERVER_ABBREVIATIONS[account.server]}:{account.accountId}
	</span>
	{account.currentName}
	{#if account.region}
		<span class="text-xs text-gray-400">({account.region})</span>
	{/if}
</div>
