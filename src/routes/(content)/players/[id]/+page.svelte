<script lang="ts">
	import { error } from '@sveltejs/kit';
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages.js';
	import MapIcon from '$lib/components/MapIcon.svelte';
	import PlayerAvatar from '$lib/components/PlayerAvatar.svelte';
	import MatchCard from '$lib/components/MatchCard.svelte';
	import SocialLinks from '$lib/components/SocialLinks.svelte';
	import NationalityFlag from '$lib/components/NationalityFlag.svelte';
	import { getAllNames } from '$lib/data/players';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import ContentActionLink from '$lib/components/ContentActionLink.svelte';
	import { MAP_NAMES } from '$lib/data/game';
	import PlayerAgents from './PlayerAgents.svelte';
	import PlayerRadarGraph from '$lib/components/PlayerRadarGraph.svelte';
	import { onMount } from 'svelte';
	let { data }: PageProps = $props();

	if (!data.player) {
		throw error(404, 'Player not found');
	}

	let gradientStyle = $state('');

	// Function to extract dominant colors from an image
	function extractColors(img: HTMLImageElement): string[] {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		if (!ctx) return ['#1e3a8a', '#7c3aed']; // fallback colors

		// Set canvas size (smaller for performance)
		canvas.width = 50;
		canvas.height = 50;

		// Draw image on canvas
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

		// Get image data
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const data = imageData.data;

		// Sample pixels and collect colors
		const colors: string[] = [];
		const step = Math.max(1, Math.floor(data.length / 4 / 100)); // Sample every nth pixel

		for (let i = 0; i < data.length; i += step * 4) {
			const r = data[i];
			const g = data[i + 1];
			const b = data[i + 2];

			// Prefer darker pixels (lower brightness)
			const brightness = (r + g + b) / 3;
			if (brightness > 180 || brightness < 15) continue; // Skip very light pixels

			// Convert to hex
			const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
			colors.push(hex);
		}

		// Find most common colors (simple approach)
		const colorCounts: Record<string, number> = {};
		colors.forEach((color) => {
			colorCounts[color] = (colorCounts[color] || 0) + 1;
		});

		// Sort by frequency and take top 2
		const sortedColors = Object.entries(colorCounts)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 2)
			.map(([color]) => color);

		return sortedColors.length >= 2 ? sortedColors : ['#1e3a8a', '#7c3aed'];
	}

	// Function to generate gradient style
	function generateGradient(colors: string[]): string {
		if (colors.length < 2)
			return 'linear-gradient(to right, rgba(30, 58, 138, 0.8), rgba(124, 58, 237, 0.8))';

		// Darken the colors by reducing RGB values
		const darkenColor = (color: string) => {
			const r = parseInt(color.slice(1, 3), 16);
			const g = parseInt(color.slice(3, 5), 16);
			const b = parseInt(color.slice(5, 7), 16);

			// Reduce brightness by 40%
			const darkR = Math.max(0, Math.floor(r * 0.6));
			const darkG = Math.max(0, Math.floor(g * 0.6));
			const darkB = Math.max(0, Math.floor(b * 0.6));

			return `rgba(${darkR}, ${darkG}, ${darkB}, 0.8)`;
		};

		const darkColor1 = darkenColor(colors[0]);
		const darkColor2 = darkenColor(colors[1]);

		return `linear-gradient(to right, ${darkColor1}, ${darkColor2})`;
	}

	onMount(() => {
		// Create a temporary image to extract colors
		const tempImg = new Image();
		tempImg.crossOrigin = 'anonymous';
		tempImg.onload = () => {
			try {
				const colors = extractColors(tempImg);
				gradientStyle = generateGradient(colors);
			} catch (error) {
				console.warn('Failed to extract colors from image:', error);
				gradientStyle = 'linear-gradient(to right, #1e3a8a, #7c3aed)';
			}
		};
		tempImg.src = data.player?.avatarURL || data.player?.avatar || '';
	});
</script>

