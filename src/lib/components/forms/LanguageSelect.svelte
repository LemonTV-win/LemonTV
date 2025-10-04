<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { locales } from '$lib/paraglide/runtime';
	import { toLocaleTitleCase } from '$lib/utils/strings';

	interface Props {
		value?: string | null;
		id?: string;
		name?: string;
		placeholder?: string;
		class?: string;
		languages?: string[];
		includeEmptyOption?: boolean;
		onchange?: ({ value }: { value: string | null }) => void;
	}

	let {
		value = $bindable<string | null>(null),
		id = undefined,
		name = undefined,
		placeholder = m['select_language'](), // TODO: Rename slogans.select_language to select_language
		class: className = '',
		languages = [...locales],
		includeEmptyOption = true,
		onchange = undefined
	}: Props = $props();

	function getNativeLanguageName(code: string): string {
		try {
			const display = new Intl.DisplayNames([code], { type: 'language' });
			const name = display.of(code) || code;
			return toLocaleTitleCase(name, code);
		} catch (e) {
			return code;
		}
	}

	$effect(() => {
		onchange?.({ value });
	});
</script>

<select {id} {name} class={className} bind:value>
	{#if includeEmptyOption}
		<option value={null}>{placeholder}</option>
	{/if}
	{#each languages as code (code)}
		{@const label = `${code} — ${getNativeLanguageName(code)}`}
		<option value={code}>{label}</option>
	{/each}
</select>
