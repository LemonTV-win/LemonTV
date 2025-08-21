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
	import { SITE_CANONICAL_HOST } from '$lib/consts';
	import ImageUpload from '$lib/components/ImageUpload.svelte';
	import type { ProSettings } from '$lib/server/db/schema';

	let {
		player,
		socialPlatforms,
		topCountries,
		users,
		onCancel,
		onSuccess: onsuccess,
		playerProSettings
	}: {
		player: Partial<Player>;
		socialPlatforms: { id: string; name: string; url_template: string | null }[];
		topCountries: [string, number][];
		users: { id: string; username: string }[];
		onCancel: () => void;
		onSuccess: () => void;
		playerProSettings?: ProSettings;
	} = $props();

	let newPlayer = $state({ ...player });
	let errorMessage = $state('');
	let copySuccess = $state(false);
	let hasFile = $state(false);
	let uploaded = $state(false);
	let userId = $state(player.user?.id || '');
	let userSearch = $state(users.find((user) => user.id === userId)?.username || '');
	let showUserDropdown = $state(false);
	let primaryNationality = $state<TCountryCode | undefined>(player.nationalities?.[0]);
	let additionalNationalities = $state<(TCountryCode | undefined)[]>(
		player.nationalities?.slice(1) || []
	);
	let playerAvatar = $state(player.avatar ?? null);

	// Pro settings state (optional)
	let proSettings = $state({
		dpi: '' as string | number,
		sensitivity: '' as string | number,
		pollingRateHz: '' as string | number,
		windowsPointerSpeed: '' as string | number,
		mouseSmoothing: '' as string, // '', 'true', 'false'
		mouseModel: '' as string,
		verticalSensMultiplier: '' as string | number,
		shoulderFireSensMultiplier: '' as string | number,
		adsSens1_25x: '' as string | number,
		adsSens1_5x: '' as string | number,
		adsSens2_5x: '' as string | number,
		adsSens4_0x: '' as string | number
	});

	$effect(() => {
		newPlayer.avatar = playerAvatar || undefined;
	});

	$effect(() => {
		if (playerProSettings && player?.id) {
			proSettings.dpi = playerProSettings.dpi ?? '';
			proSettings.sensitivity = playerProSettings.sensitivity ?? '';
			proSettings.pollingRateHz = playerProSettings.pollingRateHz ?? '';
			proSettings.windowsPointerSpeed = playerProSettings.windowsPointerSpeed ?? '';
			proSettings.mouseSmoothing =
				playerProSettings.mouseSmoothing === undefined
					? ''
					: playerProSettings.mouseSmoothing
						? 'true'
						: 'false';
			proSettings.mouseModel = playerProSettings.mouseModel ?? '';
			proSettings.verticalSensMultiplier = playerProSettings.verticalSensMultiplier ?? '';
			proSettings.shoulderFireSensMultiplier = playerProSettings.shoulderFireSensMultiplier ?? '';
			proSettings.adsSens1_25x = playerProSettings.adsSens1_25x ?? '';
			proSettings.adsSens1_5x = playerProSettings.adsSens1_5x ?? '';
			proSettings.adsSens2_5x = playerProSettings.adsSens2_5x ?? '';
			proSettings.adsSens4_0x = playerProSettings.adsSens4_0x ?? '';
		}
	});

	const filteredUsers = $derived(
		users.filter((user) => user.username.toLowerCase().includes(userSearch.toLowerCase()))
	);

	function selectUser(user: { id: string; username: string }) {
		userId = user.id;
		newPlayer.user = { id: user.id, email: '', username: user.username, roles: [] };
		userSearch = user.username;
		showUserDropdown = false;
	}

	const countryCodes = [...Object.keys(countries), 'ZZ'];

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

	function handleSocialAccountInput(
		account: { platformId: string; accountId: string },
		value: string
	) {
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
		// Focus on the newly added alias input
		setTimeout(() => {
			const inputs = document.querySelectorAll('input[id^="alias-"]');
			const lastInput = inputs[inputs.length - 1];
			if (lastInput instanceof HTMLInputElement) {
				lastInput.focus();
				lastInput.select();
			}
		}, 0);
	}

	function removeAlias(index: number) {
		if (newPlayer.aliases) {
			newPlayer.aliases = newPlayer.aliases.filter((_, i) => i !== index);
		}
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

		// Prevent submission if there's a pending file upload
		if (hasFile && !uploaded) {
			errorMessage = 'Please upload the selected image before saving the player.';
			return;
		}

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
	<div class="styled-scroll flex-1 space-y-4 overflow-y-auto pr-2">
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
				placeholder={`${SITE_CANONICAL_HOST}/players/⟨${m.slug().toLocaleLowerCase()}⟩`}
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
			<div class="mt-2 rounded-lg border border-slate-700 bg-slate-800 p-4">
				<select
					id="playerNationality"
					name="nationality"
					bind:value={primaryNationality}
					class="font-emoji mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
				>
					<option value={undefined}>{m.select_nationality()}</option>
					{#each topCountries as [code] (code)}
						<option value={code}>
							{code} -
							{countryCodeToFlagEmoji(code)} -
							{countryCodeToLocalizedName(code, getLocale())}
						</option>
					{/each}
					<option disabled>―――</option>
					{#each countryCodes as code (code)}
						<option value={code}>
							{code} -
							{countryCodeToFlagEmoji(code)} -
							{countryCodeToLocalizedName(code, getLocale())}
						</option>
					{/each}
				</select>
				<div class="my-4 border-t border-slate-700"></div>
				{#each additionalNationalities as nationality, index (nationality)}
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
								{#each countryCodes as code (code)}
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
								class="text-red-400 hover:text-red-300"
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

		<div>
			<label for="playerAvatar" class="block text-sm font-medium text-slate-300">
				{m.avatar()}
			</label>
			<ImageUpload bind:value={playerAvatar} prefix="players" bind:hasFile bind:uploaded />
			<input type="hidden" name="avatar" value={playerAvatar} />
		</div>

		<div>
			<input type="hidden" name="aliases" value={JSON.stringify(newPlayer.aliases || [])} />
			<label class="block text-sm font-medium text-slate-300" for="aliases">{m.aliases()}</label>
			<div class="mt-2 rounded-lg border border-slate-700 bg-slate-800 p-4">
				{#each newPlayer.aliases || [] as alias, i (i)}
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
			<input
				type="hidden"
				name="gameAccounts"
				value={JSON.stringify(newPlayer.gameAccounts || [])}
			/>
			<label class="block text-sm font-medium text-slate-300" for="gameAccounts">
				{m.game_accounts()}
			</label>
			<div class="mt-2 rounded-lg border border-slate-700 bg-slate-800 p-4">
				{#each newPlayer.gameAccounts || [] as account, i (i)}
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
								<optgroup label={m.strinova_server()}>
									<option value="NA">{m.north_america()}</option>
									<option value="APAC">{m.asia_pacific()}</option>
									<option value="EU">{m.europe()}</option>
								</optgroup>
								<optgroup label={m.calabiyau_server()}>
									<option value="CN">{m.china()}</option>
								</optgroup>
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
			<h3 class="block text-sm font-medium text-slate-300">
				{m['content.players.pro_settings.settings']()}
			</h3>
			<div
				class="mt-2 grid grid-cols-1 gap-4 rounded-lg border border-slate-700 bg-slate-800 p-4 md:grid-cols-2"
			>
				<div>
					<label class="block text-xs text-slate-400" for="dpi"
						>{m['content.players.pro_settings.dpi']()}</label
					>
					<input
						name="dpi"
						id="dpi"
						type="number"
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						bind:value={proSettings.dpi}
					/>
				</div>
				<div>
					<label class="block text-xs text-slate-400" for="sensitivity"
						>{m['content.players.pro_settings.sensitivity']()}</label
					>
					<input
						name="sensitivity"
						id="sensitivity"
						type="number"
						step="0.0001"
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						bind:value={proSettings.sensitivity}
					/>
				</div>
				<div>
					<label class="block text-xs text-slate-400" for="pollingRateHz"
						>{m['content.players.pro_settings.polling_rate']()}</label
					>
					<input
						name="pollingRateHz"
						id="pollingRateHz"
						type="number"
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						bind:value={proSettings.pollingRateHz}
					/>
				</div>
				<div>
					<label class="block text-xs text-slate-400" for="windowsPointerSpeed"
						>{m['content.players.pro_settings.windows_pointer_speed']()}</label
					>
					<input
						name="windowsPointerSpeed"
						id="windowsPointerSpeed"
						type="number"
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						bind:value={proSettings.windowsPointerSpeed}
					/>
				</div>
				<div>
					<label class="block text-xs text-slate-400" for="mouseSmoothing">
						{m['content.players.pro_settings.mouse_smoothing']()}
					</label>
					<select
						name="mouseSmoothing"
						id="mouseSmoothing"
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						bind:value={proSettings.mouseSmoothing}
					>
						<option value="">-</option>
						<option value="true">{m.on()}</option>
						<option value="false">{m.off()}</option>
					</select>
				</div>
				<div class="md:col-span-2">
					<label class="block text-xs text-slate-400" for="mouseModel"
						>{m['content.players.pro_settings.mouse_model']()}</label
					>
					<input
						name="mouseModel"
						id="mouseModel"
						type="text"
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						bind:value={proSettings.mouseModel}
					/>
				</div>
				<div>
					<label class="block text-xs text-slate-400" for="verticalSensMultiplier"
						>{m['content.players.pro_settings.vertical_sens_multiplier']()}</label
					>
					<input
						name="verticalSensMultiplier"
						id="verticalSensMultiplier"
						type="number"
						step="0.0001"
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						bind:value={proSettings.verticalSensMultiplier}
					/>
				</div>
				<div>
					<label class="block text-xs text-slate-400" for="shoulderFireSensMultiplier"
						>{m['content.players.pro_settings.shoulder_fire_sens_multiplier']()}</label
					>
					<input
						name="shoulderFireSensMultiplier"
						id="shoulderFireSensMultiplier"
						type="number"
						step="0.0001"
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						bind:value={proSettings.shoulderFireSensMultiplier}
					/>
				</div>
				<div>
					<label class="block text-xs text-slate-400" for="adsSens1_25x"
						>{m['content.players.pro_settings.ads_sens_1_25x']()}</label
					>
					<input
						name="adsSens1_25x"
						id="adsSens1_25x"
						type="number"
						step="0.0001"
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						bind:value={proSettings.adsSens1_25x}
					/>
				</div>
				<div>
					<label class="block text-xs text-slate-400" for="adsSens1_5x"
						>{m['content.players.pro_settings.ads_sens_1_5x']()}</label
					>
					<input
						name="adsSens1_5x"
						id="adsSens1_5x"
						type="number"
						step="0.0001"
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						bind:value={proSettings.adsSens1_5x}
					/>
				</div>
				<div>
					<label class="block text-xs text-slate-400" for="adsSens2_5x"
						>{m['content.players.pro_settings.ads_sens_2_5x']()}</label
					>
					<input
						name="adsSens2_5x"
						id="adsSens2_5x"
						type="number"
						step="0.0001"
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						bind:value={proSettings.adsSens2_5x}
					/>
				</div>
				<div>
					<label class="block text-xs text-slate-400" for="adsSens4_0x"
						>{m['content.players.pro_settings.ads_sens_4_0x']()}</label
					>
					<input
						name="adsSens4_0x"
						id="adsSens4_0x"
						type="number"
						step="0.0001"
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						bind:value={proSettings.adsSens4_0x}
					/>
				</div>
			</div>
		</div>

		<div>
			<input
				type="hidden"
				name="socialAccounts"
				value={JSON.stringify(newPlayer.socialAccounts || [])}
			/>
			<label class="block text-sm font-medium text-slate-300" for="socialAccounts">
				{m.social_accounts()}
			</label>
			<div class="mt-2 rounded-lg border border-slate-700 bg-slate-800 p-4">
				{#each newPlayer.socialAccounts || [] as account, i (account.platformId)}
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
								{#each socialPlatforms as platform (platform.id)}
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
						{#each filteredUsers as user (user.id)}
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
