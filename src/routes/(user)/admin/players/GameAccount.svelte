<script lang="ts">
	import type { Region } from '$lib/data/game';
	import { SERVER_ABBREVIATIONS } from '$lib/data/players';

	let {
		account
	}: {
		account: {
			accountId: number;
			currentName: string;
			region?: Region;
			server: 'Strinova' | 'CalabiYau';
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
