<script lang="ts" module>
	export interface BarDatum {
		readonly key: string;
		readonly label: string;
		readonly tooltipLabel?: string;
		readonly value: number;
	}
</script>

<script lang="ts">
	import { barPath, niceScale } from '$lib/ui/charts/scale';
	import { i18n } from '$lib/ui/i18n/i18n.svelte';

	interface Props {
		data: readonly BarDatum[];
		title: string;
		description: string;
		format: (value: number) => string;
		height?: number;
	}

	let { data, title, description, format, height = 224 }: Props = $props();

	const id = $props.id();
	const margin = { top: 12, right: 8, bottom: 26, left: 56 };
	const MIN_LABEL_SPACING = 68;

	let width = $state(0);
	let activeIndex = $state<number | null>(null);

	const innerWidth = $derived(Math.max(0, width - margin.left - margin.right));
	const innerHeight = $derived(height - margin.top - margin.bottom);
	const scale = $derived(niceScale(data.map((datum) => datum.value)));
	const band = $derived(data.length > 0 ? innerWidth / data.length : 0);
	const gap = $derived(band >= 8 ? 2 : band >= 4 ? 1 : 0);
	const labelEvery = $derived(
		Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(innerWidth / MIN_LABEL_SPACING))))
	);
	const active = $derived(activeIndex === null ? null : (data[activeIndex] ?? null));

	function y(value: number): number {
		return margin.top + ((scale.max - value) / (scale.max - scale.min)) * innerHeight;
	}

	function x(index: number): number {
		return margin.left + index * band;
	}

	function indexAt(clientX: number, element: Element): number | null {
		const offset = clientX - element.getBoundingClientRect().left - margin.left;
		const index = Math.floor(offset / band);
		return index >= 0 && index < data.length ? index : null;
	}

	function onKeydown(event: KeyboardEvent): void {
		if (data.length === 0) return;
		const last = data.length - 1;
		const current = activeIndex ?? last;
		const next: Record<string, number> = {
			ArrowLeft: Math.max(0, current - 1),
			ArrowRight: Math.min(last, current + 1),
			Home: 0,
			End: last,
			PageUp: Math.max(0, current - 10),
			PageDown: Math.min(last, current + 10)
		};
		const target = next[event.key];
		if (target === undefined) return;
		event.preventDefault();
		activeIndex = target;
	}

	const tooltipLeft = $derived(
		activeIndex === null ? 0 : Math.min(Math.max(x(activeIndex) + band / 2, 72), width - 72)
	);
</script>

<figure class="relative m-0">
	<div
		class="relative rounded-sm focus-ring"
		style:height="{height}px"
		bind:clientWidth={width}
		role="slider"
		tabindex="0"
		aria-label={title}
		aria-describedby="{id}-description"
		aria-valuemin={0}
		aria-valuemax={Math.max(0, data.length - 1)}
		aria-valuenow={activeIndex ?? Math.max(0, data.length - 1)}
		aria-valuetext={active
			? `${active.tooltipLabel ?? active.label}: ${format(active.value)}`
			: title}
		onkeydown={onKeydown}
		onfocus={() => (activeIndex ??= data.length > 0 ? data.length - 1 : null)}
		onblur={() => (activeIndex = null)}
		onpointerleave={() => (activeIndex = null)}
		onpointermove={(event) => (activeIndex = indexAt(event.clientX, event.currentTarget))}
	>
		{#if width > 0}
			<svg {width} {height} viewBox="0 0 {width} {height}" aria-hidden="true" class="block">
				<g class="text-[10px]">
					{#each scale.ticks as tick (tick)}
						<line
							x1={margin.left}
							x2={width - margin.right}
							y1={y(tick)}
							y2={y(tick)}
							class={tick === 0 ? 'stroke-line-strong' : 'stroke-line'}
							stroke-width="1"
							shape-rendering="crispEdges"
						/>
						<text
							x={margin.left - 8}
							y={y(tick)}
							dy="0.32em"
							text-anchor="end"
							class="fill-ink-muted num">{format(tick)}</text
						>
					{/each}
				</g>
				<g>
					{#each data as datum, index (datum.key)}
						<path
							d={barPath(x(index) + gap / 2, band - gap, y(0), y(datum.value), 4)}
							class={datum.value >= 0 ? 'fill-positive' : 'fill-negative'}
							opacity={activeIndex === null || activeIndex === index ? 1 : 0.45}
						/>
					{/each}
				</g>
				<g class="text-[10px]">
					{#each data as datum, index (datum.key)}
						{#if (data.length - 1 - index) % labelEvery === 0}
							<text
								x={x(index) + band / 2}
								y={height - 8}
								text-anchor={x(index) + band / 2 > width - 32 ? 'end' : 'middle'}
								class="fill-ink-muted num">{datum.label}</text
							>
						{/if}
					{/each}
				</g>
				{#if activeIndex !== null}
					<line
						x1={x(activeIndex) + band / 2}
						x2={x(activeIndex) + band / 2}
						y1={margin.top}
						y2={margin.top + innerHeight}
						class="stroke-ink-muted"
						stroke-dasharray="2 3"
						stroke-width="1"
					/>
				{/if}
			</svg>
		{/if}

		{#if active}
			<div
				class="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-md border border-line-strong bg-surface px-2.5 py-1.5 text-xs shadow-sm"
				style:left="{tooltipLeft}px"
			>
				<div class="text-ink-muted">{active.tooltipLabel ?? active.label}</div>
				<div
					class={[
						'num font-semibold',
						active.value > 0 && 'text-positive',
						active.value < 0 && 'text-negative'
					]}
				>
					{format(active.value)}
				</div>
			</div>
		{/if}
	</div>
	<div class="sr-only">
		<table>
			<caption>{title}</caption>
			<thead
				><tr
					><th scope="col">{i18n.t.charts.period}</th><th scope="col">{i18n.t.charts.value}</th></tr
				></thead
			>
			<tbody>
				{#each data as datum (datum.key)}
					<tr
						><th scope="row">{datum.tooltipLabel ?? datum.label}</th><td>{format(datum.value)}</td
						></tr
					>
				{/each}
			</tbody>
		</table>
	</div>
	<figcaption id="{id}-description" class="sr-only">{description}</figcaption>
</figure>