{#if data.player}
	<Breadcrumbs currentTitle={data.player.name} />
	<main class="mx-auto max-w-screen-lg p-4">
		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<div class="glass overflow-hidden rounded-2xl">
				<div class="p-6" style={gradientStyle ? `background: ${gradientStyle}` : ''}>
					<PlayerAvatar player={data.player} class="mx-auto h-32 w-32" />
				</div>
				<div class="flex flex-col gap-4 p-6">
					<div class="flex flex-col items-center gap-2">
						<h1 class="flex flex-col items-center gap-2 text-center text-2xl font-bold">
							<span class="text-white">{data.player.name}</span>
							<span class="inline-flex flex-col gap-2">
								{#each getAllNames(data.player).filter((name) => name !== data.player.name) as name (name)}
									<span class="text-gray-400">({name})</span>
								{/each}
							</span>
						</h1>
						{#if ['admin', 'editor'].some((role) => data.user?.roles.includes(role))}
							<ContentActionLink
								href={`/admin/players?action=edit&id=${data.player.id}`}
								type="edit"
							/>
						{/if}
					</div>
					{#if data.player.nationalities.length}
						<p class="text-center text-gray-400">
							{#each data.player.nationalities as nationality, idx (idx)}
								<NationalityFlag {nationality} showLabel />
							{/each}
						</p>
					{/if}
					{#if data.player.socialAccounts?.length}
						<div class="flex justify-center">
							<SocialLinks
								socialAccounts={data.player.socialAccounts}
								socialPlatforms={data.socialPlatforms}
								iconSize="h-5 w-5"
							/>
						</div>
					{/if}
					{#if data.playerTeams}
						<div class="grid grid-cols-1 gap-4 py-4 sm:grid-cols-[auto_1fr]">
							<h3 class="text-lg font-bold">{m.teams()}</h3>
							<ul class="text-right">
								{#each data.playerTeams as team (team.teams.slug)}
									{#if team}
										<li>
											<a
												href={`/teams/${team.teams.slug}`}
												class="text-yellow-500 hover:text-yellow-400"
											>
												{team.teams.name}
											</a>
										</li>
									{/if}
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			</div>

			<div class="glass rounded-2xl p-6">
				<h2 class="mb-4 text-xl font-bold">{m.stats()}</h2>
				<div class="grid grid-cols-2 gap-4">
					<div class="rounded-lg bg-slate-800/50 p-4">
						<div class="text-sm text-gray-400">{m.wins()}</div>
						<div class="text-2xl font-bold text-white">{data.playerWins}</div>
					</div>
					<div class="rounded-lg bg-slate-800/50 p-4">
						<div class="text-sm text-gray-400">{m.kd_ratio()}</div>
						<div class="text-2xl font-bold text-white">{data.playerKD.toFixed(2)}</div>
					</div>
					<div class="rounded-lg bg-slate-800/50 p-4">
						<div class="text-sm text-gray-400">{m.win_rate()}</div>
						<div class="text-2xl font-bold text-white">{data.playerStats.winRate.toFixed(1)}%</div>
					</div>
					<div class="rounded-lg bg-slate-800/50 p-4">
						<div class="text-sm text-gray-400">{m.games()}</div>
						<div class="text-2xl font-bold text-white">{data.playerStats.totalGames}</div>
					</div>
					<div class="rounded-lg bg-slate-800/50 p-4">
						<div class="text-sm text-gray-400">{m.kills()}</div>
						<div class="text-2xl font-bold text-white">{data.playerStats.totalKills}</div>
					</div>
					<div class="rounded-lg bg-slate-800/50 p-4">
						<div class="text-sm text-gray-400">{m.deaths()}</div>
						<div class="text-2xl font-bold text-white">{data.playerStats.totalDeaths}</div>
					</div>
					<div class="rounded-lg bg-slate-800/50 p-4">
						<div class="text-sm text-gray-400">{m.assists()}</div>
						<div class="text-2xl font-bold text-white">{data.playerStats.totalAssists}</div>
					</div>
					<div class="rounded-lg bg-slate-800/50 p-4">
						<div class="text-sm text-gray-400">{m.avg_score()}</div>
						<div class="text-2xl font-bold text-white">
							{data.playerStats.averageScore.toFixed(0)}
						</div>
					</div>
				</div>
			</div>

			<div class="glass rounded-2xl p-6">
				<h3 class="mb-4 text-lg font-bold">{m.superstrings()}</h3>
				<ul class="styled-scroll flex max-h-100 list-none flex-col gap-2 overflow-y-auto pr-2">
					{#if data.playerAgents.length > 0}
						<PlayerAgents playerAgents={data.playerAgents} />
					{:else}
						<li class="text-center text-gray-400">{m.no_data()}</li>
					{/if}
				</ul>
			</div>

			<div class="glass rounded-2xl p-6">
				<h3 class="mb-4 text-lg font-bold">{m.maps()}</h3>
				<ul class="flex list-none flex-col gap-2">
					{#if data.playerMapStats.length > 0}
						{#each data.playerMapStats as mapStat (mapStat.mapId)}
							{@const total = mapStat.wins + mapStat.losses}
							{@const winPercentage = (mapStat.wins / total) * 100}
							{@const lossPercentage = (mapStat.losses / total) * 100}
							<li
								class="grid grid-cols-[auto_1fr] items-center gap-2 rounded-lg bg-slate-800/50 p-2"
							>
								<MapIcon mapId={mapStat.mapId as import('$lib/data/game').GameMap} />
								<div class="flex flex-col gap-1">
									<div class="flex justify-between text-xs">
										<span class="text-white">{MAP_NAMES[mapStat.mapId]()}</span>
										<span class="text-slate-400">{mapStat.winrate.toFixed(0)}% ({total})</span>
									</div>
									<div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-600">
										<div class="flex h-full">
											<div
												class="h-full bg-green-500"
												style="width: {winPercentage.toFixed(0)}%;"
												title="{mapStat.wins} wins"
											></div>
											<div
												class="h-full bg-red-500"
												style="width: {lossPercentage.toFixed(0)}%;"
												title="{mapStat.losses} losses"
											></div>
										</div>
									</div>
									<div class="flex justify-between text-xs text-gray-400">
										<span>{m.wins_label()}: {mapStat.wins}</span>
										<span>{m.losses_label()}: {mapStat.losses}</span>
									</div>
								</div>
							</li>
						{/each}
					{:else}
						<li class="text-center text-gray-400">{m.no_data()}</li>
					{/if}
				</ul>
			</div>

			<PlayerRadarGraph playerStats={data.playerStats} />

			{#if data.playerEvents}
				<div class="md:col-span-3">
					<h2 class="my-5 text-xl font-bold">{m.attended_events()}</h2>
					<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
						{#if data.playerEvents.length > 0}
							{#each data.playerEvents as event (event.slug)}
								{#if event}
									<lib
										class="grid grid-rows-[auto] gap-2 overflow-hidden rounded-sm bg-gray-800 shadow-2xl"
									>
										<a href="/events/{event.slug}" class="contents">
											<div class="flex h-full w-full items-center justify-center bg-gray-700">
												<img src={event.imageURL} alt={event.name} class="w-full object-cover" />
											</div>
											<div class="h-full p-4 text-white">{event.name}</div>
										</a>
									</lib>
								{/if}
							{/each}
						{:else}
							<li class="text-center text-gray-400">{m.no_data()}</li>
						{/if}
					</ul>
				</div>
			{/if}

			<div class="md:col-span-3">
				<h2 class="my-5 text-xl font-bold">{m.recent_matches()}</h2>
				<ul class="flex flex-col gap-2">
					{#if data.playerMatches.length > 0}
						{#each data.playerMatches.toSorted((a, b) => {
							const dateA = new Date(a.event.date).getTime();
							const dateB = new Date(b.event.date).getTime();
							return dateB - dateA;
						}) as match (match.id)}
							{#if match}
								<MatchCard
									{match}
									teamIndex={match.playerTeamIndex}
									event={match.event}
									teams={data.teams}
								/>
							{/if}
						{/each}
					{:else}
						<li class="text-center text-gray-400">{m.no_data()}</li>
					{/if}
				</ul>
			</div>
		</div>
	</main>
{/if}
