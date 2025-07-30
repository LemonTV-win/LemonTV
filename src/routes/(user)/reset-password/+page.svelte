<script lang="ts">
	import { enhance } from '$app/forms';
	import Eye from '~icons/lucide/eye';
	import EyeOff from '~icons/lucide/eye-off';
	import Lock from '~icons/lucide/lock';
	import type { PageServerData } from './$types';
	import { m } from '$lib/paraglide/messages';
	import { RESET_PASSWORD_SCHEMA } from '$lib/validations/auth';
	import InlineAlert from '$lib/components/InlineAlert.svelte';

	type FormData = { message?: string; success?: boolean } | null;
	let { form, data }: { form: FormData; data: PageServerData } = $props();
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
	let password = $state('');
	let confirmPassword = $state('');
	let isLoading = $state(false);
	let successMessage = $state('');

	function handleSubmit({ cancel }: { cancel: () => void }) {
		isLoading = true;
		form = null;
		successMessage = '';

		const resetPasswordData = {
			password,
			confirmPassword
		};

		const result = RESET_PASSWORD_SCHEMA.safeParse(resetPasswordData);
		if (!result.success) {
			form = { message: result.error.issues[0].message };
			isLoading = false;
			cancel();
			return;
		}
	}

	$effect(() => {
		if (form?.message) {
			isLoading = false;
		}
	});

	$effect(() => {
		if (form && form.success === true) {
			successMessage = m.password_reset_success();
			isLoading = false;
		}
	});
</script>

<svelte:head>
	<title>{m.reset_password()} | LemonTV</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-9em)] flex-1 items-center justify-center p-4">
	<div class="w-full max-w-md">
		<div class="rounded-lg border border-slate-800 bg-slate-900/70 shadow-lg">
			<div class="space-y-1 p-6 text-center">
				<h2 class="text-2xl font-bold text-white">{m.reset_password()}</h2>
				<p class="text-slate-400">{m.enter_new_password()}</p>
			</div>
			<div class="p-6">
				{#if form?.message}
					<InlineAlert type="error" message={form.message} />
				{/if}
				{#if successMessage}
					<InlineAlert type="success" message={successMessage} />
				{/if}
				<form method="POST" action="?/resetPassword" use:enhance={handleSubmit} class="space-y-4">
					<input type="hidden" name="token" value={data.token} />
					<div class="space-y-2">
						<label for="password" class="block text-white">{m.new_password()}</label>
						<div class="relative">
							<Lock
								class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-500"
							/>
							<input
								id="password"
								name="password"
								type={showPassword ? 'text' : 'password'}
								placeholder="••••••••"
								bind:value={password}
								required
								autocomplete="new-password"
								class="w-full rounded-md border border-slate-700 bg-slate-800 py-2 pr-10 pl-10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
							/>
							<button
								type="button"
								onclick={() => (showPassword = !showPassword)}
								class="absolute top-1/2 right-3 -translate-y-1/2 transform text-slate-500 hover:text-slate-400"
							>
								{#if showPassword}
									<EyeOff class="h-4 w-4" />
								{:else}
									<Eye class="h-4 w-4" />
								{/if}
							</button>
						</div>
					</div>
					<div class="space-y-2">
						<label for="confirm-password" class="block text-white">{m.confirm_new_password()}</label
						>
						<div class="relative">
							<Lock
								class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-500"
							/>
							<input
								id="confirm-password"
								name="confirmPassword"
								type={showConfirmPassword ? 'text' : 'password'}
								placeholder="••••••••"
								bind:value={confirmPassword}
								required
								autocomplete="new-password"
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
						class="w-full rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600 disabled:opacity-50"
						disabled={isLoading}
					>
						{isLoading ? m.resetting_password() : m.reset_password()}
					</button>
				</form>

				<div class="mt-6 text-center">
					<a href="/login" class="text-sm text-slate-400 hover:text-slate-300">
						{m.back_to_login()}
					</a>
				</div>
			</div>
		</div>
	</div>
</main>
