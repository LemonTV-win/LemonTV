<script lang="ts">
	import type { PageServerData } from './$types';
	import { m } from '$lib/paraglide/messages';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { Role } from '$lib/server/db/schema';
	import { browser } from '$app/environment';

	import IconParkSolidShield from '~icons/icon-park-solid/shield';
	import IconParkSolidDeleteFive from '~icons/icon-park-solid/delete-five';

	let { data }: { data: PageServerData } = $props();
	let searchQuery = $state(data.searchQuery || '');
	let errorMessage = $state('');
	let successMessage = $state('');
	let editingRole: Role | null = $state(null);
	let newRoleName = $state('');
	let newRoleId = $state('');
	let innerWidth = $state(browser ? window.innerWidth : 0);
	let showRolePanel = $derived(innerWidth >= 1024);

	$effect(() => {
		const url = new URL(window.location.href);
		if (searchQuery) {
			url.searchParams.set('searchQuery', searchQuery);
		} else {
			url.searchParams.delete('searchQuery');
		}
		goto(url.toString(), { replaceState: true });
	});

	let filteredUsers = $derived(
		data.users.filter((user) => {
			const searchLower = searchQuery.toLowerCase();
			return (
				user.username.toLowerCase().includes(searchLower) ||
				user.id.toLowerCase().includes(searchLower)
			);
		})
	);

	function getUserRoles(userId: string) {
		return data.userRoles
			.filter((ur) => ur.userId === userId)
			.map((ur) => data.roles.find((r) => r.id === ur.roleId))
			.filter((r): r is Role => r !== undefined);
	}

	function handleRoleUpdate(event: SubmitEvent) {
		errorMessage = '';
		successMessage = '';

		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		const action = formData.get('action') as 'add' | 'remove';

		enhance(form, () => async ({ update }) => {
			await update();
			successMessage =
				action === 'add' ? m.role_added_successfully() : m.role_removed_successfully();
			setTimeout(() => {
				successMessage = '';
			}, 3000);
		});
	}

	function handleRoleForm(event: SubmitEvent) {
		errorMessage = '';
		successMessage = '';

		const form = event.target as HTMLFormElement;
		enhance(form, () => async ({ update }) => {
			await update();
			successMessage = editingRole ? m.role_updated_successfully() : m.role_created_successfully();
			setTimeout(() => {
				successMessage = '';
				editingRole = null;
				newRoleName = '';
				newRoleId = '';
			}, 3000);
		});
	}

	function handleDeleteRole(event: SubmitEvent) {
		errorMessage = '';
		successMessage = '';

		const form = event.target as HTMLFormElement;
		enhance(form, () => async ({ update }) => {
			await update();
			successMessage = m.role_deleted_successfully();
			setTimeout(() => {
				successMessage = '';
			}, 3000);
		});
	}

	function startEditRole(role: Role) {
		editingRole = role;
		newRoleName = role.name;
		newRoleId = role.id;
	}

	function cancelEditRole() {
		editingRole = null;
		newRoleName = '';
		newRoleId = '';
	}

	function toggleRolePanel() {
		showRolePanel = !showRolePanel;
	}
</script>

<svelte:head>
	<title>{m.users()} | {m.admin_panel()} | LemonTV</title>
</svelte:head>

<svelte:window bind:innerWidth />

