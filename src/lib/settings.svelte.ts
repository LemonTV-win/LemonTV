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

// Generic multi-dismissible store with categories and versioning
type DismissalEntry = { v: number; at: number; exp?: number };
type DismissalCategoryMap = Record<string, DismissalEntry>;
type DismissalStoreMap = Record<string, DismissalCategoryMap>;

class DismissibleStore {
	#storageKeyV2 = 'lemonTV.dismissals.v2';
	#legacyBannerKeyV1 = 'lemonTV.banner.dismissals.v1';
	#map = $state(this.#loadAll());

	constructor() {
		if (browser) {
			window.addEventListener('storage', this.#onStorage);
		}
	}

	#loadAll(): DismissalStoreMap {
		if (!browser) return {};
		const now = Date.now();
		const result: DismissalStoreMap = {};
		try {
			const raw = localStorage.getItem(this.#storageKeyV2);
			if (raw) {
				const parsed = JSON.parse(raw);
				if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
					for (const [category, entries] of Object.entries(parsed as Record<string, unknown>)) {
						if (entries && typeof entries === 'object' && !Array.isArray(entries)) {
							const cat: DismissalCategoryMap = {};
							for (const [id, entry] of Object.entries(entries as Record<string, unknown>)) {
								if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
									const e = entry as Partial<DismissalEntry>;
									const v = typeof e.v === 'number' && Number.isFinite(e.v) ? e.v : undefined;
									const at = typeof e.at === 'number' && Number.isFinite(e.at) ? e.at : now;
									const exp =
										typeof e.exp === 'number' && Number.isFinite(e.exp) ? e.exp : undefined;
									if (typeof v === 'number' && (!exp || exp > now)) {
										cat[id] = { v, at, exp };
									}
								}
							}
							if (Object.keys(cat).length > 0) {
								result[category] = cat;
							}
						}
					}
				}
			}
		} catch {
			console.error('Failed to load dismissals', this.#storageKeyV2);
		}

		// Migrate legacy banner-only map if present
		try {
			const legacyRaw = localStorage.getItem(this.#legacyBannerKeyV1);
			if (legacyRaw) {
				const parsed = JSON.parse(legacyRaw);
				if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
					const bannerCat: DismissalCategoryMap = result['banner'] ?? {};
					for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
						if (typeof value === 'number' && Number.isFinite(value)) {
							bannerCat[id] = { v: value, at: now };
						}
					}
					if (Object.keys(bannerCat).length > 0) {
						result['banner'] = bannerCat;
					}
					try {
						localStorage.removeItem(this.#legacyBannerKeyV1);
					} catch {
						console.error('Failed to remove legacy banner key', this.#legacyBannerKeyV1);
					}
				}
			}
		} catch {
			console.error('Failed to migrate legacy banner key', this.#legacyBannerKeyV1);
		}

		return result;
	}

	#saveAll(map: DismissalStoreMap): void {
		if (!browser) return;
		try {
			localStorage.setItem(this.#storageKeyV2, JSON.stringify(map));
		} catch {
			console.error('Failed to save dismissals', this.#storageKeyV2);
		}
	}

	isDismissed(category: string, id: string, version = 1): boolean {
		const entry = this.#map[category]?.[id];
		if (!entry) return false;
		if (entry.exp && entry.exp <= Date.now()) {
			this.reset(category, id);
			return false;
		}
		return entry.v >= version;
	}

	dismiss(category: string, id: string, version = 1, options?: { expiresAt?: number }): void {
		const current: DismissalStoreMap = { ...this.#map };
		const cat: DismissalCategoryMap = { ...(current[category] ?? {}) };
		cat[id] = { v: version, at: Date.now(), exp: options?.expiresAt };
		current[category] = cat;
		this.#map = current;
		this.#saveAll(current);
	}

	reset(category: string, id: string): void {
		const current: DismissalStoreMap = { ...this.#map };
		if (!current[category]) return;
		const cat: DismissalCategoryMap = { ...current[category] };
		if (id in cat) {
			delete cat[id];
			if (Object.keys(cat).length === 0) {
				delete current[category];
			} else {
				current[category] = cat;
			}
			this.#map = current;
			this.#saveAll(current);
		}
	}

	resetCategory(category: string): void {
		const current: DismissalStoreMap = { ...this.#map };
		if (current[category]) {
			delete current[category];
			this.#map = current;
			this.#saveAll(current);
		}
	}

	resetAll(): void {
		this.#map = {};
		this.#saveAll(this.#map);
	}

	list(category?: string): Record<string, DismissalEntry> | DismissalStoreMap {
		if (category) return { ...(this.#map[category] ?? {}) };
		return { ...this.#map };
	}

	#onStorage = (event: StorageEvent) => {
		if (event.key === this.#storageKeyV2 || event.key === this.#legacyBannerKeyV1) {
			this.#map = this.#loadAll();
		}
	};
}

export const dismissibles = new DismissibleStore();

// Backward-compatible banner-specific wrapper
class BannerStoreWrapper {
	isDismissed(id: string, version = 1): boolean {
		return dismissibles.isDismissed('banner', id, version);
	}

	dismiss(id: string, version = 1, options?: { expiresAt?: number }): void {
		dismissibles.dismiss('banner', id, version, options);
	}

	reset(id: string): void {
		dismissibles.reset('banner', id);
	}
}

export const bannerStore = new BannerStoreWrapper();
