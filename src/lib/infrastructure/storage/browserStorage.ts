/** Returns localStorage when it is present and writable (it throws in some private modes). */
export function browserStorage(): Storage | null {
	try {
		const storage = globalThis.localStorage;
		const probe = '__quantpulse_probe__';
		storage.setItem(probe, probe);
		storage.removeItem(probe);
		return storage;
	} catch {
		return null;
	}
}
