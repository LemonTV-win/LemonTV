<script lang="ts">
	import type { GamePlayerScore } from '$lib/server/db/schemas';

	interface PlayerScore {
		accountId: number;
		player: string;
		characters: string[];
		score: number;
		damageScore: number;
		kills: number;
		knocks: number;
		deaths: number;
		assists: number;
		damage: number;
	}
	type PlayerScoreData = [
		teamA: [PlayerScore, PlayerScore, PlayerScore, PlayerScore, PlayerScore],
		teamB: [PlayerScore, PlayerScore, PlayerScore, PlayerScore, PlayerScore]
	];

	interface GameMeta {
		mapId: string;
		duration: number;
		teams: [{ teamId: string; score: number }, { teamId: string; score: number }];
		winner: 0 | 1 | null;
	}

	let {
		showModal,
		playerScoresA,
		playerScoresB,
		teamData = $bindable([
			{ teamId: '', position: 0, score: 0 },
			{ teamId: '', position: 1, score: 0 }
		]),
		compiledGameAccountIDMaps,
		formData = $bindable({ mapId: '', duration: 0 }),
		onClose
	}: {
		showModal: boolean;
		playerScoresA: GamePlayerScore[];
		playerScoresB: GamePlayerScore[];
		teamData: Array<{ teamId: string; position: number; score: number }>;
		compiledGameAccountIDMaps: Array<Map<number, { player: any; job: 'main' | 'sub' | 'coach' }>>;
		formData: { mapId: string; duration: number | string };
		onClose: () => void;
	} = $props();

	let importJsonData = $state('');
	let importError = $state('');
	let reverseTeams = $state(false);
	let autoDetectedSwap = $state(false);

	// Auto-detect if teams need to be swapped based on account IDs
	function autoDetectTeamSwap(data: PlayerScoreData): boolean {
		if (!compiledGameAccountIDMaps || compiledGameAccountIDMaps.length < 2) return false;

		const teamAMap = compiledGameAccountIDMaps[0];
		const teamBMap = compiledGameAccountIDMaps[1];

		// Count how many players from each team are found in the imported data
		// let teamAMatches = 0;
		// let teamBMatches = 0;

		// Check team A data (first array in imported data)
		// data[0].forEach((playerScore) => {
		// 	if (playerScore.accountId && teamAMap.has(playerScore.accountId)) {
		// 		teamAMatches++;
		// 	}
		// 	if (playerScore.accountId && teamBMap.has(playerScore.accountId)) {
		// 		teamBMatches++;
		// 	}
		// });

		// Check team B data (second array in imported data)
		// data[1].forEach((playerScore) => {
		// 	if (playerScore.accountId && teamAMap.has(playerScore.accountId)) {
		// 		teamAMatches++;
		// 	}
		// 	if (playerScore.accountId && teamBMap.has(playerScore.accountId)) {
		// 		teamBMatches++;
		// 	}
		// });

		// If more team B players are found in the first array (team A position),
		// or more team A players are found in the second array (team B position),
		// then we need to swap teams
		const teamAInFirstArray = data[0].filter(
			(p) => p.accountId && teamAMap.has(p.accountId)
		).length;
		const teamBInFirstArray = data[0].filter(
			(p) => p.accountId && teamBMap.has(p.accountId)
		).length;
		const teamAInSecondArray = data[1].filter(
			(p) => p.accountId && teamAMap.has(p.accountId)
		).length;
		const teamBInSecondArray = data[1].filter(
			(p) => p.accountId && teamBMap.has(p.accountId)
		).length;

		// If the distribution suggests teams are swapped, return true
		return teamBInFirstArray > teamAInFirstArray && teamAInSecondArray > teamBInSecondArray;
	}

	const EXAMPLE_JSON_DATA = `// Supports both JSON and TypeScript formats:
// Note: Account IDs are used for auto-detection of team swapping

// JSON format:
[
  [
    {
      "accountId": 2017921,
      "player": "iYu",
      "characters": ["Fuchsia", "Ming"],
      "score": 204,
      "damageScore": 172,
      "kills": 10,
      "knocks": 13,
      "deaths": 10,
      "assists": 11,
      "damage": 3812
    },
    {
      "accountId": 2340207,
      "player": "JY10137",
      "characters": ["Ming", "Bai Mo"],
      "score": 244,
      "damageScore": 216,
      "kills": 9,
      "knocks": 9,
      "deaths": 7,
      "assists": 25,
      "damage": 5371
    }
  ],
  [
    {
      "accountId": 3456789,
      "player": "Player3",
      "characters": ["Character1", "Character2"],
      "score": 180,
      "damageScore": 150,
      "kills": 8,
      "knocks": 10,
      "deaths": 12,
      "assists": 15,
      "damage": 3200
    }
  ]
]

// TypeScript format (also supported):
[
  [
    {
      accountId: 2017921,
      player: 'iYu',
      characters: ['Fuchsia', 'Ming'],
      score: 204,
      damageScore: 172,
      kills: 10,
      knocks: 13,
      deaths: 10,
      assists: 11,
      damage: 3812
    }
  ],
  [
    {
      accountId: 2340207,
      player: 'JY10137',
      characters: ['Ming', 'Bai Mo'],
      score: 244,
      damageScore: 216,
      kills: 9,
      knocks: 9,
      deaths: 7,
      assists: 25,
      damage: 5371
    }
  ]
]`;

	const EXAMPLE_JSON_DATA_NEW = `// Preferred JSON format with metadata (matches export):
{
  "game_metadata": {
    "mapId": "aquaPlaza",
    "duration": 734,
    "teams": [
      { "teamId": "teamA-id", "score": 3 },
      { "teamId": "teamB-id", "score": 5 }
    ],
    "winner": 1
  },
  "player_scores": [
    [
      {
        "accountId": 2017921,
        "player": "iYu",
        "characters": ["Fuchsia", "Ming"],
        "score": 204,
        "damageScore": 172,
        "kills": 10,
        "knocks": 13,
        "deaths": 10,
        "assists": 11,
        "damage": 3812
      }
    ],
    [
      {
        "accountId": 2340207,
        "player": "JY10137",
        "characters": ["Ming", "Bai Mo"],
        "score": 244,
        "damageScore": 216,
        "kills": 9,
        "knocks": 9,
        "deaths": 7,
        "assists": 25,
        "damage": 5371
      }
    ]
  ]
}`;

	function importData(
		data:
			| PlayerScoreData
			| { meta?: GameMeta; players?: PlayerScoreData }
			| { game_metadata?: GameMeta; player_scores?: PlayerScoreData }
	) {
		try {
			const isObjectFormat = !Array.isArray(data);
			const players: PlayerScoreData | undefined = isObjectFormat
				? (data as any).players || (data as any).player_scores
				: (data as PlayerScoreData);

			if (!players || !Array.isArray(players) || players.length < 2) {
				throw new Error('Invalid players data: expected two-team array');
			}

			// Auto-detect if teams need to be swapped
			const shouldSwapTeams = autoDetectTeamSwap(players);
			reverseTeams = shouldSwapTeams;
			autoDetectedSwap = shouldSwapTeams;

			// Apply meta if present
			if (isObjectFormat) {
				const meta: GameMeta | undefined = (data as any).meta || (data as any).game_metadata;
				if (meta) {
					// map and duration
					formData.mapId = meta.mapId || '';
					formData.duration = meta.duration || 0;
					// scores (respect swap)
					const scoreA = meta.teams?.[0]?.score ?? 0;
					const scoreB = meta.teams?.[1]?.score ?? 0;
					if (reverseTeams) {
						teamData[0].score = scoreB;
						teamData[1].score = scoreA;
					} else {
						teamData[0].score = scoreA;
						teamData[1].score = scoreB;
					}
				}
			}

			// Reverse teams if checkbox is checked
			const teamAData = reverseTeams ? players[1] : players[0];
			const teamBData = reverseTeams ? players[0] : players[1];

			// Import team A data
			teamAData.forEach((playerScore, index) => {
				if (index < playerScoresA.length) {
					playerScoresA[index] = {
						...playerScoresA[index],
						accountId: playerScore.accountId,
						player: playerScore.player,
						characterFirstHalf: playerScore.characters[0] || '',
						characterSecondHalf: playerScore.characters[1] || '',
						score: playerScore.score,
						damageScore: playerScore.damageScore,
						kills: playerScore.kills,
						knocks: playerScore.knocks,
						deaths: playerScore.deaths,
						assists: playerScore.assists,
						damage: playerScore.damage
					};
				}
			});

			// Import team B data
			teamBData.forEach((playerScore, index) => {
				if (index < playerScoresB.length) {
					playerScoresB[index] = {
						...playerScoresB[index],
						accountId: playerScore.accountId,
						player: playerScore.player,
						characterFirstHalf: playerScore.characters[0] || '',
						characterSecondHalf: playerScore.characters[1] || '',
						score: playerScore.score,
						damageScore: playerScore.damageScore,
						kills: playerScore.kills,
						knocks: playerScore.knocks,
						deaths: playerScore.deaths,
						assists: playerScore.assists,
						damage: playerScore.damage
					};
				}
			});

			handleClose();
		} catch (error) {
			importError = 'Failed to import data. Please check the JSON format.';
			console.error('Import error:', error);
		}
	}

	function handleImportJson() {
		try {
			importError = '';
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

			const parsedData = JSON.parse(cleanedData);
			importData(parsedData);
		} catch (error) {
			importError =
				'Invalid format. Please check your data. The import supports both JSON and TypeScript object literal formats.';
			console.error('Parse error:', error);
		}
	}

	function handleClose() {
		importJsonData = '';
		importError = '';
		reverseTeams = false;
		autoDetectedSwap = false;
		onClose();
	}
