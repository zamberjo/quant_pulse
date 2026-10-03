<script lang="ts">
	import { container } from '$lib/composition/container';
	import ErrorPanel from '$lib/ui/components/ErrorPanel.svelte';
	import DashboardSkeleton from '$lib/ui/components/DashboardSkeleton.svelte';
	import LazySection from '$lib/ui/components/LazySection.svelte';
	import QuoteHeader from '$lib/ui/components/QuoteHeader.svelte';
	import WatchlistPanel from '$lib/ui/components/WatchlistPanel.svelte';
	import { formatSessionDate } from '$lib/ui/formatters/date';
	import { i18n } from '$lib/ui/i18n/i18n.svelte';
	import MetricsGrid from '$lib/ui/sections/MetricsGrid.svelte';
	import { AnalysisController } from '$lib/ui/state/analysis.svelte';
	import { recentTickers, watchlist } from '$lib/ui/state/tickerLists.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const { analyzeSecurity, getLiveQuote } = container();
	const controller = new AnalysisController(analyzeSecurity, getLiveQuote, (ticker) =>
		recentTickers.add(ticker)
	);

	$effect(() => {
		void controller.load(data.ticker, data.range);
	});

	$effect(() => () => controller.dispose());

	$effect(() => {
		const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
		if (canonical)
			canonical.href = new URL(`/${encodeURIComponent(data.ticker)}`, canonical.href).href;
	});

	const analysis = $derived(controller.status === 'ready' ? controller.analysis : null);
	const title = $derived(
		analysis
			? i18n.t.meta.tickerTitle(analysis.ticker, analysis.quote.name)
			: i18n.t.meta.tickerTitle(data.ticker)
	);
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_14rem]">
	<div class="flex min-w-0 flex-col gap-6">
		{#if controller.status === 'error'}
			<ErrorPanel
				error={controller.error}
				ticker={data.ticker}
				onRetry={() => controller.retry()}
			/>
		{:else if analysis && controller.quote}
			<QuoteHeader
				quote={controller.quote}
				watched={watchlist.has(analysis.ticker)}
				onToggleWatch={() => watchlist.toggle(analysis.ticker)}
			/>
			<p class="-mt-3 text-xs text-ink-muted">
				{i18n.t.dashboard.analysisPeriod}
				<span class="num">{formatSessionDate(analysis.report.period.startDate)}</span>
				–
				<span class="num">{formatSessionDate(analysis.report.period.endDate)}</span>
				· <span class="num">{analysis.report.period.sessions}</span>
				{i18n.t.dashboard.sessions} · {i18n.t.dashboard.adjustedCloses}
			</p>
			<MetricsGrid report={analysis.report} riskFreeRate={analysis.settings.riskFreeRate} />
			<LazySection
				label={i18n.t.dashboard.charts}
				minHeight="40rem"
				load={() => import('$lib/ui/sections/ChartsSection.svelte')}
				props={{ report: analysis.report }}
			/>
			<LazySection
				label={i18n.t.contribution.heading}
				minHeight="56rem"
				load={() => import('$lib/ui/sections/ContributionSection.svelte')}
				props={{ report: analysis.report }}
			/>
			<LazySection
				label={i18n.t.dashboard.statistics}
				minHeight="48rem"
				load={() => import('$lib/ui/sections/StatisticsSection.svelte')}
				props={{ report: analysis.report }}
			/>
		{:else}
			<DashboardSkeleton />
		{/if}
	</div>

	<aside class="hidden lg:block" aria-label={i18n.t.watchlist.title}>
		<div class="sticky top-24"><WatchlistPanel range={data.range} current={data.ticker} /></div>
	</aside>
</div>
