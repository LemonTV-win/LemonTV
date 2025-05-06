<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';
	import type { ActionResult } from '@sveltejs/kit';
	import Eye from '~icons/lucide/eye';
	import EyeOff from '~icons/lucide/eye-off';
	import Lock from '~icons/lucide/lock';

	let { data }: { data: PageServerData } = $props();
	let error: string | null = $state(null);
	let success = $state(false);
	let showCurrentPassword = $state(false);
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);

	function handleSubmit() {
		return async ({ result }: { result: ActionResult }) => {
			if (result.type === 'error') {
				error = result.error?.message || 'An error occurred';
				success = false;
				console.log('error', error);
			} else if (result.type === 'success') {
				error = null;
				success = true;
				console.log('success', success);
			} else if (result.type === 'failure') {
				error = result.data?.error || 'Failed to change password';
				success = false;
				console.log('error', error);
			}
		};
	}
</script>

<main class="flex min-h-[calc(100dvh-9em)] flex-1 items-center justify-center p-4">
	<div class="w-full max-w-md">
		<div class="rounded-lg border border-slate-800 bg-slate-900/70 shadow-lg">
			<div class="space-y-1 p-6 text-center">
				<h1 class="text-2xl font-bold text-white">Profile Settings</h1>
				<p class="text-slate-400">Manage your account settings and security</p>
			</div>

			<div class="p-6">
				<div class="mb-8 rounded-md border border-slate-800 bg-slate-800/50 p-4">
					<p class="mb-2 text-xl font-medium text-white">Welcome, {data.user.username}!</p>
					<p class="text-sm text-slate-400">User ID: {data.user.id}</p>
				</div>

				<div class="mb-8">
					<h2 class="mb-4 text-xl font-semibold text-white">Change Password</h2>
					{#if error}
						<div class="mb-4 rounded-md bg-red-500/10 p-4 text-red-400">{error}</div>
					{/if}
					{#if success}
						<div class="mb-4 rounded-md bg-green-500/10 p-4 text-green-400">
							Password changed successfully!
						</div>
					{/if}
					<form
						method="post"
						action="?/changePassword"
						use:enhance={handleSubmit}
						class="space-y-4"
					>
						<div class="space-y-2">
							<label for="currentPassword" class="block text-white">Current Password</label>
							<div class="relative">
								<Lock
									class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-500"
								/>
								<input
									type={showCurrentPassword ? 'text' : 'password'}
									id="currentPassword"
									name="currentPassword"
									required
									class="w-full rounded-md border border-slate-700 bg-slate-800 py-2 pr-10 pl-10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
								/>
								<button
									type="button"
									onclick={() => (showCurrentPassword = !showCurrentPassword)}
									class="absolute top-1/2 right-3 -translate-y-1/2 transform text-slate-500 hover:text-slate-400"
								>
									{#if showCurrentPassword}
										<EyeOff class="h-4 w-4" />
									{:else}
										<Eye class="h-4 w-4" />
									{/if}
								</button>
							</div>
						</div>
						<div class="space-y-2">
							<label for="newPassword" class="block text-white">New Password</label>
							<div class="relative">
								<Lock
									class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-500"
								/>
								<input
									type={showNewPassword ? 'text' : 'password'}
									id="newPassword"
									name="newPassword"
									required
									class="w-full rounded-md border border-slate-700 bg-slate-800 py-2 pr-10 pl-10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
								/>
								<button
									type="button"
									onclick={() => (showNewPassword = !showNewPassword)}
									class="absolute top-1/2 right-3 -translate-y-1/2 transform text-slate-500 hover:text-slate-400"
								>
									{#if showNewPassword}
										<EyeOff class="h-4 w-4" />
									{:else}
										<Eye class="h-4 w-4" />
									{/if}
								</button>
							</div>
						</div>
						<div class="space-y-2">
							<label for="confirmPassword" class="block text-white">Confirm New Password</label>
							<div class="relative">
								<Lock
									class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-500"
								/>
								<input
									type={showConfirmPassword ? 'text' : 'password'}
									id="confirmPassword"
									name="confirmPassword"
									required
									class="w-full rounded-md border border-slate-700 bg-slate-800 py-2 pr-10 pl-10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
								/>
								<button
									type="button"
									onclick={() => (showConfirmPassword = !showConfirmPassword)}
									class="absolute top-1/2 right-3 -translate-y-1/2 transform text-slate-500 hover:text-slate-400"
								>
									{#if showConfirmPassword}
										<EyeOff class="h-4 w-4" />
									{:else}
										<Eye class="h-4 w-4" />
									{/if}
								</button>
							</div>
						</div>
						<button
							type="submit"
							class="w-full rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
						>
							Change Password
						</button>
					</form>
				</div>

				<form method="post" action="?/logout" use:enhance class="border-t border-slate-800 pt-6">
					<button
						type="submit"
						class="w-full rounded-md border border-slate-700 px-4 py-2 text-white hover:bg-slate-800 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
					>
						Sign out
					</button>
				</form>
			</div>
		</div>
	</div>
</main>
