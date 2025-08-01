<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import type { Snippet } from 'svelte';
	import MaterialSymbolsCloseRounded from '~icons/material-symbols/close-rounded';

	let {
		show = false,
		title = '',
		onClose = () => {},
		children,
		dismissible = true
	}: {
		show: boolean;
		title: string;
		onClose: () => void;
		children: Snippet;
		dismissible?: boolean;
	} = $props();

	function handleBackdropClick(event: MouseEvent) {
		if (dismissible && event.target === event.currentTarget) {
			onClose();
		}
	}

	function handleEscape(event: KeyboardEvent) {
		if (dismissible && event.key === 'Escape') {
			onClose();
		}
	}

	$effect(() => {
		if (show) {
			document.addEventListener('keydown', handleEscape);
			document.body.style.overflow = 'hidden';
		}
		return () => {
			document.removeEventListener('keydown', handleEscape);
			document.body.style.overflow = '';
		};
	});
</script>

{#if show}
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		onclick={handleBackdropClick}
		onkeydown={(e) => dismissible && e.key === 'Escape' && onClose()}
		role="presentation"
		tabindex="0"
	>
		<div
			class="relative max-h-[90vh] w-full max-w-2xl rounded-lg border border-slate-800 bg-slate-900/95 p-6 shadow-lg [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:bg-slate-800"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
		>
			<div class="mb-4 flex items-center justify-between">
				<h2 id="modal-title" class="text-xl font-semibold text-white">{title}</h2>
				{#if dismissible}
					<button
						type="button"
						class="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-300"
						onclick={onClose}
						aria-label={m.close()}
						title={m.close()}
					>
						<MaterialSymbolsCloseRounded class="h-6 w-6" />
					</button>
				{/if}
			</div>
			<div
				class="modal-content h-[calc(90vh-8rem)] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-800"
			>
				{@render children()}
			</div>
		</div>
	</div>
{/if}
