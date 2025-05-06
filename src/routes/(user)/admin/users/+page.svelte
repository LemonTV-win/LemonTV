<script lang="ts">
	import type { PageServerData } from './$types';
	import { m } from '$lib/paraglide/messages';
	import { enhance } from '$app/forms';
	import type { Role } from '$lib/server/db/schema';

	let { data }: { data: PageServerData } = $props();
	let searchQuery = $state('');
	let errorMessage = $state('');
	let successMessage = $state('');
	let editingRole: Role | null = $state(null);
	let newRoleName = $state('');

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

		enhance(form, ({ update }) => {
			update();
			successMessage = action === 'add' ? 'Role added successfully' : 'Role removed successfully';
			setTimeout(() => {
				successMessage = '';
			}, 3000);
		});
	}

	function handleRoleForm(event: SubmitEvent) {
		errorMessage = '';
		successMessage = '';

		const form = event.target as HTMLFormElement;
		enhance(form, ({ update }) => {
			update();
			successMessage = editingRole ? 'Role updated successfully' : 'Role created successfully';
			setTimeout(() => {
				successMessage = '';
				editingRole = null;
				newRoleName = '';
			}, 3000);
		});
	}

	function handleDeleteRole(event: SubmitEvent) {
		errorMessage = '';
		successMessage = '';

		const form = event.target as HTMLFormElement;
		enhance(form, ({ update }) => {
			update();
			successMessage = 'Role deleted successfully';
			setTimeout(() => {
				successMessage = '';
			}, 3000);
		});
	}

	function startEditRole(role: Role) {
		editingRole = role;
		newRoleName = role.name;
	}

	function cancelEditRole() {
		editingRole = null;
		newRoleName = '';
	}
</script>

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

	<div class="grid grid-cols-3 gap-6">
		<div class="col-span-2">
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
							<th class="px-4 py-1">{m.id()}</th>
							<th class="px-4 py-1">{m.username()}</th>
							<th class="px-4 py-1">{m.roles()}</th>
							<th class="px-4 py-1">{m.created_at()}</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredUsers as user}
							<tr class="border-b-1 border-gray-500 bg-gray-800 px-4 py-2 shadow-2xl">
								<td class="px-4 py-1 text-white">{user.id}</td>
								<td class="px-4 py-1 text-white">{user.username}</td>
								<td class="px-4 py-1">
									<div class="flex flex-wrap gap-2">
										{#each getUserRoles(user.id) as role}
											<form
												method="POST"
												action="?/updateRole"
												on:submit={handleRoleUpdate}
												class="inline-flex items-center gap-1"
											>
												<input type="hidden" name="userId" value={user.id} />
												<input type="hidden" name="roleId" value={role.id} />
												<input type="hidden" name="action" value="remove" />
												<span
													class="rounded-full bg-yellow-500/20 px-2 py-0.5 text-sm text-yellow-300"
												>
													{role.name}
												</span>
												<button
													type="submit"
													class="text-red-400 hover:text-red-300"
													title="Remove role"
												>
													×
												</button>
											</form>
										{/each}
										<form
											method="POST"
											action="?/updateRole"
											on:submit={handleRoleUpdate}
											class="inline-flex items-center gap-1"
										>
											<input type="hidden" name="userId" value={user.id} />
											<input type="hidden" name="action" value="add" />
											<select
												name="roleId"
												class="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-sm text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
											>
												<option value="">Add role...</option>
												{#each data.roles.filter((role) => !getUserRoles(user.id).some((r) => r.id === role.id)) as role}
													<option value={role.id}>{role.name}</option>
												{/each}
											</select>
											<button
												type="submit"
												class="rounded-md bg-yellow-500 px-2 py-0.5 text-sm font-medium text-black hover:bg-yellow-600"
											>
												Add
											</button>
										</form>
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

		<div class="col-span-1">
			<div class="rounded-lg border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
				<h3 class="mb-4 text-xl font-semibold text-white">Role Management</h3>
				<form
					method="POST"
					action={editingRole ? '?/updateRoleName' : '?/createRole'}
					on:submit={handleRoleForm}
					class="space-y-4"
				>
					{#if editingRole}
						<input type="hidden" name="id" value={editingRole.id} />
					{/if}
					<div>
						<label class="block text-sm font-medium text-slate-300" for="roleName">
							{editingRole ? 'Edit Role' : 'New Role'}
						</label>
						<input
							type="text"
							id="roleName"
							name="name"
							bind:value={newRoleName}
							class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
							placeholder="Role name"
						/>
					</div>
					<div class="flex justify-end gap-2">
						{#if editingRole}
							<button
								type="button"
								class="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
								on:click={cancelEditRole}
							>
								Cancel
							</button>
						{/if}
						<button
							type="submit"
							class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600"
						>
							{editingRole ? 'Update' : 'Create'}
						</button>
					</div>
				</form>

				<div class="mt-6">
					<h4 class="mb-2 text-sm font-medium text-slate-300">Existing Roles</h4>
					<div class="space-y-2">
						{#each data.roles as role}
							<div
								class="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800 p-2"
							>
								<span class="text-white">{role.name}</span>
								<div class="flex gap-2">
									<button
										type="button"
										class="text-yellow-500 hover:text-yellow-400"
										on:click={() => startEditRole(role)}
									>
										Edit
									</button>
									<form
										method="POST"
										action="?/deleteRole"
										on:submit={handleDeleteRole}
										class="inline"
									>
										<input type="hidden" name="id" value={role.id} />
										<button type="submit" class="text-red-400 hover:text-red-300"> Delete </button>
									</form>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</main>
