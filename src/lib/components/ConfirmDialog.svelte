<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import { m } from '$lib/paraglide/messages';
	import { confirm } from '$lib/stores/confirm.svelte';
</script>

<Modal
	show={confirm.current !== null}
	title={confirm.current?.title ?? m.confirm_title()}
	size="compact"
	onClose={() => confirm.cancel()}
>
	<div class="flex h-full flex-col">
		<p class="text-sm text-slate-300">{confirm.current?.message}</p>
		<div class="mt-6 flex justify-end gap-4 border-t border-slate-700 pt-4">
			<button
				type="button"
				class="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
				onclick={() => confirm.cancel()}
			>
				{confirm.current?.cancelLabel ?? m.cancel()}
			</button>
			<button
				type="button"
				class="rounded-md px-4 py-2 font-medium {confirm.current?.destructive
					? 'bg-red-600 text-white hover:bg-red-700'
					: 'bg-yellow-500 text-black hover:bg-yellow-600'}"
				onclick={() => confirm.confirm()}
			>
				{confirm.current?.confirmLabel ?? m.confirm()}
			</button>
		</div>
	</div>
</Modal>
