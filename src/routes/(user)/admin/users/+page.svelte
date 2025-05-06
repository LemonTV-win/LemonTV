<script lang="ts">
	import type { PageServerData } from './$types';
	import { m } from '$lib/paraglide/messages';

	let { data }: { data: PageServerData } = $props();
	let searchQuery = $state('');

	let filteredUsers = $derived(
		data.users.filter((user) => {
			const searchLower = searchQuery.toLowerCase();
			return (
				user.username.toLowerCase().includes(searchLower) ||
				user.id.toLowerCase().includes(searchLower)
			);
		})
	);
</script>

<main class="mx-auto max-w-screen-lg px-4">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold">{m.admin_dashboard()}</h1>
		<h2 class="text-xl font-bold">{m.users()}</h2>
	</div>

	<div class="mb-4">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="Search users..."
			class="w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
		/>
	</div>

	<div class="overflow-x-auto">
		<table class="w-full table-auto border-collapse border-y-2 border-gray-500 bg-gray-800">
			<thead>
				<tr class="border-b-2 border-gray-500 text-left text-sm text-gray-400">
					<th class="px-4 py-1">ID</th>
					<th class="px-4 py-1">Username</th>
					<th class="px-4 py-1">Created At</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredUsers as user}
					<tr class="border-b-1 border-gray-500 bg-gray-800 px-4 py-2 shadow-2xl">
						<td class="px-4 py-1 text-white">{user.id}</td>
						<td class="px-4 py-1 text-white">{user.username}</td>
						<td class="px-4 py-1 text-gray-300">
							{new Date(user.createdAt).toLocaleString()}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</main>
