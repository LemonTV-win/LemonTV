// Lightweight global toast store (Svelte 5 runes).
//
// Usage:
//   import { toast } from '$lib/stores/toast.svelte';
//   toast.success(m.saved());
//   toast.error(m.error_occurred());
//
// Render `<Toaster />` once near the root of a layout to display them.

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
	id: number;
	type: ToastType;
	message: string;
}

const DEFAULT_DURATION: Record<ToastType, number> = {
	success: 4000,
	info: 4000,
	error: 6000
};

class ToastStore {
	items = $state<Toast[]>([]);
	#nextId = 0;
	#timers = new Map<number, ReturnType<typeof setTimeout>>();

	#push(type: ToastType, message: string, durationMs?: number): number {
		const id = this.#nextId++;
		this.items.push({ id, type, message });
		const duration = durationMs ?? DEFAULT_DURATION[type];
		if (duration > 0) {
			this.#timers.set(
				id,
				setTimeout(() => this.dismiss(id), duration)
			);
		}
		return id;
	}

	success(message: string, durationMs?: number): number {
		return this.#push('success', message, durationMs);
	}

	error(message: string, durationMs?: number): number {
		return this.#push('error', message, durationMs);
	}

	info(message: string, durationMs?: number): number {
		return this.#push('info', message, durationMs);
	}

	dismiss(id: number): void {
		const index = this.items.findIndex((t) => t.id === id);
		if (index !== -1) this.items.splice(index, 1);
		const timer = this.#timers.get(id);
		if (timer) {
			clearTimeout(timer);
			this.#timers.delete(id);
		}
	}
}

export const toast = new ToastStore();