</script>

{#if showModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-2xl rounded-lg bg-slate-800 p-6 shadow-xl">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-semibold text-slate-200">Import JSON Data</h3>
				<button
					type="button"
					class="text-slate-400 hover:text-slate-200"
					onclick={handleClose}
					aria-label="Close dialog"
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
				<label class="mb-2 block text-sm font-medium text-slate-300" for="jsonData">
					Paste GameExportData (meta + players) or legacy PlayerScoreData. Team swap auto-detected
					by account IDs.
				</label>
				<textarea
					id="jsonData"
					bind:value={importJsonData}
					placeholder={`Paste your JSON data here. Example (new): \n${EXAMPLE_JSON_DATA_NEW}\n\nLegacy format: \n${EXAMPLE_JSON_DATA}`}
					class="styled-scroll h-64 w-full rounded-md border border-slate-700 bg-slate-900 p-3 font-mono text-sm text-slate-200 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
				></textarea>
			</div>

			<div class="mb-4">
				<label class="flex items-center gap-2 text-sm text-slate-300">
					<input
						type="checkbox"
						bind:checked={reverseTeams}
						class="rounded border-slate-600 bg-slate-700 text-yellow-500 focus:ring-yellow-500"
					/>
					Reverse teams (swap team A and team B)
				</label>
				{#if autoDetectedSwap}
					<div class="mt-2 rounded-md bg-yellow-500/20 p-2 text-sm text-yellow-200">
						⚠️ Auto-detected team swap based on account IDs. Teams have been automatically reversed.
					</div>
				{/if}
			</div>

			{#if importError}
				<div class="mb-4 rounded-md bg-red-900/50 p-3 text-sm text-red-200">
					{importError}
				</div>
			{/if}

			<div class="flex justify-end gap-3">
				<button
					type="button"
					class="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
					onclick={handleClose}
				>
					Cancel
				</button>
				<button
					type="button"
					class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600"
					onclick={handleImportJson}
				>
					Import Data
				</button>
			</div>
		</div>
	</div>
{/if}
