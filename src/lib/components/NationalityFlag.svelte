<script lang="ts">
	import countryCodeToFlagEmoji from 'country-code-to-flag-emoji';
	import { getLocale } from '$lib/paraglide/runtime';
	import { countryCodeToLocalizedName } from '$lib/utils/strings';

	let {
		nationality,
		showLabel = false,
		class: className = ''
	}: {
		nationality: string | null;
		showLabel?: boolean;
		class?: string;
	} = $props();
</script>

{#if nationality}
	<span
		class="font-emoji {className}"
		title={`${nationality} - ${countryCodeToLocalizedName(nationality, getLocale())}`}
	>
		{#if getLocale() === 'zh'}
			{#if nationality === 'TW'}
				TW
			{:else if nationality === 'HK'}
				{countryCodeToFlagEmoji('CN')}
				{countryCodeToFlagEmoji('HK')}
			{:else if nationality === 'MO'}
				{countryCodeToFlagEmoji('CN')}
				{countryCodeToFlagEmoji('MO')}
			{:else}
				{countryCodeToFlagEmoji(nationality)}
			{/if}
		{:else}
			{countryCodeToFlagEmoji(nationality)}
		{/if}
	</span>
	{#if showLabel}
		<span class=" text-gray-400">
			{countryCodeToLocalizedName(nationality, getLocale())}
		</span>
	{/if}
{:else}
	<span class="font-emoji {className}">{countryCodeToFlagEmoji('ZZ')}</span>
{/if}
