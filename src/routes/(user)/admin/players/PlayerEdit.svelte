<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Player } from '$lib/data/players';
	import type { TCountryCode } from 'countries-list';
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import { countries } from 'countries-list';
	import countryCodeToFlagEmoji from 'country-code-to-flag-emoji';
	import { countryCodeToLocalizedName } from '$lib/utils/strings';
	import PlatformSelect from '$lib/components/PlatformSelect.svelte';
	import IconParkSolidAdd from '~icons/icon-park-solid/add';
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import IconParkSolidCopy from '~icons/icon-park-solid/copy';
	import IconParkSolidCheckOne from '~icons/icon-park-solid/check-one';
	import type { ActionResult } from '@sveltejs/kit';

	let {
		player,
		socialPlatforms,
		topCountries,
		users,
		onCancel,
		onSuccess: onsuccess
	}: {
		player: Partial<Player>;
		socialPlatforms: any[];
		topCountries: [string, number][];
		users: { id: string; username: string }[];
		onCancel: () => void;
		onSuccess: () => void;
	} = $props();

	let newPlayer = $state({ ...player });
	let errorMessage = $state('');
	let successMessage = $state('');
	let copySuccess = $state(false);
	let userId = $state(player.user?.id || '');
	let userSearch = $state(users.find((user) => user.id === userId)?.username || '');
	let showUserDropdown = $state(false);
	let primaryNationality = $state<TCountryCode | undefined>(player.nationalities?.[0]);
	let additionalNationalities = $state<(TCountryCode | undefined)[]>(
		player.nationalities?.slice(1) || []
	);

	const filteredUsers = $derived(
		users.filter((user) => user.username.toLowerCase().includes(userSearch.toLowerCase()))
	);

	function selectUser(user: { id: string; username: string }) {
		userId = user.id;
		newPlayer.user = { id: user.id, email: '', username: user.username, roles: [] };
		userSearch = user.username;
		showUserDropdown = false;
	}

	const countryCodes = Object.keys(countries);

	function extractAccountId(url: string, platformId: string): string {
		const platform = socialPlatforms.find((p) => p.id === platformId);
		if (!platform?.url_template) return url;

		// Remove protocol and www. from the URL if present
		url = url.replace(/^https?:\/\/(www\.)?/, '');

		// Try to match the URL pattern
		const template = platform.url_template.replace(/^https?:\/\/(www\.)?/, '');
		const pattern = template.replace('{accountId}', '([^/]+)');
		const regex = new RegExp(pattern);
		const match = url.match(regex);

		if (match && match[1]) {
			return match[1];
		}

		return url;
	}

	function detectPlatformFromUrl(url: string): string | undefined {
		// Remove protocol and www. from the URL if present
		url = url.replace(/^https?:\/\/(www\.)?/, '');

		// Try to match each platform's URL pattern
		for (const platform of socialPlatforms) {
			if (!platform.url_template) continue;

			// Remove protocol and www. from the template for comparison
			const template = platform.url_template.replace(/^https?:\/\/(www\.)?/, '');
			const pattern = template.replace('{accountId}', '([^/]+)');
			const regex = new RegExp(pattern);
			if (regex.test(url)) {
				return platform.id;
			}
		}

		return undefined;
	}

	function handleSocialAccountInput(account: any, value: string) {
		// Remove protocol and www. from the URL if present
		value = value.replace(/^https?:\/\/(www\.)?/, '');

		// If no platform is selected, try to detect it from the URL
		if (!account.platformId) {
			const detectedPlatform = detectPlatformFromUrl(value);
			if (detectedPlatform) {
				account.platformId = detectedPlatform;
			}
		}

		// Extract account ID if platform is selected (either manually or auto-detected)
		if (account.platformId) {
			account.accountId = extractAccountId(value, account.platformId);
		} else {
			account.accountId = value;
		}
	}

	function addGameAccount() {
		if (!newPlayer.gameAccounts) {
			newPlayer.gameAccounts = [];
		}
		newPlayer.gameAccounts.push({
			accountId: 0,
			currentName: newPlayer.name || '',
			region: undefined,
			server: 'Strinova' // TODO: Make editable
		});
		// Focus on the newly added current name input
		setTimeout(() => {
			const inputs = document.querySelectorAll('input[id="currentName"]');
			const lastInput = inputs[inputs.length - 1];
			if (lastInput instanceof HTMLInputElement) {
				lastInput.focus();
				lastInput.select();
			}
		}, 0);
	}

	function removeGameAccount(index: number) {
		newPlayer.gameAccounts?.splice(index, 1);
	}

	function addAlias() {
		if (!newPlayer.aliases) {
			newPlayer.aliases = [];
		}
		newPlayer.aliases.push('');
	}

	function removeAlias(index: number) {
		newPlayer.aliases?.splice(index, 1);
	}

	function addSocialAccount() {
		if (!newPlayer.socialAccounts) {
			newPlayer.socialAccounts = [];
		}
		newPlayer.socialAccounts.push({
			platformId: '',
			accountId: '',
			overridingUrl: undefined
		});
	}

	function removeSocialAccount(index: number) {
		newPlayer.socialAccounts?.splice(index, 1);
	}

	function handleCopyId() {
		if (newPlayer.id) {
			navigator.clipboard.writeText(newPlayer.id);
			copySuccess = true;
			setTimeout(() => {
				copySuccess = false;
			}, 2000);
		}
	}
