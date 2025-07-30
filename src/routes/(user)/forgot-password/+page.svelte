<script lang="ts">
	import { enhance } from '$app/forms';
	import Mail from '~icons/lucide/mail';
	import ArrowLeft from '~icons/lucide/arrow-left';
	import type { PageServerData } from './$types';
	import { m } from '$lib/paraglide/messages';
	import { FORGOT_PASSWORD_SCHEMA } from '$lib/validations/auth';
	import InlineAlert from '$lib/components/InlineAlert.svelte';

	type FormData = { message?: string; success?: boolean } | null;
	let { form, data }: { form: FormData; data: PageServerData } = $props();
	let email = $state('');
	let isLoading = $state(false);
	let successMessage = $state('');

	function handleSubmit({ cancel }: { cancel: () => void }) {
		isLoading = true;
		form = null;
		successMessage = '';

		const forgotPasswordData = {
			email
		};

		const result = FORGOT_PASSWORD_SCHEMA.safeParse(forgotPasswordData);
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
			successMessage = m.password_reset_email_sent();
			isLoading = false;
		}
	});
</script>

<svelte:head>
	<title>{m.forgot_password()} | LemonTV</title>
</svelte:head>

<main class="flex min-h-[calc(100dvh-9em)] flex-1 items-center justify-center p-4">
	<div class="w-full max-w-md">
		<div class="rounded-lg border border-slate-800 bg-slate-900/70 shadow-lg">
			<div class="space-y-1 p-6 text-center">
				<h2 class="text-2xl font-bold text-white">{m.forgot_password()}</h2>
				<p class="text-slate-400">{m.forgot_password_description()}</p>
			</div>
			<div class="p-6">
				{#if form?.message}
					<InlineAlert type="error" message={form.message} />
				{/if}
				{#if successMessage}
					<InlineAlert type="success" message={successMessage} />
				{/if}
				<form method="POST" action="?/forgotPassword" use:enhance={handleSubmit} class="space-y-4">
					<div class="space-y-2">
						<label for="email" class="block text-white">{m.email()}</label>
						<div class="relative">
							<Mail
								class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-500"
							/>
							<input
								id="email"
								name="email"
								type="email"
								placeholder="your.email@example.com"
								bind:value={email}
								required
								autocomplete="email"
								class="w-full rounded-md border border-slate-700 bg-slate-800 py-2 pr-4 pl-10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
							/>
						</div>
					</div>
					<button
						type="submit"
						class="w-full rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600 disabled:opacity-50"
						disabled={isLoading}
					>
						{isLoading ? m.sending() : m.send_reset_email()}
					</button>
				</form>

				<div class="mt-6 text-center">
					<a
						href="/login"
						class="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300"
					>
						<ArrowLeft class="h-4 w-4" />
						{m.back_to_login()}
					</a>
				</div>
			</div>
		</div>
	</div>
</main>
