<script lang="ts">
	import type { TCountryCode } from 'countries-list';
	import NationalityFlag from '$lib/components/NationalityFlag.svelte';
	import { formatSlug } from '$lib/utils/strings';
	import type { PlayerImportData } from './PlayerBatchImport.svelte';
	interface Props {
		players: PlayerImportData[];
		description?: string;
		showDuplicateHighlighting?: boolean;
		duplicateCheckers?: {
			isDuplicateSlug?: (player: PlayerImportData) => boolean;
			isDuplicateAccountId?: (player: PlayerImportData) => boolean;
			getDuplicateReason?: (player: PlayerImportData) => string;
			getDuplicateAccountIdReason?: (player: PlayerImportData) => string;
		};
		containerClass?: string;
	}

	let {
		players,
		description,
		showDuplicateHighlighting = false,
		duplicateCheckers = {},
		containerClass = 'mb-4 rounded-md border border-slate-600 bg-slate-900 p-4'
	}: Props = $props();

	const { isDuplicateSlug, isDuplicateAccountId, getDuplicateReason, getDuplicateAccountIdReason } =
		duplicateCheckers;
</script>

<div class={containerClass}>
	{#if description}
		<p class="mb-3 text-xs text-slate-300">{description}</p>
	{/if}

	<div
		class="styled-scroll max-h-128 overflow-x-auto overflow-y-auto rounded-md border border-slate-700 bg-slate-900"
	>
		<table class="w-full table-auto border-collapse border-y-2 border-gray-500 bg-gray-800">
			<thead>
				<tr class="border-b-2 border-gray-500 text-left text-sm text-gray-400">
					<th class="px-4 py-1">Name</th>
					<th class="px-4 py-1">Slug</th>
					<th class="px-4 py-1">Nationalities</th>
					<th class="px-4 py-1">Aliases</th>
					<th class="px-4 py-1">Game Accounts</th>
					<th class="px-4 py-1">Social Accounts</th>
					<th class="px-4 py-1">User</th>
				</tr>
			</thead>
			<tbody>
				{#each players as player}
					<tr class="border-b-1 border-gray-500 bg-gray-800 px-4 py-2 shadow-2xl">
						<td class="px-4 py-1 text-white">
							{player.name}
						</td>
						<td
							class="max-w-32 truncate px-4 py-1 text-white {showDuplicateHighlighting &&
							isDuplicateSlug?.(player)
								? 'bg-red-900/30'
								: ''}"
							title={showDuplicateHighlighting && isDuplicateSlug?.(player)
								? getDuplicateReason?.(player) || ''
								: ''}
						>
							{player.slug || formatSlug(player.name)}
						</td>
						<td class="max-w-6 px-4 py-1 text-gray-300">
							{#each player.nationalities ?? [] as nationality, idx (idx)}
								<NationalityFlag {nationality} />
							{:else}
								<NationalityFlag nationality={null} />
							{/each}
						</td>
						<td class="px-4 py-1 text-gray-300">
							{#if player.aliases && player.aliases.length > 0}
								{#each player.aliases as alias}
									{alias},
								{/each}
							{:else}
								-
							{/if}
						</td>
						<td
							class="px-4 py-1 text-gray-300 {showDuplicateHighlighting &&
							isDuplicateAccountId?.(player)
								? 'bg-red-900/30'
								: ''}"
							title={showDuplicateHighlighting && isDuplicateAccountId?.(player)
								? getDuplicateAccountIdReason?.(player) || ''
								: ''}
						>
							{#if player.gameAccounts && player.gameAccounts.length > 0}
								<ul>
									{#each player.gameAccounts as account}
										<li class="break-keep whitespace-nowrap">
											<span class="text-xs text-gray-400">{account.accountId}</span>
											{account.currentName}
											{#if account.region}
												<span class="text-xs text-gray-400">({account.region})</span>
											{/if}
										</li>
									{/each}
								</ul>
							{:else}
								-
							{/if}
						</td>
						<td class="px-4 py-1 text-gray-300">
							{#if player.socialAccounts && player.socialAccounts.length > 0}
								<ul>
									{#each player.socialAccounts as account}
										<li class="break-keep whitespace-nowrap">
											{account.platformId} - {account.accountId}
											{#if account.overridingUrl}
												<span class="text-xs text-gray-400">({account.overridingUrl})</span>
											{/if}
										</li>
									{/each}
								</ul>
							{:else}
								-
							{/if}
						</td>
						<td class="px-4 py-1 text-gray-300">
							{#if player.user}
								<div class="flex flex-col">
									<span class="text-xs text-gray-400">{player.user.id}</span>
									<span>{player.user.username}</span>
								</div>
							{:else}
								-
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
