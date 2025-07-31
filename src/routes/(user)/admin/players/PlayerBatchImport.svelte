<script lang="ts">
	import type { TCountryCode } from 'countries-list';
	import NationalityFlag from '$lib/components/NationalityFlag.svelte';
	import Highlight from 'svelte-highlight';
	import typescript from 'svelte-highlight/languages/typescript';
	import '$lib/highlight.css';
	import { formatSlug } from '$lib/utils/strings';

	import { deserialize } from '$app/forms';
	import { m } from '$lib/paraglide/messages';

	interface PlayerImportData {
		name: string;
		slug?: string;
		nationalities?: TCountryCode[];
		aliases?: string[];
		gameAccounts?: {
			server: 'Strinova' | 'CalabiYau';
			accountId: number;
			currentName: string;
			region?: string;
		}[];
		socialAccounts?: {
			platformId: string;
			accountId: string;
			overridingUrl?: string;
		}[];
		user?: {
			id: string;
			username: string;
			email: string;
			roles: string[];
		};
	}

	let { showModal, onClose, onSuccess, existingPlayers } = $props<{
		showModal: boolean;
		onClose: () => void;
		onSuccess: (message: string) => void;
		existingPlayers: Array<{
			id: string;
			name: string;
			slug: string;
			gameAccounts?: Array<{ accountId: number; server: string }>;
		}>;
	}>();

	let importJsonData = $state('');
	let importError = $state('');
	let isImporting = $state(false);
	let showSchema = $state(false);
	let parsedPlayers = $state<PlayerImportData[] | null>(null);

	// Get all existing slugs for comparison
	let existingSlugs = $derived(() => {
		return new Set(
			existingPlayers.map((player: { id: string; name: string; slug: string }) => player.slug)
		);
	});

	// Check for duplicate slugs in parsed data (including against existing players)
	let duplicateSlugs = $derived.by(() => {
		if (!parsedPlayers) return [];

		const slugCounts = new Map<string, string[]>();
		const existingSlugSet = existingSlugs();

		// Count slugs within the parsed data
		parsedPlayers.forEach((player, index) => {
			const slug = player.slug || formatSlug(player.name);
			if (!slugCounts.has(slug)) {
				slugCounts.set(slug, []);
			}
			slugCounts.get(slug)!.push(player.name);
		});

		const duplicates: string[] = [];

		// Check for duplicates within parsed data
		slugCounts.forEach((names, slug) => {
			if (names.length > 1) {
				duplicates.push(`${slug} (${names.join(', ')})`);
			}
		});

		// Check for conflicts with existing players
		parsedPlayers.forEach((player) => {
			const slug = player.slug || formatSlug(player.name);
			if (existingSlugSet.has(slug)) {
				const existingPlayer = existingPlayers.find(
					(p: { id: string; name: string; slug: string }) => p.slug === slug
				);
				duplicates.push(`${slug} (conflicts with existing: ${existingPlayer?.name || 'Unknown'})`);
			}
		});

		return duplicates;
	});

	let hasDuplicateSlugs = $derived(duplicateSlugs.length > 0);

	// Get duplicate slug values for highlighting (including existing players)
	let duplicateSlugValues = $derived(() => {
		if (!parsedPlayers) return new Set<string>();

		const slugCounts = new Map<string, number>();

		// Count slugs within parsed data
		parsedPlayers.forEach((player) => {
			const slug = player.slug || formatSlug(player.name);
			slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1);
		});

		const duplicates = new Set<string>();

		// Check for duplicates within parsed data
		slugCounts.forEach((count, slug) => {
			if (count > 1) {
				duplicates.add(slug);
			}
		});

		// Check for conflicts with existing players
		parsedPlayers.forEach((player: PlayerImportData) => {
			const slug = player.slug || formatSlug(player.name);
			if (existingSlugs().has(slug)) {
				duplicates.add(slug);
			}
		});

		return duplicates;
	});

	// Check if a player has a duplicate slug (including against existing players)
	function isDuplicateSlug(player: PlayerImportData): boolean {
		const slug = player.slug || formatSlug(player.name);
		return duplicateSlugValues().has(slug);
	}

	// Get the reason for duplicate (internal or existing conflict)
	function getDuplicateReason(player: PlayerImportData): string {
		const slug = player.slug || formatSlug(player.name);

		// Check if it conflicts with existing players
		if (existingSlugs().has(slug)) {
			const existingPlayer = existingPlayers.find(
				(p: { id: string; name: string; slug: string }) => p.slug === slug
			);
			return `Conflicts with existing player: ${existingPlayer?.name || 'Unknown'}`;
		}

		// Check if it's duplicate within parsed data
		const slugCounts = new Map<string, string[]>();
		parsedPlayers?.forEach((p: PlayerImportData) => {
			const pSlug = p.slug || formatSlug(p.name);
			if (!slugCounts.has(pSlug)) {
				slugCounts.set(pSlug, []);
			}
			slugCounts.get(pSlug)!.push(p.name);
		});

		const names = slugCounts.get(slug) || [];
		if (names.length > 1) {
			return `Duplicate within import: ${names.filter((n) => n !== player.name).join(', ')}`;
		}

		return 'Unknown duplicate';
	}

	// Get all existing account IDs for comparison
	let existingAccountIds = $derived(() => {
		const accountIds = new Set<number>();
		existingPlayers.forEach(
			(player: {
				id: string;
				name: string;
				slug: string;
				gameAccounts?: Array<{ accountId: number; server: string }>;
			}) => {
				player.gameAccounts?.forEach((account: { accountId: number; server: string }) => {
					accountIds.add(account.accountId);
				});
			}
		);
		return accountIds;
	});

	// Check for duplicate account IDs in parsed data (including against existing players)
	let duplicateAccountIds = $derived.by(() => {
		if (!parsedPlayers) return [];

		const accountIdCounts = new Map<number, string[]>();
		const existingAccountIdSet = existingAccountIds();

		// Count account IDs within the parsed data
		parsedPlayers.forEach((player) => {
			player.gameAccounts?.forEach((account) => {
				if (!accountIdCounts.has(account.accountId)) {
					accountIdCounts.set(account.accountId, []);
				}
				accountIdCounts.get(account.accountId)!.push(`${player.name} (${account.server})`);
			});
		});

		const duplicates: string[] = [];

		// Check for duplicates within parsed data
		accountIdCounts.forEach((names, accountId) => {
			if (names.length > 1) {
				duplicates.push(`Account ID ${accountId} (${names.join(', ')})`);
			}
		});

		// Check for conflicts with existing players
		parsedPlayers.forEach((player) => {
			player.gameAccounts?.forEach((account) => {
				if (existingAccountIdSet.has(account.accountId)) {
					const existingPlayer = existingPlayers.find(
						(p: {
							id: string;
							name: string;
							slug: string;
							gameAccounts?: Array<{ accountId: number; server: string }>;
						}) =>
							p.gameAccounts?.some(
								(ga: { accountId: number; server: string }) => ga.accountId === account.accountId
							)
					);
					duplicates.push(
						`Account ID ${account.accountId} (${player.name} conflicts with existing: ${existingPlayer?.name || 'Unknown'})`
					);
				}
			});
		});

		return duplicates;
	});

	let hasDuplicateAccountIds = $derived(duplicateAccountIds.length > 0);

	// Get duplicate account ID values for highlighting
	let duplicateAccountIdValues = $derived(() => {
		if (!parsedPlayers) return new Set<number>();

		const accountIdCounts = new Map<number, number>();
		const existingAccountIdSet = existingAccountIds();

		// Count account IDs within parsed data
		parsedPlayers.forEach((player) => {
			player.gameAccounts?.forEach((account) => {
				accountIdCounts.set(account.accountId, (accountIdCounts.get(account.accountId) || 0) + 1);
			});
		});

		const duplicates = new Set<number>();

		// Check for duplicates within parsed data
		accountIdCounts.forEach((count, accountId) => {
			if (count > 1) {
				duplicates.add(accountId);
			}
		});

		// Check for conflicts with existing players
		parsedPlayers.forEach((player) => {
			player.gameAccounts?.forEach((account) => {
				if (existingAccountIdSet.has(account.accountId)) {
					duplicates.add(account.accountId);
				}
			});
		});

		return duplicates;
	});

	// Check if a player has a duplicate account ID
	function isDuplicateAccountId(player: PlayerImportData): boolean {
		if (!player.gameAccounts) return false;
		return player.gameAccounts.some((account) => duplicateAccountIdValues().has(account.accountId));
	}

	// Get the reason for account ID duplicate
	function getDuplicateAccountIdReason(player: PlayerImportData): string {
		if (!player.gameAccounts) return '';

		const reasons: string[] = [];
		const existingAccountIdSet = existingAccountIds();

		player.gameAccounts.forEach((account) => {
			if (duplicateAccountIdValues().has(account.accountId)) {
				// Check if it conflicts with existing players
				if (existingAccountIdSet.has(account.accountId)) {
					const existingPlayer = existingPlayers.find(
						(p: {
							id: string;
							name: string;
							slug: string;
							gameAccounts?: Array<{ accountId: number; server: string }>;
						}) =>
							p.gameAccounts?.some(
								(ga: { accountId: number; server: string }) => ga.accountId === account.accountId
							)
					);
					reasons.push(
						`Account ID ${account.accountId} conflicts with existing player: ${existingPlayer?.name || 'Unknown'}`
					);
				} else {
					// Check if it's duplicate within parsed data
					const accountIdCounts = new Map<number, string[]>();
					parsedPlayers?.forEach((p: PlayerImportData) => {
						p.gameAccounts?.forEach((ga) => {
							if (!accountIdCounts.has(ga.accountId)) {
								accountIdCounts.set(ga.accountId, []);
							}
							accountIdCounts.get(ga.accountId)!.push(`${p.name} (${ga.server})`);
						});
					});

					const names = accountIdCounts.get(account.accountId) || [];
					if (names.length > 1) {
						const otherNames = names.filter((n) => n !== `${player.name} (${account.server})`);
						reasons.push(
							`Account ID ${account.accountId} duplicate within import: ${otherNames.join(', ')}`
						);
					}
				}
			}
		});

		return reasons.join('; ');
	}

	let hasAnyDuplicates = $derived(hasDuplicateSlugs || hasDuplicateAccountIds);

	const TYPESCRIPT_SCHEMA = `// TypeScript schema for player data
interface PlayerImportData {
  name: string;                    // Required: Player's display name
  slug?: string;                   // Optional: URL slug (auto-generated from name if not provided)
  nationalities?: TCountryCode[];  // Optional: Array of country codes (e.g., ["US", "KR"])
  aliases?: string[];              // Optional: Alternative names for the player
  gameAccounts?: GameAccount[];    // Optional: In-game accounts
  socialAccounts?: SocialAccount[]; // Optional: Social media accounts
  user?: User;                     // Optional: Associated user account
}

interface GameAccount {
  server: 'Strinova' | 'CalabiYau'; // Required: Game server
  accountId: number;                 // Required: Unique account identifier
  currentName: string;               // Required: Current in-game name
  region?: string;                   // Optional: Server region (e.g., "NA", "EU", "JP")
}

interface SocialAccount {
  platformId: string;               // Required: Platform identifier (e.g., "twitter", "youtube")
  accountId: string;                // Required: Account identifier on the platform
  overridingUrl?: string;           // Optional: Custom URL override
}

interface User {
  id: string;                       // Required: User ID
  username: string;                 // Required: Username
  email: string;                    // Required: Email address
  roles: UserRole[];                // Required: User roles (e.g., ["admin", "editor"])
}

type TCountryCode = string;         // ISO country code (e.g., "US", "KR", "JP")
type UserRole = 'admin' | 'editor'; // Valid user roles

// Example usage:
const players: PlayerImportData[] = [
  {
    name: "Player Name",
    slug: "player-slug",
    nationalities: ["US", "KR"],
    aliases: ["Alias1", "Alias2"],
    gameAccounts: [
      {
        server: "Strinova",
        accountId: 1234567,
        currentName: "CurrentGameName",
        region: "NA"
      }
    ],
    socialAccounts: [
      {
        platformId: "twitter",
        accountId: "twitter_handle",
        overridingUrl: "https://twitter.com/handle"
      }
    ]
  }
];`;

	const EXAMPLE_JSON_DATA = `// Supports both JSON and TypeScript formats:

// JSON format:
[
  {
    "name": "Player Name",
    "slug": "player-slug",
    "nationalities": ["US", "KR"],
    "aliases": ["Alias1", "Alias2"],
    "gameAccounts": [
      {
        "server": "Strinova",
        "accountId": 1234567,
        "currentName": "CurrentGameName",
        "region": "NA"
      }
    ],
    "socialAccounts": [
      {
        "platformId": "twitter",
        "accountId": "twitter_handle",
        "overridingUrl": "https://twitter.com/handle"
      }
    ]
  },
  {
    "name": "Another Player",
    "slug": "another-player",
    "nationalities": ["JP"],
    "aliases": ["AP"],
    "gameAccounts": [
      {
        "server": "CalabiYau",
        "accountId": 7654321,
        "currentName": "AnotherGameName",
        "region": "JP"
      }
    ]
  }
]

// TypeScript format (also supported):
[
  {
    name: 'Player Name',
    slug: 'player-slug',
    nationalities: ['US', 'KR'],
    aliases: ['Alias1', 'Alias2'],
    gameAccounts: [
      {
        server: 'Strinova',
        accountId: 1234567,
        currentName: 'CurrentGameName',
        region: 'NA'
      }
    ],
    socialAccounts: [
      {
        platformId: 'twitter',
        accountId: 'twitter_handle',
        overridingUrl: 'https://twitter.com/handle'
      }
    ]
  }
]`;

	async function handleParseJson() {
		try {
			importError = '';
			parsedPlayers = null;

			// Clean the data by removing comments and fixing common issues
			let cleanedData = importJsonData
				.replace(/\/\/.*$/gm, '') // Remove single-line comments
				.replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
				.trim();

			// Convert TypeScript object literal syntax to JSON
			// Replace property names without quotes to quoted property names
			cleanedData = cleanedData
				.replace(/(\w+):/g, '"$1":') // Convert property names to quoted
				.replace(/'/g, '"') // Replace single quotes with double quotes
				.replace(/(\w+):\s*\[/g, '"$1": [') // Handle array properties
				.replace(/(\w+):\s*\{/g, '"$1": {') // Handle object properties
				.replace(/(\w+):\s*(\d+)/g, '"$1": $2') // Handle numeric properties
				.replace(/(\w+):\s*"([^"]*)"/g, '"$1": "$2"') // Handle string properties
				.replace(/(\w+):\s*true/g, '"$1": true') // Handle boolean true
				.replace(/(\w+):\s*false/g, '"$1": false'); // Handle boolean false

			const parsedData = JSON.parse(cleanedData) as PlayerImportData[];

			// Validate the data
			if (!Array.isArray(parsedData)) {
				throw new Error('Data must be an array of players');
			}

			// Validate each player
			for (const player of parsedData) {
				if (!player.name) {
					throw new Error('Each player must have a name');
				}
			}

			parsedPlayers = parsedData;
		} catch (error) {
			importError =
				error instanceof Error
					? error.message
					: 'Invalid format. Please check your data. The import supports both JSON and TypeScript object literal formats.';
			console.error('Parse error:', error);
		}
	}

	async function handleImportJson() {
		if (!parsedPlayers) return;

		try {
			importError = '';
			isImporting = true;

			// Send to server
			const formData = new FormData();
			formData.append('players', JSON.stringify(parsedPlayers));

			const response = await fetch('?/batchCreate', {
				method: 'POST',
				body: formData
			});

			const result = deserialize(await response.text());
			console.log('Import result:', result); // Debug log

			if (result.type === 'failure') {
				importError = (result.data?.error as string) || 'Failed to import players';
			} else if (result.type === 'success') {
				// Close the dialog and show success message
				handleClose();
				const createdCount = result.data?.createdCount || 0;
				console.log('Created count:', createdCount); // Debug log
				onSuccess(`Successfully imported ${createdCount} players`);
			} else {
				importError = 'Unexpected response from server';
			}
		} catch (error) {
			importError =
				error instanceof Error ? error.message : 'Failed to import players. Please try again.';
			console.error('Import error:', error);
		} finally {
			isImporting = false;
		}
	}

	function handleClose() {
		importJsonData = '';
		importError = '';
		parsedPlayers = null;
		showSchema = false;
		onClose();
	}

	function copySchema() {
		navigator.clipboard.writeText(TYPESCRIPT_SCHEMA);
	}

	function goBackToEdit() {
		parsedPlayers = null;
	}

	// Check if a player has any duplicates (slug or account ID)
	function hasAnyDuplicate(player: PlayerImportData): boolean {
		return isDuplicateSlug(player) || isDuplicateAccountId(player);
	}

	// Get all duplicate reasons for a player
	function getAllDuplicateReasons(player: PlayerImportData): string {
		const reasons: string[] = [];

		if (isDuplicateSlug(player)) {
			reasons.push(getDuplicateReason(player));
		}

		if (isDuplicateAccountId(player)) {
			reasons.push(getDuplicateAccountIdReason(player));
		}

		return reasons.join('; ');
	}
</script>

{#if showModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-4xl rounded-lg bg-slate-800 p-6 shadow-xl">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-semibold text-slate-200">Batch Import Players</h3>
				<button
					type="button"
					class="text-slate-400 hover:text-slate-200"
					onclick={handleClose}
					aria-label={m.close()}
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<div class="mb-4">
				<div class="mb-2 flex items-center justify-between">
					<label class="block text-sm font-medium text-slate-300" for="jsonData">
						Paste JSON data in PlayerImportData format:
					</label>
					<button
						type="button"
						class="text-sm text-yellow-400 underline hover:text-yellow-300"
						onclick={() => (showSchema = !showSchema)}
					>
						{showSchema ? 'Hide' : 'Show'} TypeScript Schema
					</button>
				</div>

				{#if showSchema}
					<div class="mb-4 rounded-md border border-slate-600 bg-slate-900 p-4">
						<div class="mb-2 flex items-center justify-between">
							<h4 class="text-sm font-medium text-slate-200">
								TypeScript Schema for LLM Conversion
							</h4>
							<button
								type="button"
								class="text-xs text-yellow-400 underline hover:text-yellow-300"
								onclick={copySchema}
							>
								Copy Schema
							</button>
						</div>
						<div
							class="max-h-100 overflow-x-auto overflow-y-auto text-xs [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:bg-slate-800"
						>
							<Highlight language={typescript} code={TYPESCRIPT_SCHEMA} />
						</div>
					</div>
				{/if}

				<textarea
					id="jsonData"
					bind:value={importJsonData}
					placeholder={`Paste your JSON data here. Example: \n${EXAMPLE_JSON_DATA}`}
					class="h-64 w-full rounded-md border border-slate-700 bg-slate-900 p-3 font-mono text-sm text-slate-200 focus:ring-2 focus:ring-yellow-500 focus:outline-none [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:bg-slate-800"
				></textarea>
			</div>

			{#if importError}
				<div class="mb-4 rounded-md bg-red-900/50 p-3 text-sm text-red-200">
					{importError}
				</div>
			{/if}

			{#if parsedPlayers}
				<div class="mb-4 rounded-md border border-slate-600 bg-slate-900 p-4">
					<h4 class="mb-3 text-sm font-medium text-slate-200">Parsed Players</h4>

					<div
						class="max-h-128 overflow-x-auto overflow-y-auto rounded-md border border-slate-700 bg-slate-900 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:bg-slate-800"
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
								{#each parsedPlayers as player}
									<tr class="border-b-1 border-gray-500 bg-gray-800 px-4 py-2 shadow-2xl">
										<td class="px-4 py-1 text-white">
											{player.name}
										</td>
										<td
											class="max-w-32 truncate px-4 py-1 text-white {isDuplicateSlug(player)
												? 'bg-red-900/30'
												: ''}"
											title={isDuplicateSlug(player) ? getDuplicateReason(player) : ''}
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
											class="px-4 py-1 text-gray-300 {isDuplicateAccountId(player)
												? 'bg-red-900/30'
												: ''}"
											title={isDuplicateAccountId(player)
												? getDuplicateAccountIdReason(player)
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
			{/if}

			{#if parsedPlayers && hasDuplicateSlugs}
				<div class="mb-4 rounded-md border border-red-700 bg-red-900/50 p-3">
					<div class="flex items-start gap-2">
						<div class="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-red-500"></div>
						<div class="flex-1">
							<p class="mb-1 text-sm font-medium text-red-200">Duplicate slugs detected</p>
							<p class="text-xs text-red-300">
								Please resolve the duplicate slugs highlighted in red above before importing. Each
								player must have a unique slug (either provided explicitly or auto-generated from
								name).
							</p>
						</div>
					</div>
				</div>
			{/if}

			{#if parsedPlayers && hasDuplicateAccountIds}
				<div class="mb-4 rounded-md border border-red-700 bg-red-900/50 p-3">
					<div class="flex items-start gap-2">
						<div class="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-red-500"></div>
						<div class="flex-1">
							<p class="mb-1 text-sm font-medium text-red-200">Duplicate account IDs detected</p>
							<p class="text-xs text-red-300">
								Please resolve the duplicate account IDs highlighted in red above before importing.
								Each player must have a unique account ID.
							</p>
						</div>
					</div>
				</div>
			{/if}

			{#if parsedPlayers && hasAnyDuplicates}
				<div class="mb-4 rounded-md border border-red-700 bg-red-900/50 p-3">
					<div class="flex items-start gap-2">
						<div class="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-red-500"></div>
						<div class="flex-1">
							<p class="mb-1 text-sm font-medium text-red-200">Duplicate issues detected</p>
							<p class="text-xs text-red-300">
								Please resolve the duplicate issues highlighted in red above before importing.
							</p>
						</div>
					</div>
				</div>
			{/if}

			<div class="flex justify-end gap-3">
				{#if parsedPlayers}
					<button
						type="button"
						class="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
						onclick={goBackToEdit}
					>
						Back to Edit
					</button>
					<button
						type="button"
						class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600 disabled:opacity-50"
						onclick={handleImportJson}
						disabled={isImporting || hasAnyDuplicates}
					>
						{#if isImporting}
							Importing...
						{:else if hasAnyDuplicates}
							Fix Duplicates First
						{:else}
							Import Players
						{/if}
					</button>
				{:else}
					<button
						type="button"
						class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600 disabled:opacity-50"
						onclick={handleParseJson}
						disabled={isImporting}
					>
						{isImporting ? 'Parsing...' : 'Parse JSON'}
					</button>
				{/if}
				<button
					type="button"
					class="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
					onclick={handleClose}
				>
					{m.close()}
				</button>
			</div>
		</div>
	</div>
{/if}
