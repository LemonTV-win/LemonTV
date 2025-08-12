<script lang="ts">
	import type { TCountryCode } from 'countries-list';
	import Highlight from 'svelte-highlight';
	import typescript from 'svelte-highlight/languages/typescript';
	import '$lib/highlight.css';
	import { formatSlug } from '$lib/utils/strings';
	import { parseData } from '$lib/utils/json';
	import NationalityFlag from '$lib/components/NationalityFlag.svelte';

	import { deserialize } from '$app/forms';
	import { m } from '$lib/paraglide/messages';
	import type { PlayerImportData } from '../players/PlayerBatchImport.svelte';

	interface TeamImportData {
		name: string;
		slug?: string;
		abbr?: string;
		region?: string;
		logo?: string;
		aliases?: string[];
		players?: {
			player: PlayerImportData;
			teamPlayer: {
				role: 'active' | 'substitute' | 'former' | 'coach' | 'manager' | 'owner';
				startedOn?: string; // format: YYYY-MM-DD
				endedOn?: string; // format: YYYY-MM-DD
				note?: string;
			};
		}[];
	}

	let {
		showModal,
		onClose,
		onSuccess,
		existingTeams,
		existingPlayers
	}: {
		showModal: boolean;
		onClose: () => void;
		onSuccess: (message: string) => void;
		existingTeams: Array<{
			id: string;
			name: string;
			slug: string;
			abbr: string | null;
		}>;
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

	type ParsedTeams =
		| {
				type: 'success';
				data: TeamImportData[];
		  }
		| {
				type: 'error';
				error: string;
		  }
		| null;
	let parsedTeams: ParsedTeams = $derived.by(() => {
		// Only parse if there's actual data
		if (!importJsonData.trim()) {
			return null;
		}

		try {
			// Use the utility function to parse and validate
			const result = parseData<TeamImportData>(
				importJsonData,
				(parsedData): parsedData is TeamImportData[] => {
					// Validate the data
					if (!Array.isArray(parsedData)) {
						return false;
					}

					// Validate each team
					for (const team of parsedData) {
						if (!team.name) {
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
		new Set(existingTeams.map((team: { id: string; name: string; slug: string }) => team.slug))
	);

	// Check for duplicate slugs in parsed data (including against existing teams)
	let duplicateSlugs = $derived.by(() => {
		if (!parsedTeams || parsedTeams.type !== 'success') return [];

		const slugCounts = new Map<string, string[]>();

		// Count slugs within the parsed data
		parsedTeams.data.forEach((team, index) => {
			const slug = team.slug || formatSlug(team.name);
			if (!slugCounts.has(slug)) {
				slugCounts.set(slug, []);
			}
			slugCounts.get(slug)!.push(team.name);
		});

		const duplicates: string[] = [];

		// Check for duplicates within parsed data
		slugCounts.forEach((names, slug) => {
			if (names.length > 1) {
				duplicates.push(`${slug} (${names.join(', ')})`);
			}
		});

		// Check for conflicts with existing teams
		parsedTeams.data.forEach((team) => {
			const slug = team.slug || formatSlug(team.name);
			if (existingSlugs.has(slug)) {
				const existingTeam = existingTeams.find(
					(t: { id: string; name: string; slug: string }) => t.slug === slug
				);
				duplicates.push(`${slug} (conflicts with existing: ${existingTeam?.name || 'Unknown'})`);
			}
		});

		return duplicates;
	});

	let hasDuplicateSlugs = $derived(duplicateSlugs.length > 0);

	// Get duplicate slug values for highlighting (including existing teams)
	let duplicateSlugValues = $derived.by(() => {
		if (!parsedTeams || parsedTeams.type !== 'success') return new Set<string>();

		const slugCounts = new Map<string, number>();

		// Count slugs within parsed data
		parsedTeams.data.forEach((team) => {
			const slug = team.slug || formatSlug(team.name);
			slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1);
		});

		const duplicates = new Set<string>();

		// Check for duplicates within parsed data
		slugCounts.forEach((count, slug) => {
			if (count > 1) {
				duplicates.add(slug);
			}
		});

		// Check for conflicts with existing teams
		parsedTeams.data.forEach((team: TeamImportData) => {
			const slug = team.slug || formatSlug(team.name);
			if (existingSlugs.has(slug)) {
				duplicates.add(slug);
			}
		});

		return duplicates;
	});

	// Check if a team has a duplicate slug (including against existing teams)
	function isDuplicateSlug(team: TeamImportData): boolean {
		const slug = team.slug || formatSlug(team.name);
		return duplicateSlugValues.has(slug);
	}

	// Get the reason for duplicate (internal or existing conflict)
	function getDuplicateReason(team: TeamImportData): string {
		if (!parsedTeams || parsedTeams.type !== 'success') return '';
		const slug = team.slug || formatSlug(team.name);

		// Check if it conflicts with existing teams
		if (existingSlugs.has(slug)) {
			const existingTeam = existingTeams.find(
				(t: { id: string; name: string; slug: string }) => t.slug === slug
			);
			return `Conflicts with existing team: ${existingTeam?.name || 'Unknown'}`;
		}

		// Check if it's duplicate within parsed data
		const slugCounts = new Map<string, string[]>();
		parsedTeams.data.forEach((t: TeamImportData) => {
			const tSlug = t.slug || formatSlug(t.name);
			if (!slugCounts.has(tSlug)) {
				slugCounts.set(tSlug, []);
			}
			slugCounts.get(tSlug)!.push(t.name);
		});

		const names = slugCounts.get(slug) || [];
		if (names.length > 1) {
			return `Duplicate within import: ${names.filter((n) => n !== team.name).join(', ')}`;
		}

		return 'Unknown duplicate';
	}

	// Get all players from parsed teams that need to be created
	let newPlayersRequired = $derived.by(() => {
		if (!parsedTeams || parsedTeams.type !== 'success') return [];

		const newPlayers: PlayerImportData[] = [];
		const existingPlayerIds = new Set(existingPlayers.map((p) => p.id));
		const existingPlayerNames = new Set(existingPlayers.map((p) => p.name));
		const existingAccountIds = new Set(
			existingPlayers.flatMap((p) => p.gameAccounts?.map((ga) => ga.accountId) || [])
		);

		parsedTeams.data.forEach((team) => {
			team.players?.forEach(({ player }) => {
				// Check if player already exists by ID, name, or account ID
				const hasExistingId = player.user?.id && existingPlayerIds.has(player.user.id);
				const hasExistingName = existingPlayerNames.has(player.name);
				const hasExistingAccountId = player.gameAccounts?.some((ga) =>
					existingAccountIds.has(ga.accountId)
				);

				if (!hasExistingId && !hasExistingName && !hasExistingAccountId) {
					// This is a new player that needs to be created
					newPlayers.push(player);
				}
			});
		});

		// Remove duplicates based on name
		const uniquePlayers = new Map<string, PlayerImportData>();
		newPlayers.forEach((player) => {
			if (!uniquePlayers.has(player.name)) {
				uniquePlayers.set(player.name, player);
			}
		});

		return Array.from(uniquePlayers.values());
	});

	let hasNewPlayersRequired = $derived(newPlayersRequired.length > 0);

	// Check for duplicate slugs in new players
	let newPlayerDuplicateSlugs = $derived.by(() => {
		if (newPlayersRequired.length === 0) return [];

		const slugCounts = new Map<string, string[]>();
		const existingSlugs = new Set(existingPlayers.map((p) => p.slug));

		newPlayersRequired.forEach((player) => {
			const slug = player.slug || formatSlug(player.name);
			if (!slugCounts.has(slug)) {
				slugCounts.set(slug, []);
			}
			slugCounts.get(slug)!.push(player.name);
		});

		const duplicates: string[] = [];

		// Check for duplicates within new players
		slugCounts.forEach((names, slug) => {
			if (names.length > 1) {
				duplicates.push(`${slug} (${names.join(', ')})`);
			}
		});

		// Check for conflicts with existing players
		newPlayersRequired.forEach((player) => {
			const slug = player.slug || formatSlug(player.name);
			if (existingSlugs.has(slug)) {
				const existingPlayer = existingPlayers.find((p) => p.slug === slug);
				duplicates.push(`${slug} (conflicts with existing: ${existingPlayer?.name || 'Unknown'})`);
			}
		});

		return duplicates;
	});

	// Check for duplicate account IDs in new players
	let newPlayerDuplicateAccountIds = $derived.by(() => {
		if (newPlayersRequired.length === 0) return [];

		const accountIdCounts = new Map<number, string[]>();
		const existingAccountIds = new Set(
			existingPlayers.flatMap((p) => p.gameAccounts?.map((ga) => ga.accountId) || [])
		);

		newPlayersRequired.forEach((player) => {
			player.gameAccounts?.forEach((account) => {
				if (!accountIdCounts.has(account.accountId)) {
					accountIdCounts.set(account.accountId, []);
				}
				accountIdCounts.get(account.accountId)!.push(`${player.name} (${account.server})`);
			});
		});

		const duplicates: string[] = [];

		// Check for duplicates within new players
		accountIdCounts.forEach((names, accountId) => {
			if (names.length > 1) {
				duplicates.push(`Account ID ${accountId} (${names.join(', ')})`);
			}
		});

		// Check for conflicts with existing players
		newPlayersRequired.forEach((player) => {
			player.gameAccounts?.forEach((account) => {
				if (existingAccountIds.has(account.accountId)) {
					const existingPlayer = existingPlayers.find((p) =>
						p.gameAccounts?.some((ga) => ga.accountId === account.accountId)
					);
					duplicates.push(
						`Account ID ${account.accountId} (${player.name} conflicts with existing: ${existingPlayer?.name || 'Unknown'})`
					);
				}
			});
		});

		return duplicates;
	});

	let hasNewPlayerDuplicates = $derived(
		newPlayerDuplicateSlugs.length > 0 || newPlayerDuplicateAccountIds.length > 0
	);

	// Check if any new player has duplicates
	function hasNewPlayerDuplicate(player: PlayerImportData): boolean {
		const slug = player.slug || formatSlug(player.name);
		const hasDuplicateSlug = newPlayerDuplicateSlugs.some((dup) => dup.includes(slug));
		const hasDuplicateAccountId =
			player.gameAccounts?.some((account) =>
				newPlayerDuplicateAccountIds.some((dup) => dup.includes(`Account ID ${account.accountId}`))
			) || false;
		return hasDuplicateSlug || hasDuplicateAccountId;
	}

	// Get duplicate reason for a new player
	function getNewPlayerDuplicateReason(player: PlayerImportData): string {
		const reasons: string[] = [];
		const slug = player.slug || formatSlug(player.name);

		// Check slug duplicates
		const slugDuplicate = newPlayerDuplicateSlugs.find((dup) => dup.includes(slug));
		if (slugDuplicate) {
			reasons.push(`Slug: ${slugDuplicate}`);
		}

		// Check account ID duplicates
		player.gameAccounts?.forEach((account) => {
			const accountDuplicate = newPlayerDuplicateAccountIds.find((dup) =>
				dup.includes(`Account ID ${account.accountId}`)
			);
			if (accountDuplicate) {
				reasons.push(`Account ID: ${accountDuplicate}`);
			}
		});

		return reasons.join('; ');
	}

	// Check if a team has any duplicates (slug)
	function hasAnyDuplicate(team: TeamImportData): boolean {
		return isDuplicateSlug(team);
	}

	// Get all duplicate reasons for a team
	function getAllDuplicateReasons(team: TeamImportData): string {
		const reasons: string[] = [];

		if (isDuplicateSlug(team)) {
			reasons.push(getDuplicateReason(team));
		}

		return reasons.join('; ');
	}

	let hasAnyDuplicates = $derived(hasDuplicateSlugs || hasNewPlayerDuplicates);

	const TYPESCRIPT_SCHEMA = `// TypeScript schema for team data
interface TeamImportData {
  name: string;                    // Required: Team's display name
  slug?: string;                   // Optional: URL slug (auto-generated from name if not provided)
  abbr?: string;                   // Optional: Team abbreviation (e.g., "TSM", "C9")
  region?: string;                 // Optional: Team region (e.g., "NA", "EU", "KR")
  logo?: string;                   // Optional: Logo URL or path
  aliases?: string[];              // Optional: Alternative names for the team
  players?: TeamPlayer[];          // Optional: Team players and their roles
}

interface TeamPlayer {
  player: PlayerImportData;        // Required: Full player data (will be created if new)
  teamPlayer: {
    role: 'active' | 'substitute' | 'former' | 'coach' | 'manager' | 'owner'; // Required: Player role
    startedOn?: string;            // Optional: Start date (format: YYYY-MM-DD)
    endedOn?: string;              // Optional: End date (format: YYYY-MM-DD)
    note?: string;                 // Optional: Additional notes about the player
  };
}

// Example usage:
const teams: TeamImportData[] = [
  {
    name: "Team SoloMid",
    slug: "tsm",
    abbr: "TSM",
    region: "NA",
    logo: "https://example.com/tsm-logo.png",
    aliases: ["TSM", "Team SoloMid"],
    players: [
      {
        player: {
          name: "Player Name",
          slug: "player-slug",
          nationalities: ["US"],
          gameAccounts: [
            {
              server: "Strinova",
              accountId: 1234567,
              currentName: "CurrentGameName"
            }
          ]
        },
        teamPlayer: {
          role: "active",
          startedOn: "2023-01-01",
          note: "Starting mid laner"
        }
      }
    ]
  }
];`;

	const EXAMPLE_JSON_DATA = `// Supports both JSON and TypeScript formats:

// JSON format:
[
  {
    "name": "Team SoloMid",
    "slug": "tsm",
    "abbr": "TSM",
    "region": "NA",
    "logo": "https://example.com/tsm-logo.png",
    "aliases": ["TSM", "Team SoloMid"],
    "players": [
      {
        "player": {
          "name": "Player Name",
          "slug": "player-slug",
          "nationalities": ["US"],
          "gameAccounts": [
            {
              "server": "Strinova",
              "accountId": 1234567,
              "currentName": "CurrentGameName"
            }
          ]
        },
        "teamPlayer": {
          "role": "active",
          "startedOn": "2023-01-01",
          "note": "Starting mid laner"
        }
      }
    ]
  }
]

// TypeScript format (also supported):
[
  {
    name: 'Team SoloMid',
    slug: 'tsm',
    abbr: 'TSM',
    region: 'NA',
    logo: 'https://example.com/tsm-logo.png',
    aliases: ['TSM', 'Team SoloMid'],
    players: [
      {
        player: {
          name: 'Player Name',
          slug: 'player-slug',
          nationalities: ['US'],
          gameAccounts: [
            {
              server: 'Strinova',
              accountId: 1234567,
              currentName: 'CurrentGameName'
            }
          ]
        },
        teamPlayer: {
          role: 'active',
          startedOn: '2023-01-01',
          note: 'Starting mid laner'
        }
      }
    ]
  }
]`;

	async function handleImportJson() {
		if (!parsedTeams || parsedTeams.type !== 'success') return;

		try {
			importError = '';
			isImporting = true;

			// Send to server
			const formData = new FormData();
			formData.append('teams', JSON.stringify(parsedTeams.data));

			const response = await fetch('?/batchCreate', {
				method: 'POST',
				body: formData
			});

			const result = deserialize(await response.text());
			console.log('Import result:', result); // Debug log

			if (result.type === 'failure') {
				importError = (result.data?.error as string) || 'Failed to import teams';
			} else if (result.type === 'success') {
				// Close the dialog and show success message
				handleClose();
				const createdCount = result.data?.createdCount || 0;
				console.log('Created count:', createdCount); // Debug log
				onSuccess(`Successfully imported ${createdCount} teams`);
			} else {
				importError = 'Unexpected response from server';
			}
		} catch (error) {
			importError =
				error instanceof Error ? error.message : 'Failed to import teams. Please try again.';
			console.error('Import error:', error);
		} finally {
			isImporting = false;
		}
	}

	function handleClose() {
		importJsonData = '';
		importError = '';
		parsedTeams = null;
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
				<h3 class="text-lg font-semibold text-slate-200">Batch Import Teams</h3>
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
						Paste JSON data in TeamImportData format:
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

				{#if importJsonData.trim() && !parsedTeams}
					<div class="mt-2 flex items-center gap-2 text-sm text-yellow-400">
						<div
							class="h-4 w-4 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent"
						></div>
						<span>Parsing data...</span>
					</div>
				{/if}
			</div>

			{#if importError}
				<div class="mb-4 rounded-md bg-red-900/50 p-3 text-sm text-red-200">
					{importError}
				</div>
			{/if}

			{#if parsedTeams && parsedTeams.type === 'error'}
				<div class="mb-4 rounded-md bg-red-900/50 p-3 text-sm text-red-200">
					<strong>Parsing Error:</strong>
					{parsedTeams.error}
				</div>
			{/if}

			{#if parsedTeams && parsedTeams.type === 'success'}
				<div class="mb-4 rounded-md border border-slate-600 bg-slate-900 p-4">
					<h4 class="mb-3 text-sm font-medium text-slate-200">Parsed Teams</h4>

					<div
						class="styled-scroll max-h-128 overflow-x-auto overflow-y-auto rounded-md border border-slate-700 bg-slate-900"
					>
						<table class="w-full table-auto border-collapse border-y-2 border-gray-500 bg-gray-800">
							<thead>
								<tr class="border-b-2 border-gray-500 text-left text-sm text-gray-400">
									<th class="px-4 py-1">Name</th>
									<th class="px-4 py-1">Slug</th>
									<th class="px-4 py-1">Abbr</th>
									<th class="px-4 py-1">Region</th>
									<th class="px-4 py-1">Logo</th>
									<th class="px-4 py-1">Aliases</th>
									<th class="px-4 py-1">Players</th>
								</tr>
							</thead>
							<tbody>
								{#each parsedTeams.data as team}
									<tr class="border-b-1 border-gray-500 bg-gray-800 px-4 py-2 shadow-2xl">
										<td class="px-4 py-1 text-white">
											{team.name}
										</td>
										<td
											class="max-w-32 truncate px-4 py-1 text-white {isDuplicateSlug(team)
												? 'bg-red-900/30'
												: ''}"
											title={isDuplicateSlug(team) ? getDuplicateReason(team) : ''}
										>
											{team.slug || formatSlug(team.name)}
										</td>
										<td class="px-4 py-1 text-gray-300">
											{team.abbr || '-'}
										</td>
										<td class="px-4 py-1 text-gray-300">
											{team.region || '-'}
										</td>
										<td class="px-4 py-1 text-gray-300">
											{team.logo ? 'Yes' : '-'}
										</td>
										<td class="px-4 py-1 text-gray-300">
											{#if team.aliases && team.aliases.length > 0}
												{#each team.aliases as alias}
													{alias},
												{/each}
											{:else}
												-
											{/if}
										</td>
										<td class="px-4 py-1 text-gray-300">
											{#if team.players && team.players.length > 0}
												<ul>
													{#each team.players as playerData}
														<li class="break-keep whitespace-nowrap">
															<span class="text-xs text-gray-400">{playerData.player.name}</span>
															{playerData.teamPlayer.role}
															{#if playerData.teamPlayer.startedOn}
																<span class="text-xs text-gray-400"
																	>({playerData.teamPlayer.startedOn})</span
																>
															{/if}
														</li>
													{/each}
												</ul>
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

			{#if parsedTeams && hasNewPlayersRequired}
				<div class="mb-4 rounded-md border border-yellow-700 bg-yellow-900/50 p-4">
					<h4 class="mb-3 text-sm font-medium text-yellow-200">New Players Required</h4>
					<p class="mb-3 text-xs text-yellow-300">
						The following players need to be created before importing teams. They will be created
						automatically during the import process.
					</p>

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
								{#each newPlayersRequired as player}
									<tr class="border-b-1 border-gray-500 bg-gray-800 px-4 py-2 shadow-2xl">
										<td class="px-4 py-1 text-white">
											{player.name}
										</td>
										<td
											class="max-w-32 truncate px-4 py-1 text-white {hasNewPlayerDuplicate(player)
												? 'bg-red-900/30'
												: ''}"
											title={hasNewPlayerDuplicate(player)
												? getNewPlayerDuplicateReason(player)
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
											class="px-4 py-1 text-gray-300 {hasNewPlayerDuplicate(player)
												? 'bg-red-900/30'
												: ''}"
											title={hasNewPlayerDuplicate(player)
												? getNewPlayerDuplicateReason(player)
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

			{#if parsedTeams && hasNewPlayerDuplicates}
				<div class="mb-4 rounded-md border border-red-700 bg-red-900/50 p-3">
					<div class="flex items-start gap-2">
						<div class="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-red-500"></div>
						<div class="flex-1">
							<p class="mb-1 text-sm font-medium text-red-200">
								Duplicate issues in new players detected
							</p>
							<p class="text-xs text-red-300">
								Please resolve the duplicate issues highlighted in red above before importing. New
								players must have unique slugs and account IDs.
							</p>
						</div>
					</div>
				</div>
			{/if}

			{#if parsedTeams && hasDuplicateSlugs}
				<div class="mb-4 rounded-md border border-red-700 bg-red-900/50 p-3">
					<div class="flex items-start gap-2">
						<div class="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-red-500"></div>
						<div class="flex-1">
							<p class="mb-1 text-sm font-medium text-red-200">Duplicate slugs detected</p>
							<p class="text-xs text-red-300">
								Please resolve the duplicate slugs highlighted in red above before importing. Each
								team must have a unique slug (either provided explicitly or auto-generated from
								name).
							</p>
						</div>
					</div>
				</div>
			{/if}

			{#if parsedTeams && hasAnyDuplicates}
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
				{#if parsedTeams && parsedTeams.type === 'success'}
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
							Import Teams
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
