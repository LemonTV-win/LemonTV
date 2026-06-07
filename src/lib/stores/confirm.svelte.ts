// Global confirmation-dialog store (Svelte 5 runes).
//
// Usage:
//   import { confirm } from '$lib/stores/confirm.svelte';
//   if (await confirm.ask({ message: m.delete_confirm(), destructive: true })) {
//     // perform the action
//   }
//
// Render `<ConfirmDialog />` once near the root of a layout to display the prompt.

export interface ConfirmOptions {
	title?: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	/** Styles the confirm button as destructive (red). */
	destructive?: boolean;
}

interface ActiveConfirm extends ConfirmOptions {
	resolve: (value: boolean) => void;
}

class ConfirmStore {
	current = $state<ActiveConfirm | null>(null);

	ask(options: ConfirmOptions): Promise<boolean> {
		// Resolve any previously open prompt as cancelled before opening a new one.
		this.current?.resolve(false);
		return new Promise<boolean>((resolve) => {
			this.current = { ...options, resolve };
		});
	}

	#settle(value: boolean): void {
		const active = this.current;
		this.current = null;
		active?.resolve(value);
	}

	confirm(): void {
		this.#settle(true);
	}

	cancel(): void {
		this.#settle(false);
	}
}

export const confirm = new ConfirmStore();
