import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const layer = (name, forbidden) => ({
	files: [`src/lib/${name}/**/*.{ts,svelte}`],
	rules: {
		'no-restricted-imports': [
			'error',
			{
				patterns: forbidden.map((group) => ({
					group: [group],
					message: `The ${name} layer must not depend on ${group}.`
				}))
			}
		]
	}
});

export default defineConfig(
	{ ignores: ['build/', '.svelte-kit/', 'node_modules/'] },
	js.configs.recommended,
	...ts.configs.strict,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: { 'no-undef': 'off' }
	},
	{
		// Internal URLs are built by src/lib/ui/navigation.ts, which applies resolve() centrally.
		files: ['**/*.svelte'],
		rules: {
			'svelte/no-navigation-without-resolve': ['error', { ignoreLinks: true, ignoreGoto: true }]
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	},
	layer('domain', [
		'$lib/application/*',
		'$lib/infrastructure/*',
		'$lib/ui/*',
		'$lib/composition/*',
		'svelte',
		'svelte/*',
		'$app/*'
	]),
	layer('application', [
		'$lib/infrastructure/*',
		'$lib/ui/*',
		'$lib/composition/*',
		'svelte',
		'svelte/*',
		'$app/*'
	]),
	layer('infrastructure', ['$lib/ui/*', '$lib/composition/*', 'svelte', 'svelte/*', '$app/*']),
	layer('ui', ['$lib/infrastructure/*'])
);
