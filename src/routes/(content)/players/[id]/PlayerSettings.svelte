<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import type { ProSettings } from '$lib/server/db/schema';
	import MaterialSymbolsMouse from '~icons/material-symbols/mouse';

	let { proSettings }: { proSettings: ProSettings | undefined } = $props();
</script>

<div class="glass rounded-2xl p-6 md:col-span-3">
	<h2 class="mb-4 text-xl font-bold">{m['content.players.pro_settings.settings']()}</h2>
	{#if proSettings}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4">
			<div
				class="grid grid-cols-[auto_1fr] items-center justify-center gap-4 rounded-lg bg-slate-800/50 p-4 sm:col-span-3 md:col-span-4"
			>
				<MaterialSymbolsMouse class="size-12" />
				<div class="flex flex-col">
					<div class="text-sm text-gray-400">{m['content.players.pro_settings.mouse_model']()}</div>
					<div class="text-2xl font-bold text-white">
						{#if !proSettings.mouseModel}
							-
						{:else}
							<a
								href={`https://google.com/search?q=${proSettings.mouseModel}`}
								class="hover:underline"
								target="_blank"
							>
								{proSettings.mouseModel}
							</a>
						{/if}
					</div>
				</div>
			</div>
			<div class="rounded-lg bg-slate-800/50 p-4">
				<div class="text-sm text-gray-400">{m['content.players.pro_settings.dpi']()}</div>
				<div class="text-2xl font-bold text-white">{proSettings.dpi ?? '-'}</div>
			</div>
			<div class="rounded-lg bg-slate-800/50 p-4">
				<div class="text-sm text-gray-400">{m['content.players.pro_settings.sensitivity']()}</div>
				<div class="text-2xl font-bold text-white">{proSettings.sensitivity ?? '-'}</div>
			</div>
			<div class="rounded-lg bg-slate-800/50 p-4">
				<div class="text-sm text-gray-400">{m['content.players.pro_settings.edpi']()}</div>
				<div class="text-2xl font-bold text-white">
					{#if proSettings.dpi && proSettings.sensitivity}
						{(proSettings.dpi * proSettings.sensitivity).toFixed(2)}
					{:else}
						-
					{/if}
				</div>
			</div>
			<div class="rounded-lg bg-slate-800/50 p-4">
				<div class="text-sm text-gray-400">{m['content.players.pro_settings.polling_rate']()}</div>
				<div class="text-2xl font-bold text-white">
					{#if proSettings.pollingRateHz}
						{proSettings.pollingRateHz}<span class="text-base"> Hz</span>
					{:else}
						-
					{/if}
				</div>
			</div>
			<div class="rounded-lg bg-slate-800/50 p-4">
				<div class="text-sm text-gray-400">
					{m['content.players.pro_settings.windows_pointer_speed']()}
				</div>
				<div class="text-2xl font-bold text-white">
					{proSettings.windowsPointerSpeed ?? '-'}
				</div>
			</div>
			<div class="rounded-lg bg-slate-800/50 p-4">
				<div class="text-sm text-gray-400">
					{m['content.players.pro_settings.mouse_smoothing']()}
				</div>
				<div class="text-2xl font-bold text-white">
					{#if proSettings.mouseSmoothing === true}
						{m.on()}
					{:else if proSettings.mouseSmoothing === false}
						{m.off()}
					{:else}
						-
					{/if}
				</div>
			</div>

			<div class="rounded-lg bg-slate-800/50 p-4">
				<div class="text-sm text-gray-400">
					{m['content.players.pro_settings.vertical_sens_multiplier']()}
				</div>
				<div class="text-2xl font-bold text-white">{proSettings.verticalSensMultiplier ?? '-'}</div>
			</div>
			<div class="rounded-lg bg-slate-800/50 p-4">
				<div class="text-sm text-gray-400">
					{m['content.players.pro_settings.shoulder_fire_sens_multiplier']()}
				</div>
				<div class="text-2xl font-bold text-white">
					{proSettings.shoulderFireSensMultiplier ?? '-'}
				</div>
			</div>
			<div class="rounded-lg bg-slate-800/50 p-4">
				<div class="text-sm text-gray-400">
					{m['content.players.pro_settings.ads_sens_1_25x']()}
				</div>
				<div class="text-2xl font-bold text-white">{proSettings.adsSens1_25x ?? '-'}</div>
			</div>
			<div class="rounded-lg bg-slate-800/50 p-4">
				<div class="text-sm text-gray-400">{m['content.players.pro_settings.ads_sens_1_5x']()}</div>
				<div class="text-2xl font-bold text-white">{proSettings.adsSens1_5x ?? '-'}</div>
			</div>
			<div class="rounded-lg bg-slate-800/50 p-4">
				<div class="text-sm text-gray-400">{m['content.players.pro_settings.ads_sens_2_5x']()}</div>
				<div class="text-2xl font-bold text-white">{proSettings.adsSens2_5x ?? '-'}</div>
			</div>
			<div class="rounded-lg bg-slate-800/50 p-4">
				<div class="text-sm text-gray-400">{m['content.players.pro_settings.ads_sens_4_0x']()}</div>
				<div class="text-2xl font-bold text-white">{proSettings.adsSens4_0x ?? '-'}</div>
			</div>
		</div>
	{:else}
		<div class="text-gray-400">{m.no_data()}</div>
		<div class="mt-4 text-center">
			{#snippet renderMessage()}
				{@const message = m['content.players.pro_settings.no_settings_available']({
					linkStart: '{{LINK_START}}',
					linkEnd: '{{LINK_END}}'
				})}
				{@const parts = message.split(/\{\{LINK_START\}\}|\{\{LINK_END\}\}/)}
				{#each parts as part, i}
					{#if i % 2 === 1 && part.trim()}
						<a
							class="text-yellow-500 transition-colors hover:text-yellow-400 hover:underline"
							href="/about"
						>
							{part.trim()}
						</a>
					{:else if part.trim()}
						{part}
					{/if}
				{/each}
			{/snippet}
			{@render renderMessage()}
		</div>
	{/if}
</div>
