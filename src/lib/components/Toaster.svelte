<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { m } from '$lib/paraglide/messages';
	import { toast } from '$lib/stores/toast.svelte';
	import AlertCircle from '~icons/lucide/alert-circle';
	import CheckCircle from '~icons/lucide/check-circle';
	import InfoIcon from '~icons/lucide/info';
	import MaterialSymbolsCloseRounded from '~icons/material-symbols/close-rounded';

	const styles = {
		success: 'border-green-500/50 bg-green-950/90 text-green-200',
		error: 'border-red-500/50 bg-red-950/90 text-red-200',
		info: 'border-slate-500/50 bg-slate-900/90 text-slate-200'
	} as const;
</script>

<div
	class="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
	role="region"
	aria-live="polite"
	aria-label={m.notifications()}
>
	{#each toast.items as item (item.id)}
		<div
			animate:flip={{ duration: 200 }}
			in:fly={{ x: 24, duration: 200 }}
			out:fade={{ duration: 150 }}
			class="pointer-events-auto flex items-start gap-2 rounded-md border px-4 py-3 shadow-lg backdrop-blur-sm {styles[
				item.type
			]}"
			role="alert"
		>
			{#if item.type === 'success'}
				<CheckCircle class="mt-0.5 h-5 w-5 flex-shrink-0" />
			{:else if item.type === 'error'}
				<AlertCircle class="mt-0.5 h-5 w-5 flex-shrink-0" />
			{:else}
				<InfoIcon class="mt-0.5 h-5 w-5 flex-shrink-0" />
			{/if}
			<span class="flex-1 text-sm break-words">{item.message}</span>
			<button
				type="button"
				class="-mr-1 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100"
				onclick={() => toast.dismiss(item.id)}
				aria-label={m.close()}
				title={m.close()}
			>
				<MaterialSymbolsCloseRounded class="h-4 w-4" />
			</button>
		</div>
	{/each}
</div>
