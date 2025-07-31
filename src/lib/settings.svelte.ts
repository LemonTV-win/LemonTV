import { browser } from '$app/environment';

class LocalSettings {
	#spoilerMode = $state(this.#getSpoilerModeFromStorage());

	#getSpoilerModeFromStorage(): boolean {
		if (!browser) return false;
		const stored = localStorage.getItem('spoilerMode');
		return stored === 'true';
	}

	#setSpoilerModeToStorage(value: boolean): void {
		if (!browser) return;
		localStorage.setItem('spoilerMode', value.toString());
	}

	get spoilerMode() {
		return this.#spoilerMode;
	}

	set spoilerMode(value: boolean) {
		console.info('Setting spoiler mode to', value);
		this.#spoilerMode = value;
		this.#setSpoilerModeToStorage(value);
	}
}

export const settings = new LocalSettings();
