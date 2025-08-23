<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import Eye from '~icons/lucide/eye';
	import EyeOff from '~icons/lucide/eye-off';
	import Lock from '~icons/lucide/lock';
	import { m } from '$lib/paraglide/messages';
	import InlineAlert from '$lib/components/InlineAlert.svelte';

	let error: string | null = $state(null);
	let success = $state(false);
	let showCurrentPassword = $state(false);
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);

	function handleSubmit() {
		return async ({ result }: { result: ActionResult }) => {
			if (result.type === 'error') {
				error = result.error?.message || m.error_occurred();
				success = false;
				console.error('error', error);
			} else if (result.type === 'success') {
				error = null;
				success = true;
				console.info('success', success);
			} else if (result.type === 'failure') {
				error = result.data?.error || m.failed_to_change_password();
				success = false;
				console.error('error', error);
			}
		};
	}
</script>

<svelte:head>
	<title>{m.security()} | LemonTV</title>
</svelte:head>

<div class="space-y-8">
	<div>
		<h2 class="mb-4 text-xl font-semibold text-white">{m.change_password()}</h2>
		{#if error}
			<InlineAlert type="error" message={error} />
		{/if}
		{#if success}
			<InlineAlert type="success" message={m.password_changed()} />
		{/if}
		<form method="post" action="?/changePassword" use:enhance={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<label for="currentPassword" class="block text-white">{m.current_password()}</label>
				<div class="relative">
					<Lock class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-500" />
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
				<label for="newPassword" class="block text-white">{m.new_password()}</label>
				<div class="relative">
					<Lock class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-500" />
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
				<label for="confirmPassword" class="block text-white">{m.confirm_new_password()}</label>
				<div class="relative">
					<Lock class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-500" />
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
				{m.change_password()}
			</button>
		</form>
	</div>
</div>
