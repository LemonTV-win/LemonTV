<script lang="ts">
	import type { PageServerData } from './$types';
	import { m } from '$lib/paraglide/messages';

	let { data }: { data: PageServerData } = $props();
</script>

<main class="p-4">
	<h1 class="text-2xl font-bold">{m.admin_dashboard()}</h1>
	<h2 class="text-xl font-bold">{m.users()}</h2>
	<table class="w-full border-collapse">
		<thead>
			<tr class="bg-gray-900">
				<th class="border border-gray-300 p-2 text-left">ID</th>
				<th class="border border-gray-300 p-2 text-left">{m.username()}</th>
				<th class="border border-gray-300 p-2 text-left">{m.created_at()}</th>
			</tr>
		</thead>
		<tbody>
			{#each data.users as user}
				<tr class="hover:bg-gray-800">
					<td class="border border-gray-300 p-2">{user.id}</td>
					<td class="border border-gray-300 p-2">{user.username}</td>
					<td class="border border-gray-300 p-2">{new Date(user.createdAt).toLocaleString()}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</main>
