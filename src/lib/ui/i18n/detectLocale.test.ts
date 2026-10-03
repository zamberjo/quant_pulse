import { describe, expect, it } from 'vitest';
import { detectLocale } from './i18n.svelte';

describe('detectLocale', () => {
	it('prefers a stored choice', () => {
		expect(detectLocale('en', ['es-ES'])).toBe('en');
	});

	it('follows the first supported browser language', () => {
		expect(detectLocale(null, ['es-MX', 'en-US'])).toBe('es');
		expect(detectLocale(null, ['fr-FR', 'en-GB'])).toBe('en');
	});

	it('falls back to English', () => {
		expect(detectLocale('de', ['fr-FR'])).toBe('en');
	});
});
