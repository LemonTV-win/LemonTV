<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import Eye from '~icons/lucide/eye';
	import EyeOff from '~icons/lucide/eye-off';
	import Lock from '~icons/lucide/lock';
	import Mail from '~icons/lucide/mail';
	import User from '~icons/lucide/user';
	import Github from '~icons/lucide/github';
	import type { PageServerData } from './$types';
	import { m } from '$lib/paraglide/messages';

	let { form, data }: { form: ActionData; data: PageServerData } = $props();
	let activeTab = $state('login');
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);

	// Login form state
	let loginUsername = $state('');
	let loginPassword = $state('');
	let rememberMe = $state(false);

	// Register form state
	let registerUsername = $state('');
	let registerEmail = $state('');
	let registerPassword = $state('');
	let confirmPassword = $state('');
	let acceptTerms = $state(false);

	let isLoading = $state(false);

	async function handleLoginSubmit(e: SubmitEvent) {
		e.preventDefault();
		isLoading = true;

		const formData = new FormData();
		formData.append('username', loginUsername);
		formData.append('password', loginPassword);

		try {
			const response = await fetch('?/login', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				window.location.href = data.redirect || '/';
			} else {
				const data = await response.json();
				form = { message: data.message };
			}
		} catch (error) {
			form = { message: 'An error occurred during login' };
		} finally {
			isLoading = false;
		}
	}

	async function handleRegisterSubmit(e: SubmitEvent) {
		e.preventDefault();
		isLoading = true;

		const formData = new FormData();
		formData.append('username', registerUsername);
		formData.append('password', registerPassword);

		try {
			const response = await fetch('?/register', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				window.location.href = data.redirect || '/';
			} else {
				const data = await response.json();
				form = { message: data.message };
			}
		} catch (error) {
			form = { message: 'An error occurred during registration' };
		} finally {
			isLoading = false;
		}
	}
</script>

