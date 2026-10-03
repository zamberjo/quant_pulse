<script lang="ts" generics="P extends Record<string, unknown>">
	import type { Component } from 'svelte';
	import { i18n } from '$lib/ui/i18n/i18n.svelte';

	interface Props {
		load: () => Promise<{ default: Component<P> }>;
		props: P;
		minHeight: string;
		label: string;
	}

	let { load, props, minHeight, label }: Props = $props();

	let sentinel = $state<HTMLElement>();
	let Loaded = $state.raw<Component<P> | null>(null);

	$effect(() => {
		if (!sentinel || Loaded) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				observer.disconnect();
				void load().then((module) => (Loaded = module.default));
			},
			{ rootMargin: '320px 0px' }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	});
</script>

{#if Loaded}
	<Loaded {...props} />
{:else}
	<div
		bind:this={sentinel}
		class="panel animate-pulse"
		style:min-height={minHeight}
		aria-busy="true"
		aria-label={i18n.t.dashboard.loadingSection(label)}
	></div>
{/if}
