<script lang="ts">
	import type { GamePlayerScore } from '$lib/server/db/schemas';
	import Highlight from 'svelte-highlight';
	import json from 'svelte-highlight/languages/json';
	import typescript from 'svelte-highlight/languages/typescript';
	// import 'svelte-highlight/styles/github-dark.css';
	import '$lib/highlight.css';

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

	let {
		showModal,
		playerScoresA,
		playerScoresB,
		teamData,
		onClose
	}: {
		showModal: boolean;
		playerScoresA: GamePlayerScore[];
		playerScoresB: GamePlayerScore[];
		teamData: Array<{ teamId: string; position: number; score: number }>;
		onClose: () => void;
	} = $props();

	let exportFormat = $state<'json' | 'typescript'>('json');

	function convertToPlayerScoreData(): PlayerScoreData {
		const teamA: PlayerScore[] = playerScoresA
			.filter((ps) => ps.player && ps.player.trim() !== '')
			.map((ps) => ({
				accountId: ps.accountId || 0,
				player: ps.player,
				characters: [ps.characterFirstHalf, ps.characterSecondHalf].filter(
					(char): char is string => char !== null && char !== ''
				),
				score: ps.score || 0,
				damageScore: ps.damageScore || 0,
				kills: ps.kills || 0,
				knocks: ps.knocks || 0,
				deaths: ps.deaths || 0,
				assists: ps.assists || 0,
				damage: ps.damage || 0
			}));

		const teamB: PlayerScore[] = playerScoresB
			.filter((ps) => ps.player && ps.player.trim() !== '')
			.map((ps) => ({
				accountId: ps.accountId || 0,
				player: ps.player,
				characters: [ps.characterFirstHalf, ps.characterSecondHalf].filter(
					(char): char is string => char !== null && char !== ''
				),
				score: ps.score || 0,
				damageScore: ps.damageScore || 0,
				kills: ps.kills || 0,
				knocks: ps.knocks || 0,
				deaths: ps.deaths || 0,
				assists: ps.assists || 0,
				damage: ps.damage || 0
			}));

		// Pad teams to have exactly 5 players
		const emptyPlayer: PlayerScore = {
			accountId: 0,
			player: '',
			characters: [],
			score: 0,
			damageScore: 0,
			kills: 0,
			knocks: 0,
			deaths: 0,
			assists: 0,
			damage: 0
		};

		const paddedTeamA = [...teamA];
		while (paddedTeamA.length < 5) {
			paddedTeamA.push(emptyPlayer);
		}

		const paddedTeamB = [...teamB];
		while (paddedTeamB.length < 5) {
			paddedTeamB.push(emptyPlayer);
		}

		return [
			paddedTeamA as [PlayerScore, PlayerScore, PlayerScore, PlayerScore, PlayerScore],
			paddedTeamB as [PlayerScore, PlayerScore, PlayerScore, PlayerScore, PlayerScore]
		];
	}

	function generateExportData(): string {
		const data = convertToPlayerScoreData();

		if (exportFormat === 'json') {
			return JSON.stringify(data, null, 2);
		} else {
			// TypeScript format
			const tsData = data.map((team) =>
				team.map((player) => ({
					accountId: player.accountId,
					player: `'${player.player}'`,
					characters: `['${player.characters.join("', '")}']`,
					score: player.score,
					damageScore: player.damageScore,
					kills: player.kills,
					knocks: player.knocks,
					deaths: player.deaths,
					assists: player.assists,
					damage: player.damage
				}))
			);

			let result = '[\n';
			tsData.forEach((team, teamIndex) => {
				result += '  [\n';
				team.forEach((player, playerIndex) => {
					result += '    {\n';
					result += `      accountId: ${player.accountId},\n`;
					result += `      player: ${player.player},\n`;
					result += `      characters: ${player.characters},\n`;
					result += `      score: ${player.score},\n`;
					result += `      damageScore: ${player.damageScore},\n`;
					result += `      kills: ${player.kills},\n`;
					result += `      knocks: ${player.knocks},\n`;
					result += `      deaths: ${player.deaths},\n`;
					result += `      assists: ${player.assists},\n`;
					result += `      damage: ${player.damage}\n`;
					result += playerIndex < team.length - 1 ? '    },\n' : '    }\n';
				});
				result += teamIndex < tsData.length - 1 ? '  ],\n' : '  ]\n';
			});
			result += ']';

			return result;
		}
	}

	function copyToClipboard() {
		const exportData = generateExportData();
		navigator.clipboard
			.writeText(exportData)
			.then(() => {
				// Could add a toast notification here
				console.log('Data copied to clipboard');
			})
			.catch((err) => {
				console.error('Failed to copy to clipboard:', err);
			});
	}

	function downloadFile() {
		const exportData = generateExportData();
		const blob = new Blob([exportData], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `game-data.${exportFormat === 'json' ? 'json' : 'ts'}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function handleClose() {
		exportFormat = 'json';
		onClose();
	}
</script>

{#if showModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="w-full max-w-2xl rounded-lg bg-slate-900/95 p-6 shadow-xl">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-semibold text-slate-200">Export JSON Data</h3>
				<button
					type="button"
					class="cursor-pointer text-slate-400 hover:text-slate-200"
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
				<div class="mb-4 flex gap-4">
					<div>
						<label class="mb-2 block text-sm font-medium text-slate-300" for="exportFormat"
							>Export Format</label
						>
						<select
							id="exportFormat"
							bind:value={exportFormat}
							class="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-slate-200 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						>
							<option value="json">JSON</option>
							<option value="typescript">TypeScript</option>
						</select>
					</div>
				</div>
			</div>

			<div class="mb-4">
				<label class="mb-2 block text-sm font-medium text-slate-300" for="exportedData"
					>Exported Data</label
				>
				<div
					class="h-64 w-full overflow-auto rounded-md border border-slate-600 bg-slate-800 p-3 font-mono text-sm text-slate-200 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
				>
					<Highlight
						language={exportFormat === 'json' ? json : typescript}
						code={generateExportData()}
					/>
				</div>
			</div>

			<div class="flex justify-end gap-3">
				<button
					type="button"
					class="cursor-pointer rounded-md border border-slate-600 bg-slate-800 px-4 py-2 text-slate-300 hover:bg-slate-700"
					onclick={copyToClipboard}
				>
					Copy to Clipboard
				</button>
				<button
					type="button"
					class="cursor-pointer rounded-md border border-slate-600 bg-slate-800 px-4 py-2 text-slate-300 hover:bg-slate-700"
					onclick={downloadFile}
				>
					Download File
				</button>
				<button
					type="button"
					class="cursor-pointer rounded-md border border-slate-600 bg-slate-800 px-4 py-2 text-slate-300 hover:bg-slate-700"
					onclick={handleClose}
				>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}