<main class="flex min-h-[calc(100dvh-9em)] flex-1 items-center justify-center p-4">
	<div class="w-full max-w-md">
		<div class="rounded-lg border border-slate-800 bg-slate-900/70 shadow-lg">
			<!-- Tabs -->
			<div class="grid grid-cols-2 border-b border-slate-800">
				<button
					class="px-4 py-2 text-center text-sm font-medium transition-colors {activeTab === 'login'
						? 'border-b-2 border-yellow-500 text-yellow-500'
						: 'text-slate-400 hover:text-slate-300'}"
					onclick={() => (activeTab = 'login')}
				>
					{m.sign_in()}
				</button>
				<button
					class="px-4 py-2 text-center text-sm font-medium transition-colors {activeTab ===
					'register'
						? 'border-b-2 border-yellow-500 text-yellow-500'
						: 'text-slate-400 hover:text-slate-300'}"
					onclick={() => (activeTab = 'register')}
				>
					{m.register()}
				</button>
			</div>

			{#if activeTab === 'login'}
				<!-- Login Form -->
				<div class="space-y-1 p-6 text-center">
					<h2 class="text-2xl font-bold text-white">{m.sign_in_to_account()}</h2>
					<p class="text-slate-400">{m.enter_credentials()}</p>
				</div>
				<div class="p-6">
					<form onsubmit={handleLoginSubmit} class="space-y-4">
						<div class="space-y-2">
							<label for="username" class="block text-white">{m.username()}</label>
							<div class="relative">
								<User
									class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-500"
								/>
								<input
									id="username"
									name="username"
									type="text"
									placeholder="username"
									bind:value={loginUsername}
									required
									autocomplete="username"
									class="w-full rounded-md border border-slate-700 bg-slate-800 py-2 pr-4 pl-10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
								/>
							</div>
						</div>
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<label for="password" class="block text-white">{m.password()}</label>
								<a href="/forgot-password" class="text-xs text-yellow-400 hover:text-yellow-300">
									{m.forgot_password()}
								</a>
							</div>
							<div class="relative">
								<Lock
									class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-500"
								/>
								<input
									id="password"
									name="password"
									type={showPassword ? 'text' : 'password'}
									placeholder="••••••••"
									bind:value={loginPassword}
									required
									autocomplete="current-password"
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
						<div class="flex items-center space-x-2">
							<input
								type="checkbox"
								id="remember"
								bind:checked={rememberMe}
								class="rounded border-slate-700 bg-slate-800 text-yellow-500 focus:ring-yellow-500"
							/>
							<label for="remember" class="text-sm leading-none font-medium text-slate-300">
								{m.remember_me()}
							</label>
						</div>
						<button
							type="submit"
							class="w-full rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600 disabled:opacity-50"
							disabled={isLoading}
						>
							{isLoading ? m.signing_in() : m.sign_in()}
						</button>
					</form>

					<div class="relative my-6">
						<div class="absolute inset-0 flex items-center">
							<div class="w-full border-t border-slate-700"></div>
						</div>
						<div class="relative flex justify-center text-xs uppercase">
							<span class="bg-slate-900 px-2 text-slate-500">{m.or_continue_with()}</span>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<button
							class="flex items-center justify-center gap-2 rounded-md border border-slate-700 px-4 py-2 text-white hover:bg-slate-800"
						>
							<Github class="h-4 w-4" />
							GitHub
						</button>
						<button
							class="flex items-center justify-center gap-2 rounded-md border border-slate-700 px-4 py-2 text-white hover:bg-slate-800"
						>
							<Mail class="h-4 w-4" />
							Google
						</button>
					</div>
				</div>
			{:else}
				<!-- Register Form -->
				<div class="space-y-1 p-6 text-center">
					<h2 class="text-2xl font-bold text-white">{m.create_account()}</h2>
					<p class="text-slate-400">{m.enter_details()}</p>
				</div>
				<div class="p-6">
					<form onsubmit={handleRegisterSubmit} class="space-y-4">
						<div class="space-y-2">
							<label for="username" class="block text-white">{m.username()}</label>
							<div class="relative">
								<User
									class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-500"
								/>
								<input
									id="username"
									type="text"
									placeholder="username"
									bind:value={registerUsername}
									required
									autocomplete="username"
									class="w-full rounded-md border border-slate-700 bg-slate-800 py-2 pr-4 pl-10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
								/>
							</div>
						</div>
						<div class="space-y-2">
							<label for="register-email" class="block text-white">{m.email()}</label>
							<div class="relative">
								<Mail
									class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-500"
								/>
								<input
									id="register-email"
									type="email"
									placeholder="your.email@example.com"
									bind:value={registerEmail}
									required
									autocomplete="email"
									class="w-full rounded-md border border-slate-700 bg-slate-800 py-2 pr-4 pl-10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
								/>
							</div>
						</div>
						<div class="space-y-2">
							<label for="register-password" class="block text-white">{m.password()}</label>
							<div class="relative">
								<Lock
									class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-500"
								/>
								<input
									id="register-password"
									type={showPassword ? 'text' : 'password'}
									placeholder="••••••••"
									bind:value={registerPassword}
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
							<label for="confirm-password" class="block text-white">{m.confirm_password()}</label>
							<div class="relative">
								<Lock
									class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-500"
								/>
								<input
									id="confirm-password"
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
						<div class="flex items-center space-x-2">
							<input
								type="checkbox"
								id="terms"
								bind:checked={acceptTerms}
								required
								class="rounded border-slate-700 bg-slate-800 text-yellow-500 focus:ring-yellow-500"
							/>
							<label for="terms" class="text-sm leading-none font-medium text-slate-300">
								{m.accept_terms()}
							</label>
						</div>
						<button
							type="submit"
							class="w-full rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600 disabled:opacity-50"
							disabled={isLoading}
						>
							{isLoading ? m.registering() : m.register()}
						</button>
					</form>

					<div class="relative my-6">
						<div class="absolute inset-0 flex items-center">
							<div class="w-full border-t border-slate-700"></div>
						</div>
						<div class="relative flex justify-center text-xs uppercase">
							<span class="bg-slate-900 px-2 text-slate-500">{m.or_continue_with()}</span>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<button
							class="flex items-center justify-center gap-2 rounded-md border border-slate-700 px-4 py-2 text-white hover:bg-slate-800"
						>
							<Github class="h-4 w-4" />
							GitHub
						</button>
						<button
							class="flex items-center justify-center gap-2 rounded-md border border-slate-700 px-4 py-2 text-white hover:bg-slate-800"
						>
							<Mail class="h-4 w-4" />
							Google
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
</main>

{#if form?.message}
	<p class="mt-4 text-center text-red-500">{form.message}</p>
{/if}
