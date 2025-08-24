<script lang="ts">
	import { error } from '@sveltejs/kit';
	import { m } from '$lib/paraglide/messages.js';
	import PlayerAvatar from '$lib/components/PlayerAvatar.svelte';
	import SocialLinks from '$lib/components/SocialLinks.svelte';
	import NationalityFlag from '$lib/components/NationalityFlag.svelte';
	import { getAllNames } from '$lib/data/players';
	import ContentActionLink from '$lib/components/ContentActionLink.svelte';
	import { onMount } from 'svelte';
	import { isActive, isCoaching, isFormer } from '$lib/data/teams';

	let {
		player,
		user,
		socialPlatforms
	}: {
		player: {
			id: string;
			name: string;
			avatarURL: string | null;
			avatar?: string;
			nationalities: string[];
			teams?: {
				slug: string;
				name: string;
				role: 'active' | 'substitute' | 'former' | 'coach' | 'manager' | 'owner';
				endedOn?: string;
			}[];
			socialAccounts?: {
				platformId: string;
				accountId: string;
				overridingUrl?: string;
			}[];
			gameAccounts: {
				currentName: string;
				names?: string[] | undefined;
			}[];
			aliases: string[];
		};
		user: {
			roles: string[];
		} | null;
		socialPlatforms: {
			id: string;
			name: string;
			url_template: string | null;
		}[];
	} = $props();

	if (!player) {
		throw error(404, 'Player not found');
	}

	let gradientStyle = $state('');

	// Function to extract dominant colors from an image

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
		tempImg.src = player?.avatarURL || player?.avatar || '';
	});
</script>

<div class="glass overflow-hidden rounded-2xl">
	<div class="p-6" style={gradientStyle ? `background: ${gradientStyle}` : ''}>
		<PlayerAvatar {player} class="mx-auto h-32 w-32" />
	</div>
	<div class="flex flex-col gap-4 p-6">
		<div class="flex flex-col items-center gap-2">
			<h1 class="flex flex-col items-center gap-2 text-center text-2xl font-bold">
				<span class="text-white">{player.name}</span>
				<span class="inline-flex flex-col gap-2">
					{#each getAllNames(player).filter((name) => name !== player.name) as name (name)}
						<span class="text-sm text-gray-400">({name})</span>
					{/each}
				</span>
			</h1>
			{#if ['admin', 'editor'].some((role) => user?.roles.includes(role))}
				<ContentActionLink href={`/admin/players?action=edit&id=${player.id}`} type="edit" />
			{/if}
		</div>
		{#if player.nationalities.length}
			<p class="flex flex-wrap justify-center gap-4 text-center text-gray-400">
				{#each player.nationalities as nationality, idx (idx)}
					<span class="flex items-center gap-1">
						<NationalityFlag {nationality} showLabel />
					</span>
				{/each}
			</p>
		{/if}
		{#if player.socialAccounts?.length}
			<div class="flex justify-center">
				<SocialLinks socialAccounts={player.socialAccounts} {socialPlatforms} iconSize="h-5 w-5" />
			</div>
		{/if}
		{#if player.teams?.filter(isActive).length}
			<div class="grid grid-cols-1 gap-4 py-4 sm:grid-cols-[auto_1fr]">
				<h3 class="text-lg font-bold">
					{m['content.players.current_teams']({
						count: player.teams.filter(isActive).length
					})}
				</h3>
				<ul class="text-right">
					{#each player.teams.filter(isActive) as team (team.slug)}
						{#if team}
							<li>
								<a href={`/teams/${team.slug}`} class="text-yellow-500 hover:text-yellow-400">
									{team.name}
									{#if team.role !== 'active'}
										<span class="text-sm text-gray-400"> ({team.role})</span>
									{/if}
								</a>
							</li>
						{/if}
					{/each}
				</ul>
			</div>
		{/if}
		{#if player.teams?.filter(isCoaching).length}
			<div class="grid grid-cols-1 gap-4 py-4 sm:grid-cols-[auto_1fr]">
				<h3 class="text-lg font-bold">
					{m['content.players.coaching_teams']({
						count: player.teams.filter(isCoaching).length
					})}
				</h3>
				<ul class="text-right">
					{#each player.teams.filter(isCoaching) as team (team.slug)}
						{#if team}
							<li>
								<a href={`/teams/${team.slug}`} class="text-yellow-500 hover:text-yellow-400">
									{team.name}
									{#if team.role !== 'coach'}
										<span class="text-sm text-gray-400"> ({team.role})</span>
									{/if}
								</a>
							</li>
						{/if}
					{/each}
				</ul>
			</div>
		{/if}
		{#if player.teams?.filter(isFormer).length}
			<div class="grid grid-cols-1 gap-4 py-4 sm:grid-cols-[auto_1fr]">
				<h3 class="text-lg font-bold">
					{m['content.players.former_teams']({
						count: player.teams.filter(isFormer).length
					})}
				</h3>
				<ul class="text-right">
					{#each player.teams.filter(isFormer) as team (team.slug)}
						{#if team}
							<li>
								<a href={`/teams/${team.slug}`} class="text-yellow-500 hover:text-yellow-400">
									{team.name}
									{#if team.role !== 'active'}
										<span class="text-sm text-gray-400"> ({team.role})</span>
									{/if}
									{#if team.endedOn}
										<span class="text-sm text-gray-400"> - {team.endedOn}</span>
									{/if}
								</a>
							</li>
						{/if}
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</div>
