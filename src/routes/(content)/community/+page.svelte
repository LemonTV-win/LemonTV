<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';

	const discordLinks = [
		{
			title: 'Official Strinova Discord Server',
			url: 'https://discord.com/invite/strinova',
			additionalLink: {
				text: '#tournament-chat',
				url: 'https://discord.com/channels/1182952140684136470/1320683196698066954'
			},
			description: 'The main community hub for Strinova players worldwide'
		},
		{
			title: 'Strinova EMEA Discord Server',
			url: 'https://discord.gg/jE7U2QF7wu',
			description: 'Community server for European, Middle Eastern, and African players'
		},
		{
			title: 'カラビヤウの民 (Japanese)',
			url: 'https://discord.gg/SZuKAqNMY2',
			description: 'Japanese community server for Strinova players'
		},
		{
			title: 'Strinova NA Discord Server',
			url: 'https://discord.gg/jcEduEqgzB',
			description: 'North American community server for Strinova players'
		},
		{
			title: 'NA STRINOVA SATURDAYS Discord Server',
			url: 'https://discord.gg/WWSDkXgDdw',
			description: 'Weekly tournament and community events for North American players'
		},
		{
			title: 'Strinova Wiki Discord Server',
			url: 'https://discord.gg/bmbzgKmqfD',
			description: 'Community-driven wiki and resource hub for Strinova'
		}
	];

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
</script>

<svelte:head>
	<title>{m.community()} | LemonTV</title>
</svelte:head>

<main class="mx-auto max-w-screen-lg">
	<h1 class="my-10 text-2xl font-bold">{m.community()}</h1>

	<h2 class="text-xl font-bold">Discord</h2>
	<ul class="m-4 flex flex-col flex-wrap gap-4 p-2">
		{#each discordLinks as link}
			<li class="flex items-center gap-2 rounded-md bg-gray-800 p-2">
				<div class="flex flex-col">
					<a
						href={link.url}
						class="text-yellow-300 hover:text-yellow-400 hover:underline"
						target="_blank">{link.title}</a
					>
					{#if link.description}
						<span class="text-sm text-gray-400">{link.description}</span>
					{/if}
				</div>
				{#if link.additionalLink}
					-
					<a href={link.additionalLink.url}>{link.additionalLink.text}</a>
				{/if}
			</li>
		{/each}
	</ul>

	<h2 class="text-xl font-bold">{m.tools_resources()}</h2>
	<ul class="m-4 flex flex-col flex-wrap gap-4 p-2">
		{#each toolsAndResources as resource}
			<li class="flex items-center gap-2 rounded-md bg-gray-800 p-2">
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

	<h2 class="text-xl font-bold">Speedrun</h2>
	<ul class="m-4 flex flex-col flex-wrap gap-4 p-2">
		{#each speedrunLinks as link}
			<li class="flex items-center gap-2 rounded-md bg-gray-800 p-2">
				<a
					href={link.url}
					class="text-yellow-300 hover:text-yellow-400 hover:underline"
					target="_blank">{link.title}</a
				>
			</li>
		{/each}
	</ul>
</main>
