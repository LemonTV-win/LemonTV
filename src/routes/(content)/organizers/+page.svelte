<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import type { PageProps } from './$types';
	import IconParkSolidEdit from '~icons/icon-park-solid/edit';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.organizers()} | LemonTV</title>
</svelte:head>

<main class="mx-auto max-w-screen-lg md:px-4">
	<h1 class="mx-0 my-10 flex items-center gap-4 text-2xl font-bold md:mx-4">
		{m.organizers()}
		{#if ['admin', 'editor'].some((role) => data.user?.roles.includes(role))}
			<a
				href="/admin/organizers"
				class="flex items-center gap-1 rounded-md border border-gray-700 px-2 py-1 text-sm text-gray-400 transition-all duration-200 hover:bg-gray-700"
			>
				<IconParkSolidEdit class="h-4 w-4" />
				{m.edit()}
			</a>
		{/if}
	</h1>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.organizers as organizer}
			<a
				href="/organizers/{organizer.slug}"
				class="glass-card flex flex-col items-center gap-4 p-4 transition-all duration-200 hover:bg-gray-700"
			>
				<img
					src={organizer.logo}
					alt={organizer.name}
					class="h-24 w-24 rounded-full object-cover"
				/>
				<div class="text-center">
					<h2 class="text-xl font-bold">{organizer.name}</h2>
					<!-- {#if organizer.description}
						<p class="mt-2 text-sm text-gray-400">{organizer.description}</p>
					{/if} -->
				</div>
			</a>
		{/each}
	</div>
</main>
