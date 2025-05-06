<script lang="ts">
	import AlertCircle from '~icons/lucide/alert-circle';
	import CheckCircle from '~icons/lucide/check-circle';

	let { type = 'error', message }: { type: 'error' | 'success'; message: string } = $props();
</script>

<div
	class="mb-4 flex items-center gap-2 rounded-md border px-4 py-3 {type === 'error'
		? 'border-red-500/50 bg-red-500/10 text-red-500'
		: 'border-green-500/50 bg-green-500/10 text-green-500'}"
>
	{#if type === 'error'}
		<AlertCircle class="h-5 w-5" />
	{:else}
		<CheckCircle class="h-5 w-5" />
	{/if}
	<span class="flex-1 text-sm">{message}</span>
</div>
