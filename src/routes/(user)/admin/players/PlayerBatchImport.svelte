<script module lang="ts">
	export interface PlayerImportData {
		name: string;
		slug?: string;
		nationalities?: TCountryCode[];
		aliases?: string[];
		gameAccounts?: {
			server: GameAccountServer;
			accountId: number;
			currentName: string;
			region?: GameAccountRegion;
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
</script>

<script lang="ts">
	import type { TCountryCode } from 'countries-list';
	import Highlight from 'svelte-highlight';
	import typescript from 'svelte-highlight/languages/typescript';
	import '$lib/highlight.css';
	import { formatSlug } from '$lib/utils/strings';
	import { parseData } from '$lib/utils/json';
	import ParsedPlayersTable from './ParsedPlayersTable.svelte';

	import { deserialize } from '$app/forms';
	import { m } from '$lib/paraglide/messages';
	import type { GameAccountRegion, GameAccountServer } from '$lib/data/players';

	let {
		showModal,
		onClose,
		onSuccess,
		existingPlayers
	}: {
		showModal: boolean;
		onClose: () => void;
		onSuccess: (message: string) => void;
		existingPlayers: Array<{
			id: string;
			name: string;
			slug: string;
			gameAccounts?: Array<{ accountId: number; server: string }>;
		}>;
	} = $props();

	let importJsonData = $state('');
	let importError = $state('');
	let isImporting = $state(false);
	let showSchema = $state(false);

	type ParsedPlayers =
		| {
				type: 'success';
				data: PlayerImportData[];
		  }
		| {
				type: 'error';
				error: string;
		  }
		| null;
	let parsedPlayers: ParsedPlayers = $derived.by(() => {
		// Only parse if there's actual data
		if (!importJsonData.trim()) {
			return null;
		}

		try {
			// Use the utility function to parse and validate
			const result = parseData<PlayerImportData>(
				importJsonData,
				(parsedData): parsedData is PlayerImportData[] => {
					// Validate the data
					if (!Array.isArray(parsedData)) {
						return false;
					}

					// Validate each player
					for (const player of parsedData) {
						if (!player.name) {
							return false;
						}
					}
					return true;
				}
			);

			if (result?.type === 'success') {
				return result;
			} else if (result?.type === 'error') {
				return result;
			}

			return {
				type: 'error',
				error: 'Data validation failed'
			};
		} catch (error) {
			console.error('Parse error:', error);

			return {
				type: 'error',
				error:
					error instanceof Error
						? error.message
						: 'Invalid format. Please check your data. The import supports both JSON and TypeScript object literal formats.'
			};
		}
	});

	// Get all existing slugs for comparison
	let existingSlugs = $derived(
		new Set(
			existingPlayers.map((player: { id: string; name: string; slug: string }) => player.slug)
		)
	);

	// Check for duplicate slugs in parsed data (including against existing players)
	let duplicateSlugs = $derived.by(() => {
		if (!parsedPlayers || parsedPlayers.type !== 'success') return [];

		const slugCounts = new Map<string, string[]>();

		// Count slugs within the parsed data
		parsedPlayers.data.forEach((player) => {
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
		parsedPlayers.data.forEach((player) => {
			const slug = player.slug || formatSlug(player.name);
			if (existingSlugs.has(slug)) {
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
	let duplicateSlugValues = $derived.by(() => {
		if (!parsedPlayers || parsedPlayers.type !== 'success') return new Set<string>();

		const slugCounts = new Map<string, number>();

		// Count slugs within parsed data
		parsedPlayers.data.forEach((player) => {
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
		parsedPlayers.data.forEach((player: PlayerImportData) => {
			const slug = player.slug || formatSlug(player.name);
			if (existingSlugs.has(slug)) {
				duplicates.add(slug);
			}
		});

		return duplicates;
	});

	// Check if a player has a duplicate slug (including against existing players)
	function isDuplicateSlug(player: PlayerImportData): boolean {
		const slug = player.slug || formatSlug(player.name);
		return duplicateSlugValues.has(slug);
	}

	// Get the reason for duplicate (internal or existing conflict)
	function getDuplicateReason(player: PlayerImportData): string {
		if (!parsedPlayers || parsedPlayers.type !== 'success') return '';
		const slug = player.slug || formatSlug(player.name);

		// Check if it conflicts with existing players
		if (existingSlugs.has(slug)) {
			const existingPlayer = existingPlayers.find(
				(p: { id: string; name: string; slug: string }) => p.slug === slug
			);
			return `Conflicts with existing player: ${existingPlayer?.name || 'Unknown'}`;
		}

		// Check if it's duplicate within parsed data
		const slugCounts = new Map<string, string[]>();
		parsedPlayers.data.forEach((p: PlayerImportData) => {
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
	let existingAccountIds = $derived.by(() => {
		const accountIds = new Set<string>();
		existingPlayers.forEach(
			(player: {
				id: string;
				name: string;
				slug: string;
				gameAccounts?: Array<{ accountId: number; server: string }>;
			}) => {
				player.gameAccounts?.forEach((account: { accountId: number; server: string }) => {
					accountIds.add(`${account.accountId}-${account.server}`);
				});
			}
		);
		return accountIds;
	});

	// Check for duplicate account IDs in parsed data (including against existing players)
	let duplicateAccountIds = $derived.by(() => {
		if (!parsedPlayers || parsedPlayers.type !== 'success') return [];

		const accountIdCounts = new Map<string, string[]>();
		// Count account IDs within the parsed data
		parsedPlayers.data.forEach((player) => {
			player.gameAccounts?.forEach((account) => {
				const compositeKey = `${account.accountId}-${account.server}`;
				if (!accountIdCounts.has(compositeKey)) {
					accountIdCounts.set(compositeKey, []);
				}
				accountIdCounts.get(compositeKey)!.push(`${player.name} (${account.server})`);
			});
		});

		const duplicates: string[] = [];

		// Check for duplicates within parsed data
		accountIdCounts.forEach((names, compositeKey) => {
			if (names.length > 1) {
				const [accountId, server] = compositeKey.split('-');
				duplicates.push(`Account ID ${accountId} on ${server} (${names.join(', ')})`);
			}
		});

		// Check for conflicts with existing players
		parsedPlayers.data.forEach((player) => {
			player.gameAccounts?.forEach((account) => {
				const compositeKey = `${account.accountId}-${account.server}`; // Use composite key
				if (existingAccountIds.has(compositeKey)) {
					const existingPlayer = existingPlayers.find(
						(p: {
							id: string;
							name: string;
							slug: string;
							gameAccounts?: Array<{ accountId: number; server: string }>;
						}) =>
							p.gameAccounts?.some(
								(ga: { accountId: number; server: string }) =>
									`${ga.accountId}-${ga.server}` === compositeKey
							)
					);
					duplicates.push(
						`Account ID ${account.accountId} on ${account.server} (${player.name} conflicts with existing: ${existingPlayer?.name || 'Unknown'})`
					);
				}
			});
		});

		return duplicates;
	});

	let hasDuplicateAccountIds = $derived(duplicateAccountIds.length > 0);

	// Get duplicate account ID values for highlighting
	let duplicateAccountIdValues = $derived.by(() => {
		if (!parsedPlayers || parsedPlayers.type !== 'success') return new Set<string>(); // Changed from Set<number> to Set<string>

		const accountIdCounts = new Map<string, number>(); // Changed from Map<number, number> to Map<string, number>

		// Count account IDs within parsed data
		parsedPlayers.data.forEach((player) => {
			player.gameAccounts?.forEach((account) => {
				const compositeKey = `${account.accountId}-${account.server}`; // Use composite key
				accountIdCounts.set(compositeKey, (accountIdCounts.get(compositeKey) || 0) + 1);
			});
		});

		const duplicates = new Set<string>(); // Changed from Set<number> to Set<string>

		// Check for duplicates within parsed data
		accountIdCounts.forEach((count, compositeKey) => {
			if (count > 1) {
				duplicates.add(compositeKey);
			}
		});

		// Check for conflicts with existing players
		parsedPlayers.data.forEach((player) => {
			player.gameAccounts?.forEach((account) => {
				const compositeKey = `${account.accountId}-${account.server}`; // Use composite key
				if (existingAccountIds.has(compositeKey)) {
					duplicates.add(compositeKey);
				}
			});
		});

		return duplicates;
	});

	// Check if a player has a duplicate account ID
	function isDuplicateAccountId(player: PlayerImportData): boolean {
		if (!player.gameAccounts) return false;
		return player.gameAccounts.some((account) => {
			const compositeKey = `${account.accountId}-${account.server}`; // Use composite key
			return duplicateAccountIdValues.has(compositeKey);
		});
	}

	// Get the reason for account ID duplicate
	function getDuplicateAccountIdReason(player: PlayerImportData): string {
		if (!player.gameAccounts) return '';

		const reasons: string[] = [];

		player.gameAccounts.forEach((account) => {
			const compositeKey = `${account.accountId}-${account.server}`;
			if (duplicateAccountIdValues.has(compositeKey)) {
				// Check if it conflicts with existing players
				if (existingAccountIds.has(compositeKey)) {
					const existingPlayer = existingPlayers.find(
						(p: {
							id: string;
							name: string;
							slug: string;
							gameAccounts?: Array<{ accountId: number; server: string }>;
						}) =>
							p.gameAccounts?.some(
								(ga: { accountId: number; server: string }) =>
									`${ga.accountId}-${ga.server}` === compositeKey
							)
					);
					reasons.push(
						`Account ID ${account.accountId} on ${account.server} conflicts with existing player: ${existingPlayer?.name || 'Unknown'}`
					);
				} else {
					// Check if it's duplicate within parsed data
					const accountIdCounts = new Map<string, string[]>();
					if (!parsedPlayers || parsedPlayers.type !== 'success') return '';
					parsedPlayers.data.forEach((p: PlayerImportData) => {
						p.gameAccounts?.forEach((ga) => {
							const pCompositeKey = `${ga.accountId}-${ga.server}`;
							if (!accountIdCounts.has(pCompositeKey)) {
								accountIdCounts.set(pCompositeKey, []);
							}
							accountIdCounts.get(pCompositeKey)!.push(`${p.name} (${ga.server})`);
						});
					});

					const names = accountIdCounts.get(compositeKey) || [];
					if (names.length > 1) {
						const otherNames = names.filter((n) => n !== `${player.name} (${account.server})`);
						reasons.push(
							`Account ID ${account.accountId} on ${account.server} duplicate within import: ${otherNames.join(', ')}`
						);
					}
				}
			}
		});

		return reasons.join('; ');
	}

	// Helper function to get existing player link for slug conflicts
	function getExistingPlayerLinkForSlug(
		player: PlayerImportData
	): { id: string; name: string } | null {
		const slug = player.slug || formatSlug(player.name);
		if (existingSlugs.has(slug)) {
			const existingPlayer = existingPlayers.find(
				(p: { id: string; name: string; slug: string }) => p.slug === slug
			);
			return existingPlayer ? { id: existingPlayer.id, name: existingPlayer.name } : null;
		}
		return null;
	}

	// Helper function to get existing player link for account ID conflicts
	function getExistingPlayerLinkForAccountId(
		player: PlayerImportData
	): Array<{ id: string; name: string; accountId: number; server: string }> {
		if (!player.gameAccounts) return [];

		const conflicts: Array<{ id: string; name: string; accountId: number; server: string }> = [];

		player.gameAccounts.forEach((account) => {
			const compositeKey = `${account.accountId}-${account.server}`;
			if (existingAccountIds.has(compositeKey)) {
				const existingPlayer = existingPlayers.find(
					(p: {
						id: string;
						name: string;
						slug: string;
						gameAccounts?: Array<{ accountId: number; server: string }>;
					}) =>
						p.gameAccounts?.some(
							(ga: { accountId: number; server: string }) =>
								`${ga.accountId}-${ga.server}` === compositeKey
						)
				);
				if (existingPlayer) {
					conflicts.push({
						id: existingPlayer.id,
						name: existingPlayer.name,
						accountId: account.accountId,
						server: account.server
					});
				}
			}
		});

		return conflicts;
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
  server: 'Strinova' | 'CalabiYau'; // Required: Game server, 'CalabiYau' for CN server, 'Strinova' for global server (NA, EU, APAC)
  accountId: number;                 // Required: Unique account identifier
  currentName: string;               // Required: Current in-game name
  region?: 'APAC' | 'NA' | 'EU' | 'CN'; // Optional: Server region (e.g., "NA", "EU", "JP")
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

	async function handleImportJson() {
		if (!parsedPlayers || parsedPlayers.type !== 'success') return;

		try {
			importError = '';
			isImporting = true;

			// Send to server
			const formData = new FormData();
			formData.append('players', JSON.stringify(parsedPlayers.data));

			const response = await fetch('?/batchCreate', {
				method: 'POST',
				body: formData
			});

			const result = deserialize(await response.text());
			console.info('[Admin][Players][BatchImport] Import result:', result); // Debug log

			if (result.type === 'failure') {
				importError = (result.data?.error as string) || 'Failed to import players';
			} else if (result.type === 'success') {
				// Close the dialog and show success message
				handleClose();
				const createdCount = result.data?.createdCount || 0;
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
</script>

{#if showModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-4xl rounded-lg bg-slate-800 p-6 shadow-xl">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-semibold text-slate-200">
					{m['editing.batch.batch_import_players']()}
				</h3>
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
						{m['editing.batch.paste_json_label_players']()}
					</label>
					<button
						type="button"
						class="text-sm text-yellow-400 underline hover:text-yellow-300"
						onclick={() => (showSchema = !showSchema)}
					>
						{showSchema ? m['editing.batch.hide_schema']() : m['editing.batch.show_schema']()}
					</button>
				</div>

				{#if showSchema}
					<div class="mb-4 rounded-md border border-slate-600 bg-slate-900 p-4">
						<div class="mb-2 flex items-center justify-between">
							<h4 class="text-sm font-medium text-slate-200">
								{m['editing.batch.schema_title']()}
							</h4>
							<button
								type="button"
								class="text-xs text-yellow-400 underline hover:text-yellow-300"
								onclick={copySchema}
							>
								{m['editing.batch.copy_schema']()}
							</button>
						</div>
						<div class="styled-scroll max-h-100 overflow-x-auto overflow-y-auto text-xs">
							<Highlight language={typescript} code={TYPESCRIPT_SCHEMA} />
						</div>
					</div>
				{/if}

				<textarea
					id="jsonData"
					bind:value={importJsonData}
					placeholder={`Paste your JSON data here. Example: \n${EXAMPLE_JSON_DATA}`}
					class="styled-scroll h-64 w-full rounded-md border border-slate-700 bg-slate-900 p-3 font-mono text-sm text-slate-200 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
				></textarea>

				{#if importJsonData.trim() && !parsedPlayers}
					<div class="mt-2 flex items-center gap-2 text-sm text-yellow-400">
						<div
							class="h-4 w-4 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent"
						></div>
						<span>{m['editing.batch.parsing_data']()}</span>
					</div>
				{/if}
			</div>

			{#if importError}
				<div class="mb-4 rounded-md bg-red-900/50 p-3 text-sm text-red-200">
					{importError}
				</div>
			{/if}

			{#if parsedPlayers && parsedPlayers.type === 'error'}
				<div class="mb-4 rounded-md bg-red-900/50 p-3 text-sm text-red-200">
					<strong>{m['editing.batch.parsing_error']()}</strong>
					{parsedPlayers.error}
				</div>
			{/if}

			{#if parsedPlayers && parsedPlayers.type === 'success'}
				<div class="mb-4 rounded-md border border-slate-600 bg-slate-900 p-4">
					<h4 class="mb-3 text-sm font-medium text-slate-200">
						{m['editing.batch.parsed_players']()}
					</h4>
					<ParsedPlayersTable
						players={parsedPlayers.data}
						showDuplicateHighlighting={true}
						duplicateCheckers={{
							isDuplicateSlug,
							isDuplicateAccountId,
							getDuplicateReason,
							getDuplicateAccountIdReason,
							getExistingPlayerLinkForSlug,
							getExistingPlayerLinkForAccountId
						}}
						containerClass="max-h-128"
					/>
				</div>
			{/if}

			{#if parsedPlayers && (hasDuplicateSlugs || hasDuplicateAccountIds)}
				<div class="mb-4 rounded-md border border-red-700 bg-red-900/50 p-3">
					<div class="flex items-start gap-2">
						<div class="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-red-500"></div>
						<div class="flex-1">
							<p class="mb-1 text-sm font-medium text-red-200">
								{m['editing.batch.duplicate_issues_detected']()}
							</p>
							<p class="text-xs text-red-300">
								{m['editing.batch.resolve_duplicates_message']()}
							</p>

							{#if parsedPlayers && parsedPlayers.type === 'success'}
								{@const duplicatePlayers = parsedPlayers.data.filter(
									(p) => isDuplicateSlug(p) || isDuplicateAccountId(p)
								)}
								{#if duplicatePlayers.length > 0}
									<div class="mt-2 rounded border border-red-600 bg-red-900/30 p-2">
										<p class="mb-1 text-xs font-medium text-red-200">
											{m['editing.batch.duplicate_issues']()}
										</p>
										<div class="styled-scroll max-h-32 overflow-y-auto">
											<ul class="space-y-1 text-xs text-red-300">
												{#each duplicatePlayers as player}
													{@const existingPlayer = getExistingPlayerLinkForSlug(player)}
													{#if existingPlayer}
														<li class="flex items-center gap-2">
															{player.name} (conflicts with existing: {existingPlayer.name}
															<a
																href="/admin/players/{existingPlayer.id}"
																target="_blank"
																class="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
																aria-label="View existing player"
															>
																<svg
																	class="h-3 w-3"
																	fill="none"
																	stroke="currentColor"
																	viewBox="0 0 24 24"
																>
																	<path
																		stroke-linecap="round"
																		stroke-linejoin="round"
																		stroke-width="2"
																		d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
																	/>
																</svg>
															</a>
															)
														</li>
													{/if}
													{@const existingPlayers = getExistingPlayerLinkForAccountId(player)}
													{#if existingPlayers.length > 0}
														{#each existingPlayers as existingPlayer}
															<li class="flex items-center gap-2">
																{player.name} (conflicts with existing: {existingPlayer.name}
																<a
																	href="/admin/players/{existingPlayer.id}"
																	target="_blank"
																	class="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
																	aria-label="View existing player"
																>
																	<svg
																		class="h-3 w-3"
																		fill="none"
																		stroke="currentColor"
																		viewBox="0 0 24 24"
																	>
																		<path
																			stroke-linecap="round"
																			stroke-linejoin="round"
																			stroke-width="2"
																			d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
																		/>
																	</svg>
																</a>
																)
															</li>
														{/each}
													{/if}
												{/each}
											</ul>
										</div>
									</div>
								{/if}
							{/if}
						</div>
					</div>
				</div>
			{/if}

			<div class="flex justify-end gap-3">
				{#if parsedPlayers && parsedPlayers.type === 'success'}
					<button
						type="button"
						class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600 disabled:opacity-50"
						onclick={handleImportJson}
						disabled={isImporting || hasAnyDuplicates}
					>
						{#if isImporting}
							{m['editing.batch.importing']()}
						{:else if hasAnyDuplicates}
							{m['editing.batch.fix_duplicates_first']()}
						{:else}
							{m['editing.batch.import_players']()}
						{/if}
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
