import type { CachePort } from '$lib/domain/ports/CachePort';
import type { ClockPort } from '$lib/domain/ports/ClockPort';

const CACHE_NAMESPACE = 'qp:cache:';
const SCHEMA_VERSION = 'v1';

interface Entry<T> {
	readonly expiresAt: number;
	readonly value: T;
}

function parseEntry(raw: string): Entry<unknown> | null {
	try {
		const value: unknown = JSON.parse(raw);
		return isEntry(value) ? value : null;
	} catch {
		return null;
	}
}

function isEntry(value: unknown): value is Entry<unknown> {
	return (
		typeof value === 'object' &&
		value !== null &&
		'expiresAt' in value &&
		typeof value.expiresAt === 'number' &&
		'value' in value
	);
}

export class LocalStorageCache implements CachePort {
	readonly #prefix = `${CACHE_NAMESPACE}${SCHEMA_VERSION}:`;

	constructor(
		private readonly storage: Storage | null,
		private readonly clock: ClockPort
	) {
		this.#evict((key) => !key.startsWith(this.#prefix));
	}

	get<T>(key: string): T | null {
		const raw = this.#read(this.#prefix + key);
		if (raw === null) return null;
		const entry = parseEntry(raw);
		if (entry && entry.expiresAt > this.clock.now()) return entry.value as T;
		this.#remove(this.#prefix + key);
		return null;
	}

	set<T>(key: string, value: T, ttlMs: number): void {
		const payload = JSON.stringify({
			expiresAt: this.clock.now() + ttlMs,
			value
		} satisfies Entry<T>);
		if (this.#write(this.#prefix + key, payload)) return;
		this.#evict(() => true);
		this.#write(this.#prefix + key, payload);
	}

	#keys(): string[] {
		if (!this.storage) return [];
		const keys: string[] = [];
		for (let index = 0; index < this.storage.length; index++) {
			const key = this.storage.key(index);
			if (key?.startsWith(CACHE_NAMESPACE)) keys.push(key);
		}
		return keys;
	}

	#evict(predicate: (key: string) => boolean): void {
		for (const key of this.#keys()) if (predicate(key)) this.#remove(key);
	}

	#read(key: string): string | null {
		try {
			return this.storage?.getItem(key) ?? null;
		} catch {
			return null;
		}
	}

	#write(key: string, value: string): boolean {
		try {
			this.storage?.setItem(key, value);
			return true;
		} catch {
			return false;
		}
	}

	#remove(key: string): void {
		try {
			this.storage?.removeItem(key);
		} catch {
			return;
		}
	}
}
