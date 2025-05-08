<script lang="ts">
	import countryCodeToFlagEmoji from 'country-code-to-flag-emoji';
	import { getLocale } from '$lib/paraglide/runtime';
	import { countryCodeToLocalizedName } from '$lib/utils/strings';

	let {
		nationality,
		showLabel = false,
		className = ''
	} = $props<{
		nationality?: string;
		showLabel?: boolean;
		className?: string;
	}>();
</script>

{#if nationality}
	<span
		class="font-emoji {className}"
		title={`${nationality} - ${countryCodeToLocalizedName(nationality, getLocale())}`}
	>
		{countryCodeToFlagEmoji(nationality)}
	</span>
	{#if showLabel}
		<span class=" text-gray-400">
			{countryCodeToLocalizedName(nationality, getLocale())}
		</span>
	{/if}
{:else}
	<span class="font-emoji {className}">-</span>
{/if}
