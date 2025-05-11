<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';

	const discordLinks = [
		{
			title: 'Strinova Esports Hub',
			url: 'https://discord.gg/mY8DMatXM4',
			icon: 'https://cdn.discordapp.com/icons/1371077914723881010/17d112c45f5dbeac98c746c158605696.webp',
			description:
				'A community hub for Strinova esports, where LemonTV and other content creators come together to discuss the game and plan events.'
		},
		{
			title: 'Official Strinova Discord Server',
			url: 'https://discord.com/invite/strinova',
			icon: 'https://cdn.discordapp.com/icons/1182952140684136470/b05a9cb0f65b845b6d2ad7a63182081d.webp',
			additionalLink: {
				text: '#tournament-chat',
				url: 'https://discord.com/channels/1182952140684136470/1320683196698066954'
			},
			description: 'The main community hub for Strinova players worldwide'
		},
		{
			title: 'Strinova EMEA Discord Server',
			url: 'https://discord.gg/jE7U2QF7wu',
			icon: 'https://cdn.discordapp.com/icons/1295118437558784133/51deb9f0029544e2a5a7b52ac8c61e60.webp',
			description: 'Community server for European, Middle Eastern, and African players'
		},
		{
			title: 'カラビヤウの民 (Japanese)',
			url: 'https://discord.gg/SZuKAqNMY2',
			icon: 'https://cdn.discordapp.com/icons/1168299045677170810/8dab2a5366f3f942cb028cf6b116863a.webp',
			description: 'Japanese community server for Strinova players'
		},
		{
			title: 'Strinova NA Discord Server',
			url: 'https://discord.gg/jcEduEqgzB',
			icon: 'https://cdn.discordapp.com/icons/1368791947262689391/a_9f90141dd17e8e64dfe448ec951ab9ef.webp',
			description: 'North American community server for Strinova players'
		},
		{
			title: 'NA STRINOVA SATURDAYS Discord Server',
			url: 'https://discord.gg/WWSDkXgDdw',
			icon: 'https://cdn.discordapp.com/icons/1364059848786055239/c5d3c8caeb7b1a915950c9659a4e843d.webp',
			description: 'Weekly tournament and community events for North American players'
		},
		{
			title: 'Strinova Wiki Discord Server',
			url: 'https://discord.gg/bmbzgKmqfD',
			icon: 'https://cdn.discordapp.com/icons/1262324630157393930/83aa3a090c4bfb335e644d6ecd51a579.webp',
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
	<div class="m-4 grid grid-cols-1 gap-4 p-2 sm:grid-cols-2 lg:grid-cols-3">
		{#each discordLinks as link}
			<div
				class="glass-card group flex items-start gap-3 rounded-lg p-4 transition-all hover:bg-white/5"
			>
				<button
					on:click={() => window.open(link.url, '_blank')}
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
						{#if link.additionalLink}
							<a
								href={link.additionalLink.url}
								class="mt-1 text-sm text-blue-400 hover:text-blue-300 hover:underline"
								on:click|stopPropagation
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
		{#each toolsAndResources as resource}
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

	<h2 class="text-xl font-bold">Speedrun</h2>
	<ul class="m-4 flex flex-col flex-wrap gap-4 p-2">
		{#each speedrunLinks as link}
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
