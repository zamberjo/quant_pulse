import { en, type Messages } from './en';
import { es } from './es';

export const LOCALES = ['en', 'es'] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = { en: 'English', es: 'Español' };

const DICTIONARIES: Record<Locale, Messages> = { en, es };
const INTL_LOCALES: Record<Locale, string> = { en: 'en-US', es: 'es-ES' };
const STORAGE_KEY = 'qp:locale';

function isLocale(value: unknown): value is Locale {
	return LOCALES.some((locale) => locale === value);
}

export function detectLocale(stored: string | null, preferred: readonly string[]): Locale {
	if (isLocale(stored)) return stored;
	for (const language of preferred) {
		const base = language.toLowerCase().split('-')[0];
		if (isLocale(base)) return base;
	}
	return 'en';
}

function readStored(): string | null {
	try {
		return localStorage.getItem(STORAGE_KEY);
	} catch {
		return null;
	}
}

class I18n {
	locale = $state<Locale>('en');

	readonly t = $derived(DICTIONARIES[this.locale]);
	readonly intl = $derived(INTL_LOCALES[this.locale]);

	constructor() {
		if (typeof document === 'undefined') return;
		this.#apply(detectLocale(readStored(), navigator.languages));
	}

	set(locale: Locale): void {
		this.#apply(locale);
		try {
			localStorage.setItem(STORAGE_KEY, locale);
		} catch {
			return;
		}
	}

	#apply(locale: Locale): void {
		this.locale = locale;
		document.documentElement.lang = locale;
	}
}

export const i18n = new I18n();
