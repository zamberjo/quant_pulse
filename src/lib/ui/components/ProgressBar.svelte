<script lang="ts">
	import { untrack } from 'svelte';
	import { i18n } from '$lib/ui/i18n/i18n.svelte';
	import { loadingProgress } from '$lib/ui/state/progress.svelte';

	const EASING_MS = 140;
	const HIDE_DELAY_MS = 450;

	let displayed = $state(0);
	let visible = $state(false);

	const percent = $derived(Math.round(displayed));

	$effect(() => {
		const target = loadingProgress.target;
		const active = loadingProgress.active;
		const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

		untrack(() => {
			if (active && !visible) {
				displayed = 0;
				visible = true;
			}
		});
		if (!active && target === 0) {
			visible = false;
			displayed = 0;
			return;
		}

		let frame = 0;
		let hideTimer: ReturnType<typeof setTimeout> | undefined;
		let previous = performance.now();

		const settle = () => {
			displayed = target;
			if (!active) hideTimer = setTimeout(() => (visible = false), HIDE_DELAY_MS);
		};

		const step = (now: number) => {
			const delta = target - displayed;
			if (reducedMotion || Math.abs(delta) < 0.2) return settle();
			displayed += delta * (1 - Math.exp(-Math.max(0, now - previous) / EASING_MS));
			previous = now;
			frame = requestAnimationFrame(step);
		};
		frame = requestAnimationFrame(step);

		return () => {
			cancelAnimationFrame(frame);
			clearTimeout(hideTimer);
		};
	});
</script>

<div
	class={[
		'pointer-events-none absolute inset-x-0 top-full transition-opacity duration-300',
		visible ? 'opacity-100' : 'opacity-0'
	]}
	aria-hidden={!visible}
>
	<div
		class="h-0.5 w-full overflow-hidden bg-line"
		role="progressbar"
		aria-label={i18n.t.progress.label}
		aria-valuemin={0}
		aria-valuemax={100}
		aria-valuenow={percent}
		aria-valuetext="{loadingProgress.label} {percent}%"
	>
		<div
			class="h-full w-full origin-left bg-accent"
			style:transform="scaleX({displayed / 100})"
		></div>
	</div>
	<div class="mx-auto flex max-w-screen-2xl justify-end px-4 sm:px-6">
		<span
			class="rounded-b border border-t-0 border-line bg-surface px-2 py-0.5 num text-[0.6875rem] text-ink-muted"
		>
			{loadingProgress.label}<span class="mx-1.5 text-line-strong">|</span>{String(
				percent
			).padStart(3, ' ')}%
		</span>
	</div>
</div>
<div class="sr-only" aria-live="polite">{visible ? loadingProgress.label : ''}</div>