<main class="mx-auto max-w-screen-lg px-4">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold">{m.admin_dashboard()}</h1>
		<h2 class="text-xl font-bold">{m.users()}</h2>
	</div>

	{#if errorMessage}
		<div class="mb-4 rounded-md bg-red-900/50 p-4 text-red-200" role="alert">
			<span class="block sm:inline">{errorMessage}</span>
		</div>
	{/if}

	{#if successMessage}
		<div class="mb-4 rounded-md bg-green-900/50 p-4 text-green-200" role="alert">
			<span class="block sm:inline">{successMessage}</span>
		</div>
	{/if}

	<div class="relative">
		<div class="grid grid-cols-3 gap-6">
			<div class="{showRolePanel ? 'col-span-2' : 'col-span-3'} transition-all duration-300">
				<div class="mb-4 flex items-stretch gap-4">
					<input
						type="text"
						bind:value={searchQuery}
						placeholder={m.search_users()}
						class="h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					/>
					{#if !showRolePanel}
						<button
							class="flex h-10 items-center gap-2 rounded bg-gray-800 px-3 text-sm font-semibold text-yellow-400 transition-colors hover:bg-gray-700 hover:text-yellow-300"
							onclick={toggleRolePanel}
						>
							<IconParkSolidShield class="h-5 w-5" />
							<span>{m.roles()}</span>
						</button>
					{/if}
				</div>

				<div
					class="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-800"
				>
					<table class="w-full table-auto border-collapse border-y-2 border-gray-500 bg-gray-800">
						<thead>
							<tr class="border-b-2 border-gray-500 text-left text-sm text-gray-400">
								<th class="px-4 py-1">{m.user_id()}</th>
								<th class="px-4 py-1">{m.username()}</th>
								<th class="px-4 py-1">{m.email()}</th>
								<th class="px-4 py-1">{m.roles()}</th>
								<th class="px-4 py-1">{m.created_at()}</th>
							</tr>
						</thead>
						<tbody>
							{#each filteredUsers as user (user.id)}
								<tr class="border-b-1 border-gray-500 bg-gray-800 px-4 py-2 shadow-2xl">
									<td class="px-4 py-1 text-white">{user.id}</td>
									<td class="px-4 py-1 text-white">{user.username}</td>
									<td class="px-4 py-1 text-white">{user.email}</td>
									<td class="px-4 py-1">
										<div class="flex flex-wrap gap-1.5 py-2">
											{#each getUserRoles(user.id) as role (role.id)}
												<form
													method="POST"
													action="?/updateRole"
													onsubmit={handleRoleUpdate}
													class="inline-flex items-center gap-1"
												>
													<input type="hidden" name="userId" value={user.id} />
													<input type="hidden" name="roleId" value={role.id} />
													<input type="hidden" name="action" value="remove" />
													<span
														class="inline-flex items-center gap-1 rounded-sm bg-yellow-500/20 px-1.5 py-0.5 text-sm text-yellow-300"
														title={role.id}
													>
														{role.name}
														<button
															type="submit"
															class="flex h-4 w-4 items-center justify-center transition-colors hover:text-red-500"
															title={m.delete()}
														>
															<IconParkSolidDeleteFive class="h-3 w-3" />
														</button>
													</span>
												</form>
											{/each}
											{#if data.roles.filter((role) => !getUserRoles(user.id).some((r) => r.id === role.id)).length > 0}
												<form
													method="POST"
													action="?/updateRole"
													onsubmit={handleRoleUpdate}
													class="grid grid-cols-[1fr_auto] items-center gap-1.5"
												>
													<input type="hidden" name="userId" value={user.id} />
													<input type="hidden" name="action" value="add" />
													<select
														name="roleId"
														class="w-full min-w-30 rounded-md border border-slate-700 bg-slate-800 py-0.5 pl-2 text-sm text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
													>
														{#each data.roles.filter((role) => !getUserRoles(user.id).some((r) => r.id === role.id)) as role (role.id)}
															<option value={role.id}>{role.name}</option>
														{/each}
													</select>
													<button
														type="submit"
														title={m.add_role()}
														class="rounded-md bg-yellow-500 px-2 py-0.5 text-sm font-medium text-black hover:bg-yellow-600 disabled:opacity-50"
													>
														{m.add()}
													</button>
												</form>
											{/if}
										</div>
									</td>
									<td class="px-4 py-1 text-gray-300">
										{new Date(user.createdAt).toLocaleString()}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			{#if showRolePanel}
				<div class="relative col-span-1 transition-all duration-300">
					<div
						class="w-80 rounded-lg border border-slate-800 bg-slate-900/70 p-6 shadow-lg transition-all duration-300"
					>
						<div class="mb-4 flex items-center justify-between">
							<h3 class="text-xl font-semibold text-white">{m.role_management()}</h3>
							<button
								class="rounded-full bg-gray-800 p-1 text-white shadow hover:bg-gray-700"
								onclick={toggleRolePanel}
								aria-label="Collapse role management"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fill-rule="evenodd"
										d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
										clip-rule="evenodd"
									/>
								</svg>
							</button>
						</div>
						<form
							method="POST"
							action={editingRole ? '?/updateRoleName' : '?/createRole'}
							onsubmit={handleRoleForm}
							class="space-y-4"
						>
							{#if editingRole}
								<input type="hidden" name="oldId" value={editingRole.id} />
							{/if}
							<div>
								<label class="block text-sm font-medium text-slate-300" for="roleId">
									{editingRole ? m.edit_role_id() : m.new_role_id()}
								</label>
								<input
									type="text"
									id="roleId"
									name="id"
									bind:value={newRoleId}
									class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
									placeholder={m.role_id()}
								/>
							</div>
							<div>
								<label class="block text-sm font-medium text-slate-300" for="roleName">
									{editingRole ? m.edit_role_name() : m.new_role_name()}
								</label>
								<input
									type="text"
									id="roleName"
									name="name"
									bind:value={newRoleName}
									class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
									placeholder={m.role_name()}
								/>
							</div>
							<div class="flex justify-end gap-2">
								{#if editingRole}
									<button
										type="button"
										class="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
										onclick={cancelEditRole}
									>
										{m.cancel()}
									</button>
								{/if}
								<button
									type="submit"
									class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600"
								>
									{editingRole ? m.update() : m.create()}
								</button>
							</div>
						</form>
						<div class="mt-6">
							<h4 class="mb-2 text-sm font-medium text-slate-300">{m.existing_roles()}</h4>
							<div class="space-y-2">
								{#each data.roles as role (role.id)}
									<div
										class="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800 p-2"
									>
										<div class="flex flex-col">
											<span class="text-sm text-slate-400">{role.id}</span>
											<span class="text-white">{role.name}</span>
										</div>
										<div class="flex gap-2">
											<button
												type="button"
												class="text-yellow-500 hover:text-yellow-400"
												onclick={() => startEditRole(role)}>{m.edit()}</button
											>
											<form
												method="POST"
												action="?/deleteRole"
												onsubmit={handleDeleteRole}
												class="inline"
											>
												<input type="hidden" name="id" value={role.id} />
												<button type="submit" class="text-red-400 hover:text-red-300"
													>{m.delete()}</button
												>
											</form>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</main>