</script>

<form
	method="POST"
	action={player.id ? '?/update' : '?/create'}
	use:enhance={({ formData }) => {
		// Update nationalities in the player object
		const validAdditionalNationalities = additionalNationalities.filter(
			(n): n is TCountryCode => n !== undefined
		);
		if (!primaryNationality && validAdditionalNationalities.length === 0) {
			newPlayer.nationalities = undefined;
		} else if (primaryNationality) {
			newPlayer.nationalities = [primaryNationality, ...validAdditionalNationalities];
		} else {
			newPlayer.nationalities = validAdditionalNationalities;
		}

		formData.set('nationalities', JSON.stringify(newPlayer.nationalities || []));

		return ({ result }: { result: ActionResult }) => {
			if (result.type === 'success') {
				onsuccess();
			} else if (result.type === 'failure') {
				errorMessage = result.data?.error || m.failed_to_change_password();
			} else if (result.type === 'error') {
				errorMessage = result.error?.message || m.error_occurred();
			}
		};
	}}
	class="flex h-full flex-col"
>
	{#if errorMessage}
		<div class="mb-4 rounded-md bg-red-900/50 p-4 text-red-200" role="alert">
			<span class="block sm:inline">{errorMessage}</span>
		</div>
	{/if}
	<div
		class="flex-1 space-y-4 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:bg-slate-800"
	>
		{#if player.id}
			<div>
				<label class="block text-sm font-medium text-slate-300" for="playerId">ID</label>
				<div class="relative mt-1">
					<input
						type="text"
						id="playerId"
						name="id"
						value={player.id}
						readonly
						class="block w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-slate-400 placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none [&:read-only]:cursor-default [&:read-only]:opacity-75 [&:read-only]:select-none"
						placeholder={m.player_id()}
					/>
					<button
						type="button"
						onclick={handleCopyId}
						class="absolute top-1/2 right-2 -translate-y-1/2 text-slate-400 hover:text-yellow-500"
						title={m.copy_to_clipboard()}
					>
						{#if copySuccess}
							<IconParkSolidCheckOne class="h-5 w-5" />
						{:else}
							<IconParkSolidCopy class="h-5 w-5" />
						{/if}
					</button>
				</div>
			</div>
		{/if}
		<div>
			<label class="block text-sm font-medium text-slate-300" for="playerSlug">
				{m.slug()}
			</label>
			<input
				type="text"
				id="playerSlug"
				name="slug"
				bind:value={newPlayer.slug}
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
				placeholder={m.slug()}
				required
			/>
		</div>
		<div>
			<label class="block text-sm font-medium text-slate-300" for="playerName">
				{m.player_name()}
			</label>
			<input
				type="text"
				id="playerName"
				name="name"
				bind:value={newPlayer.name}
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
				placeholder={m.display_name()}
				required
			/>
		</div>

		<div>
			<label class="block text-sm font-medium text-slate-300" for="playerNationality">
				{m.nationality()}
			</label>
			<select
				id="playerNationality"
				name="nationality"
				bind:value={primaryNationality}
				class="font-emoji mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			>
				<option value={undefined}>{m.select_nationality()}</option>
				{#each topCountries as [code, _]}
					<option value={code}>
						{code} -
						{countryCodeToFlagEmoji(code)} -
						{countryCodeToLocalizedName(code, getLocale())}
					</option>
				{/each}
				<option disabled>―――</option>
				{#each countryCodes as code}
					<option value={code}>
						{code} -
						{countryCodeToFlagEmoji(code)} -
						{countryCodeToLocalizedName(code, getLocale())}
					</option>
				{/each}
			</select>
		</div>
		<div>
			<div class="mt-2 rounded-lg border border-slate-700 bg-slate-800 p-4">
				{#each additionalNationalities as nationality, index}
					<div
						class="grid grid-cols-[1fr_auto] gap-4 {index > 0
							? 'mt-4 border-t border-slate-700 pt-4'
							: ''}"
					>
						<div>
							<select
								id="additionalNationality-{index}"
								bind:value={additionalNationalities[index]}
								onchange={() => {
									additionalNationalities = [...additionalNationalities];
								}}
								class="font-emoji mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
							>
								<option value={undefined}>{m.select_nationality()}</option>
								{#each countryCodes as code}
									<option value={code} disabled={code === primaryNationality}>
										{code} - {countryCodeToFlagEmoji(code)} - {countryCodeToLocalizedName(
											code,
											getLocale()
										)}
									</option>
								{/each}
							</select>
						</div>
						<div class="flex items-center">
							<button
								type="button"
								class="mt-[1.625rem] text-red-400 hover:text-red-300"
								onclick={() =>
									(additionalNationalities = additionalNationalities.filter((_, i) => i !== index))}
								title={m.remove()}
							>
								<IconParkSolidDelete class="h-5 w-5" />
							</button>
						</div>
					</div>
				{/each}
				{#if additionalNationalities.length > 0}
					<div class="my-4 border-t border-slate-700"></div>
				{/if}
				<button
					type="button"
					class="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-700 bg-slate-800/50 px-4 py-2 text-yellow-500 transition-colors hover:border-yellow-500 hover:bg-slate-800"
					onclick={() => {
						additionalNationalities = [...additionalNationalities, undefined];
					}}
				>
					<IconParkSolidAdd class="h-5 w-5" />
					<span>{m.add()}</span>
				</button>
			</div>
		</div>
		<input type="hidden" name="aliases" value={JSON.stringify(newPlayer.aliases || [])} />
		<input type="hidden" name="gameAccounts" value={JSON.stringify(newPlayer.gameAccounts || [])} />
		<input
			type="hidden"
			name="socialAccounts"
			value={JSON.stringify(newPlayer.socialAccounts || [])}
		/>
		<div>
			<label class="block text-sm font-medium text-slate-300" for="aliases">{m.aliases()}</label>
			<div class="mt-2 rounded-lg border border-slate-700 bg-slate-800 p-4">
				{#each newPlayer.aliases || [] as alias, i}
					<div
						class="grid grid-cols-[1fr_auto] gap-4 {i > 0
							? 'mt-4 border-t border-slate-700 pt-4'
							: ''}"
					>
						<div>
							<label class="block text-sm font-medium text-slate-300" for="alias-{i}">
								{m.alias()}
							</label>
							<input
								type="text"
								id="alias-{i}"
								bind:value={newPlayer.aliases![i]}
								class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
								placeholder={m.alias()}
							/>
						</div>
						<div class="flex items-center">
							<button
								type="button"
								class="mt-[1.625rem] text-red-400 hover:text-red-300"
								onclick={() => removeAlias(i)}
								title={m.remove()}
							>
								<IconParkSolidDelete class="h-5 w-5" />
							</button>
						</div>
					</div>
				{/each}
				{#if (newPlayer.aliases || []).length > 0}
					<div class="my-4 border-t border-slate-700"></div>
				{/if}
				<button
					type="button"
					class="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-700 bg-slate-800/50 px-4 py-2 text-yellow-500 transition-colors hover:border-yellow-500 hover:bg-slate-800"
					onclick={addAlias}
				>
					<IconParkSolidAdd class="h-5 w-5" />
					<span>{m.add_alias()}</span>
				</button>
			</div>
		</div>

		<div>
			<label class="block text-sm font-medium text-slate-300" for="gameAccounts">
				{m.game_accounts()}
			</label>
			<div class="mt-2 rounded-lg border border-slate-700 bg-slate-800 p-4">
				{#each newPlayer.gameAccounts || [] as account, i}
					<div
						class="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 {i > 0
							? 'mt-4 border-t border-slate-700 pt-4'
							: ''}"
					>
						<div>
							<label class="block text-sm font-medium text-slate-300" for="accountId">
								{m.account_id()}
							</label>
							<input
								type="number"
								id="accountId"
								bind:value={account.accountId}
								class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-slate-300" for="currentName">
								{m.current_name()}
							</label>
							<input
								type="text"
								id="currentName"
								bind:value={account.currentName}
								class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-slate-300" for="region">
								{m.region()}
							</label>
							<select
								id="region"
								bind:value={account.region}
								class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
							>
								<option value={undefined}>{m.select_region()}</option>
								<option value="NA">{m.north_america()}</option>
								<option value="APAC">{m.asia_pacific()}</option>
								<option value="EU">{m.europe()}</option>
								<option disabled>―――</option>
								<option value="CN">{m.china()}</option>
							</select>
						</div>
						<div class="flex items-center">
							<button
								type="button"
								class="mt-[1.625rem] text-red-400 hover:text-red-300"
								onclick={() => removeGameAccount(i)}
								title={m.remove_account()}
							>
								<IconParkSolidDelete class="h-5 w-5" />
							</button>
						</div>
					</div>
				{/each}
				{#if (newPlayer.gameAccounts || []).length > 0}
					<div class="my-4 border-t border-slate-700"></div>
				{/if}
				<button
					type="button"
					class="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-700 bg-slate-800/50 px-4 py-2 text-yellow-500 transition-colors hover:border-yellow-500 hover:bg-slate-800"
					onclick={addGameAccount}
				>
					<IconParkSolidAdd class="h-5 w-5" />
					<span>{m.add_game_account()}</span>
				</button>
			</div>
		</div>

		<div>
			<label class="block text-sm font-medium text-slate-300" for="socialAccounts">
				{m.social_accounts()}
			</label>
			<div class="mt-2 rounded-lg border border-slate-700 bg-slate-800 p-4">
				{#each newPlayer.socialAccounts || [] as account, i}
					<div
						class="grid grid-cols-[1fr_1fr_auto] gap-4 {i > 0
							? 'mt-4 border-t border-slate-700 pt-4'
							: ''}"
					>
						<div>
							<label class="block text-sm font-medium text-slate-300" for="platformId">
								{m.platform()}
							</label>
							<PlatformSelect
								value={account.platformId}
								platforms={socialPlatforms}
								onChange={(platformId) => (account.platformId = platformId)}
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-slate-300" for="accountUrl">
								{m.account_id()}
							</label>
							<input
								type="text"
								id="accountUrl"
								value={account.accountId}
								oninput={(e) => handleSocialAccountInput(account, e.currentTarget.value)}
								class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
								placeholder={m.account_id()}
							/>
							{#if account.platformId}
								{#each socialPlatforms as platform}
									{#if platform.id === account.platformId && platform.url_template && account.accountId}
										<a
											href={platform.url_template.replace('{accountId}', account.accountId)}
											target="_blank"
											rel="noopener noreferrer"
											class="mt-1 block text-sm text-yellow-500 hover:text-yellow-400"
											title={platform.url_template.replace('{accountId}', account.accountId)}
										>
											{platform.url_template.replace('{accountId}', account.accountId)}
										</a>
									{/if}
								{/each}
							{/if}
						</div>
						<div class="flex items-center">
							<button
								type="button"
								class="mt-[1.625rem] text-red-400 hover:text-red-300"
								onclick={() => removeSocialAccount(i)}
								title={m.remove_social_account()}
							>
								<IconParkSolidDelete class="h-5 w-5" />
							</button>
						</div>
					</div>
				{/each}
				{#if (newPlayer.socialAccounts || []).length > 0}
					<div class="my-4 border-t border-slate-700"></div>
				{/if}
				<button
					type="button"
					class="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-700 bg-slate-800/50 px-4 py-2 text-yellow-500 transition-colors hover:border-yellow-500 hover:bg-slate-800"
					onclick={addSocialAccount}
				>
					<IconParkSolidAdd class="h-5 w-5" />
					<span>{m.add_social_account()}</span>
				</button>
			</div>
		</div>

		<div>
			<label class="block text-sm font-medium text-slate-300" for="playerUser">
				{m.associated_user_id()}
			</label>
			<div class="relative">
				<input type="hidden" name="userId" value={userId} />
				<input
					type="text"
					id="playerUser"
					bind:value={userSearch}
					onfocus={() => (showUserDropdown = true)}
					oninput={() => (showUserDropdown = true)}
					onblur={() => setTimeout(() => (showUserDropdown = false), 200)}
					class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					placeholder={m.search_users()}
				/>
				{#if showUserDropdown && filteredUsers.length > 0}
					<div
						class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-700 bg-slate-800 py-1 shadow-lg"
					>
						{#each filteredUsers as user}
							<button
								type="button"
								class="w-full px-4 py-2 text-left text-white hover:bg-slate-700"
								onmousedown={() => selectUser(user)}
							>
								{user.username}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div class="mt-6 flex justify-end gap-4 border-t border-slate-700 pt-4">
		<button
			type="button"
			class="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
			onclick={onCancel}
		>
			{m.cancel()}
		</button>
		<button
			type="submit"
			class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600"
		>
			{player.id ? m.update_player() : m.create_player()}
		</button>
	</div>
</form>
