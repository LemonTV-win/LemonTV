<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import ContentActionLink from '$lib/components/ContentActionLink.svelte';
	import type { PageData } from './$types';
	import CommunityTagComponent from '$lib/components/tags/CommunityTag.svelte';
	import type { CommunityTag } from '$lib/data/community';

	let { data }: { data: PageData } = $props();

	const toolsAndResources = [
		{
			title: 'Strinova Wiki',
			url: 'https://strinova.org/wiki/Main_Page'
		},
		{
			title: '卡拉彼丘WIKI',
			url: 'https://wiki.biligame.com/klbq/%E9%A6%96%E9%A1%B5'
		},
		{
			title: 'Strinova Map Assistant',
			url: 'https://strinova.fsltech.cn/'
		},
		{
			title: 'Lemonade',
			url: 'https://lemonade.mkpo.li/',
			description: 'Strinova Utility Lineups'
		},
		{
			title: 'カラビヤウ（ストリノヴァ）中国語単語帳',
			url: 'https://docs.google.com/spreadsheets/d/1H-C2nFi11dSbqhQ6-_3QgBjw99LslWnazGd_tSvWKGM/edit?usp=sharing',
			description: '(Chinese-Japanese glossary of Calabiyau/Strinova)'
		},
		{
			title: 'Strinova Map Callouts (English, nbound version)',
			url: 'https://drive.google.com/drive/folders/1S7XA8S66zZiliM5vBmeqdIPrXUKn6kWL'
		}
	];

	const speedrunLinks = [
		{
			title: 'Speedrun.com (Strinova)',
			url: 'https://www.speedrun.com/Strinova'
		}
	];

	const forums = [
		{
			title: 'r/Strinova - Reddit',
			url: 'https://www.reddit.com/r/Strinova/'
		},
		{
			title: 'Strinova General Discussions - Steam Community',
			url: 'https://steamcommunity.com/app/1282270/discussions/'
		}
	];

	function sortTagsByCategory(tags: CommunityTag[]) {
		return [...tags].toSorted((a, b) => {
			const categoryA = a.category;
			const categoryB = b.category;

			if (categoryA !== categoryB) {
				return categoryA.localeCompare(categoryB);
			}

			return a.value.localeCompare(b.value);
		});
	}
</script>

<main class="mx-auto max-w-screen-lg">
	<h1 class="my-10 flex items-center gap-4 text-2xl font-bold">
		{m.community()}
		{#if ['admin', 'editor'].some((role) => data.user?.roles.includes(role))}
			<ContentActionLink href="/admin/community" type="edit" />
		{/if}
	</h1>

	<h2 class="text-xl font-bold">Discord</h2>
	<div class="m-4 grid grid-cols-1 gap-4 p-2 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.discordServers as link (link.url)}
			<div
				class="glass-card group flex items-start gap-3 rounded-lg p-4 transition-all hover:bg-white/5"
			>
				<button
					onclick={() => window.open(link.url, '_blank')}
					class="flex flex-1 items-start gap-3 text-left"
				>
					<img
						src={link.icon}
						alt="Discord"
						class="h-12 w-12 flex-shrink-0 rounded-2xl object-cover"
					/>
					<div class="flex flex-col">
						<span class="text-yellow-300 group-hover:text-yellow-400 group-hover:underline"
							>{link.title}</span
						>
						{#if link.description}
							<span class="text-sm text-gray-400">{link.description}</span>
						{/if}
						{#if link.tags && link.tags.length > 0}
							<div class="mt-2 flex flex-wrap gap-2">
								{#each sortTagsByCategory(link.tags) as tag (tag.id)}
									<CommunityTagComponent {tag} />
								{/each}
							</div>
						{/if}
						{#if link.additionalLink}
							<a
								href={link.additionalLink.url}
								class="mt-1 text-sm text-blue-400 hover:text-blue-300 hover:underline"
								onclick={(event) => {
									if (link.additionalLink) {
										window.open(link.additionalLink.url, '_blank');
									}
									event.stopPropagation();
								}}
							>
								{link.additionalLink.text}
							</a>
						{/if}
					</div>
				</button>
			</div>
		{/each}
	</div>

	<h2 class="text-xl font-bold">{m.tools_resources()}</h2>
	<ul class="m-4 flex flex-col flex-wrap gap-4 p-2">
		{#each toolsAndResources as resource (resource.url)}
			<li class="glass-card rounded-lg p-4">
				<a
					href={resource.url}
					class="text-yellow-300 hover:text-yellow-400 hover:underline"
					target="_blank">{resource.title}</a
				>
				{#if resource.description}
					{resource.description}
				{/if}
			</li>
		{/each}
	</ul>

	<h2 class="text-xl font-bold">Forums</h2>
	<ul class="m-4 flex flex-col flex-wrap gap-4 p-2">
		{#each forums as forum (forum.url)}
			<li class="glass-card rounded-lg p-4">
				<a
					href={forum.url}
					class="text-yellow-300 hover:text-yellow-400 hover:underline"
					target="_blank">{forum.title}</a
				>
			</li>
		{/each}
	</ul>

	<h2 class="text-xl font-bold">Speedrun</h2>
	<ul class="m-4 flex flex-col flex-wrap gap-4 p-2">
		{#each speedrunLinks as link (link.url)}
			<li class="glass-card rounded-lg p-4">
				<a
					href={link.url}
					class="text-yellow-300 hover:text-yellow-400 hover:underline"
					target="_blank">{link.title}</a
				>
			</li>
		{/each}
	</ul>
</main>
