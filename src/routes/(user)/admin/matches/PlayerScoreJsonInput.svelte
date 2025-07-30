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

	let { showModal, playerScoresA, playerScoresB, teamData, onClose } = $props<{
		showModal: boolean;
		playerScoresA: GamePlayerScore[];
		playerScoresB: GamePlayerScore[];
		teamData: Array<{ teamId: string; position: number; score: number }>;
		onClose: () => void;
	}>();

	let importJsonData = $state('');
	let importError = $state('');
	let reverseTeams = $state(false);

	const EXAMPLE_JSON_DATA = `// Supports both JSON and TypeScript formats:

// JSON format:
[
  [
    {
      "accountId": 2017921,
      "player": "iYu",
      "characters": ["Fuschia", "Ming"],
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

// TypeScript format (also supported):
[
  [
    {
      accountId: 2017921,
      player: 'iYu',
      characters: ['Fuschia', 'Ming'],
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

	function importData(data: PlayerScoreData) {
		try {
			// Reverse teams if checkbox is checked
			const teamAData = reverseTeams ? data[1] : data[0];
			const teamBData = reverseTeams ? data[0] : data[1];

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

			// Calculate team scores
			const teamAScore = teamAData.reduce((sum, player) => sum + player.score, 0);
			const teamBScore = teamBData.reduce((sum, player) => sum + player.score, 0);

			teamData[0].score = teamAScore;
			teamData[1].score = teamBScore;

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
		onClose();
	}
</script>

{#if showModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-2xl rounded-lg bg-slate-800 p-6 shadow-xl">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-semibold text-slate-200">Import JSON Data</h3>
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
				<label class="mb-2 block text-sm font-medium text-slate-300" for="jsonData">
					Paste JSON data in PlayerScoreData format:
				</label>
				<textarea
					id="jsonData"
					bind:value={importJsonData}
					placeholder={`Paste your JSON data here. Example: \n${EXAMPLE_JSON_DATA}`}
					class="h-64 w-full rounded-md border border-slate-700 bg-slate-900 p-3 font-mono text-sm text-slate-200 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
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
