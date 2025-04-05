<script lang="ts">
	import type { Match, Team } from '$lib/data';

	let { matches }: { matches: Match[] } = $props();

	const rounds = Array.from(new Set(matches.map((m) => m.round))).sort();

	function getMatchesByRound(round: number) {
		return matches.filter((m) => m.round === round);
	}

	function isWinner(match: Match, team: Team) {
		if (!team || !match.winnerId) return false;
		return (
			(match.winnerId === 1 && team === match.teams[0].team) ||
			(match.winnerId === 2 && team === match.teams[1].team)
		);
	}
</script>

<div class="bracket-container">
	{#each rounds as round, i}
		<div class="round">
			{#each getMatchesByRound(round) as match}
				<a href={`/matches/${match.id}`} class="match">
					<div class="team {isWinner(match, match.teams[0].team) ? 'winner' : 'loser'}">
						{match.teams[0].team.name}
						{#if match.teams[0].score !== undefined}
							<span class="score">{match.teams[0].score}</span>
						{/if}
					</div>
					<div class="team {isWinner(match, match.teams[1].team) ? 'winner' : 'loser'}">
						{match.teams[1].team.name}
						{#if match.teams[1].score !== undefined}
							<span class="score">{match.teams[1].score}</span>
						{/if}
					</div>
				</a>
			{/each}
		</div>
		{#if i < rounds.length - 1}
			<div class="connector"></div>
		{/if}
	{/each}
</div>

<style lang="postcss">
	.bracket-container {
		display: flex;
		align-items: center;
		gap: 1rem;
		overflow-x: auto;
		padding: 1rem;
		background-color: #1a1a1a;
	}

	.round {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.match {
		background: linear-gradient(135deg, #2a2c31, #3a3c41);
		border-radius: 0.1rem;
		position: relative;
		cursor: pointer;
		color: white;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
		text-decoration: none;
	}

	.team {
		display: flex;
		justify-content: space-between;
		padding: 0.25rem;
		border: 1px solid #4a4c51;
	}

	.team.winner {
		border-left: 4px solid #e3b942;
	}

	.team.loser {
		border-left: 4px solid #db4f47;
		color: #b4b4b4;
	}

	.score {
		font-weight: bold;
		margin-left: 0.5rem;
	}

	.connector {
		flex-grow: 1;
		height: 2px;
		background-color: #555;
		position: relative;
		margin-bottom: 2rem;
	}

	.connector::before,
	.connector::after {
		content: '';
		position: absolute;
		height: 10px;
		width: 10px;
		border-radius: 50%;
		background-color: #555;
		top: 50%;
		transform: translateY(-50%);
	}

	.connector::before {
		left: -5px;
	}

	.connector::after {
		right: -5px;
	}

	::-webkit-scrollbar {
		height: 6px;
	}

	::-webkit-scrollbar-thumb {
		background: #e63946;
		border-radius: 3px;
	}
</style>
