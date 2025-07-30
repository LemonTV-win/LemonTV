<script lang="ts">
	import type { Player } from '$lib/data/players';
	import type { TCountryCode } from 'countries-list';

	interface PlayerImportData {
		name: string;
		slug?: string;
		nationalities: TCountryCode[];
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

	let { showModal, onClose, onSuccess } = $props<{
		showModal: boolean;
		onClose: () => void;
		onSuccess: (message: string) => void;
	}>();

	let importJsonData = $state('');
	let importError = $state('');
	let isImporting = $state(false);
	let showSchema = $state(false);
	let parsedPlayers = $state<PlayerImportData[] | null>(null);
	let importResults = $state<{
		createdCount: number;
		duplicateCount: number;
		validationErrorCount: number;
		errorCount: number;
		duplicates: string[];
		validationErrors: string[];
		errors: string[];
	} | null>(null);

	const TYPESCRIPT_SCHEMA = `// TypeScript schema for player data
interface PlayerImportData {
  name: string;                    // Required: Player's display name
  slug?: string;                   // Optional: URL slug (auto-generated from name if not provided)
  nationalities: TCountryCode[];   // Required: Array of country codes (e.g., ["US", "KR"])
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
			importResults = null;

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
				if (
					!player.nationalities ||
					!Array.isArray(player.nationalities) ||
					player.nationalities.length === 0
				) {
					throw new Error('Each player must have at least one nationality');
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

			const result = await response.json();

			if (result.error) {
				importError = result.error;
			} else {
				importResults = {
					createdCount: result.createdCount || 0,
					duplicateCount: result.duplicateCount || 0,
					validationErrorCount: result.validationErrorCount || 0,
					errorCount: result.errorCount || 0,
					duplicates: result.duplicates || [],
					validationErrors: result.validationErrors || [],
					errors: result.errors || []
				};
				onSuccess(result.message || `Successfully imported ${parsedPlayers.length} players`);
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
		importResults = null;
		showSchema = false;
		onClose();
	}

	function copySchema() {
		navigator.clipboard.writeText(TYPESCRIPT_SCHEMA);
	}

	function goBackToEdit() {
		parsedPlayers = null;
		importResults = null;
	}
</script>

{#if showModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-4xl rounded-lg bg-slate-800 p-6 shadow-xl">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-semibold text-slate-200">Batch Import Players</h3>
				<button type="button" class="text-slate-400 hover:text-slate-200" onclick={handleClose}>
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
						<pre
							class="max-h-100 overflow-x-auto overflow-y-auto text-xs whitespace-pre-wrap text-slate-300">{TYPESCRIPT_SCHEMA}</pre>
					</div>
				{/if}

				<textarea
					id="jsonData"
					bind:value={importJsonData}
					placeholder={`Paste your JSON data here. Example: \n${EXAMPLE_JSON_DATA}`}
					class="h-64 w-full rounded-md border border-slate-700 bg-slate-900 p-3 font-mono text-sm text-slate-200 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
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
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y divide-slate-700">
							<thead class="bg-slate-800">
								<tr>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-300 uppercase"
									>
										Name
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-300 uppercase"
									>
										Slug
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-300 uppercase"
									>
										Nationalities
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-300 uppercase"
									>
										Aliases
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-300 uppercase"
									>
										Game Accounts
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-300 uppercase"
									>
										Social Accounts
									</th>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-300 uppercase"
									>
										User
									</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-700">
								{#each parsedPlayers as player}
									<tr class="hover:bg-slate-700">
										<td class="px-6 py-4 text-sm whitespace-nowrap text-slate-200">
											{player.name}
										</td>
										<td class="px-6 py-4 text-sm whitespace-nowrap text-slate-200">
											{player.slug || player.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}
										</td>
										<td class="px-6 py-4 text-sm whitespace-nowrap text-slate-200">
											{#each player.nationalities as nationality}
												{nationality},
											{/each}
										</td>
										<td class="px-6 py-4 text-sm whitespace-nowrap text-slate-200">
											{#if player.aliases && player.aliases.length > 0}
												{#each player.aliases as alias}
													{alias},
												{/each}
											{:else}
												-
											{/if}
										</td>
										<td class="px-6 py-4 text-sm whitespace-nowrap text-slate-200">
											{#if player.gameAccounts && player.gameAccounts.length > 0}
												<ul class="list-inside list-disc text-xs text-slate-300">
													{#each player.gameAccounts as account}
														<li>
															{account.server} - {account.currentName} (ID: {account.accountId})
															{#if account.region}
																, Region: {account.region}
															{/if}
														</li>
													{/each}
												</ul>
											{/if}
										</td>
										<td class="px-6 py-4 text-sm whitespace-nowrap text-slate-200">
											{#if player.socialAccounts && player.socialAccounts.length > 0}
												<ul class="list-inside list-disc text-xs text-slate-300">
													{#each player.socialAccounts as account}
														<li>
															{account.platformId} - {account.accountId}
															{#if account.overridingUrl}
																, URL: {account.overridingUrl}
															{/if}
														</li>
													{/each}
												</ul>
											{/if}
										</td>
										<td class="px-6 py-4 text-sm whitespace-nowrap text-slate-200">
											{#if player.user}
												{player.user.username} ({player.user.email})
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}

			{#if importResults}
				<div class="mb-4 rounded-md border border-slate-600 bg-slate-900 p-4">
					<h4 class="mb-3 text-sm font-medium text-slate-200">Import Results</h4>

					<div class="space-y-3">
						{#if importResults.createdCount > 0}
							<div class="flex items-center gap-2">
								<div class="h-2 w-2 rounded-full bg-green-500"></div>
								<span class="text-sm text-green-400">
									Successfully created {importResults.createdCount} players
								</span>
							</div>
						{/if}

						{#if importResults.duplicateCount > 0}
							<div class="flex items-start gap-2">
								<div class="mt-1.5 h-2 w-2 rounded-full bg-yellow-500"></div>
								<div class="flex-1">
									<span class="text-sm text-yellow-400">
										Skipped {importResults.duplicateCount} duplicate players:
									</span>
									<ul class="mt-1 space-y-1">
										{#each importResults.duplicates as duplicate}
											<li class="ml-4 text-xs text-slate-300">• {duplicate}</li>
										{/each}
									</ul>
								</div>
							</div>
						{/if}

						{#if importResults.validationErrorCount > 0}
							<div class="flex items-start gap-2">
								<div class="mt-1.5 h-2 w-2 rounded-full bg-orange-500"></div>
								<div class="flex-1">
									<span class="text-sm text-orange-400">
										Skipped {importResults.validationErrorCount} players with validation errors:
									</span>
									<ul class="mt-1 space-y-1">
										{#each importResults.validationErrors as error}
											<li class="ml-4 text-xs text-slate-300">• {error}</li>
										{/each}
									</ul>
								</div>
							</div>
						{/if}

						{#if importResults.errorCount > 0}
							<div class="flex items-start gap-2">
								<div class="mt-1.5 h-2 w-2 rounded-full bg-red-500"></div>
								<div class="flex-1">
									<span class="text-sm text-red-400">
										Failed to create {importResults.errorCount} players due to errors:
									</span>
									<ul class="mt-1 space-y-1">
										{#each importResults.errors as error}
											<li class="ml-4 text-xs text-slate-300">• {error}</li>
										{/each}
									</ul>
								</div>
							</div>
						{/if}
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
						disabled={isImporting}
					>
						{isImporting ? 'Importing...' : 'Import Players'}
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
					{importResults ? 'Close' : 'Cancel'}
				</button>
			</div>
		</div>
	</div>
{/if}
