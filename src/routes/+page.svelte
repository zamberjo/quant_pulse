<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Cpu from '@lucide/svelte/icons/cpu';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Sigma from '@lucide/svelte/icons/sigma';
	import { DEFAULT_RANGE } from '$lib/domain/entities/Range';
	import WatchlistPanel from '$lib/ui/components/WatchlistPanel.svelte';
	import { i18n } from '$lib/ui/i18n/i18n.svelte';
	import { tickerHref } from '$lib/ui/navigation';

	const FEATURED = [
		{ ticker: 'SPY', name: 'SPDR S&P 500 ETF' },
		{ ticker: 'QQQ', name: 'Invesco QQQ Trust' },
		{ ticker: 'AAPL', name: 'Apple Inc.' },
		{ ticker: 'MSFT', name: 'Microsoft Corporation' },
		{ ticker: 'NVDA', name: 'NVIDIA Corporation' },
		{ ticker: 'VWCE.DE', name: 'Vanguard FTSE All-World' },
		{ ticker: '^GSPC', name: 'S&P 500 Index' },
		{ ticker: 'BTC-USD', name: 'Bitcoin / US Dollar' }
	];

	const PILLAR_ICONS = [Sigma, Cpu, ShieldCheck];

	const t = $derived(i18n.t.home);
</script>

<svelte:head>
	<title>{i18n.t.meta.homeTitle}</title>
</svelte:head>

<div class="grid gap-8 lg:grid-cols-[1fr_16rem]">
	<div class="flex flex-col gap-10">
		<section class="flex max-w-3xl flex-col gap-4 pt-4" aria-labelledby="hero-title">
			<p class="eyebrow">{t.eyebrow}</p>
			<h1 id="hero-title" class="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
				{t.title}
			</h1>
			<p class="max-w-2xl text-base text-pretty text-ink-muted">{t.intro}</p>
		</section>

		<section aria-labelledby="featured-title" class="flex flex-col gap-3">
			<h2 id="featured-title" class="eyebrow">{t.featured}</h2>
			<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{#each FEATURED as security (security.ticker)}
					<li>
						<a
							href={tickerHref(security.ticker, DEFAULT_RANGE)}
							class="panel group flex items-center justify-between gap-3 p-4 hover:border-line-strong"
						>
							<span class="flex min-w-0 flex-col">
								<span class="num text-sm font-semibold">{security.ticker}</span>
								<span class="truncate text-xs text-ink-muted">{security.name}</span>
							</span>
							<ArrowRight
								class="size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5"
								aria-hidden="true"
							/>
						</a>
					</li>
				{/each}
			</ul>
		</section>

		<section aria-labelledby="pillars-title" class="flex flex-col gap-3">
			<h2 id="pillars-title" class="sr-only">{t.why}</h2>
			<ul class="grid gap-3 md:grid-cols-3">
				{#each t.pillars as pillar, index (index)}
					{@const Icon = PILLAR_ICONS[index] ?? Sigma}
					<li class="panel flex flex-col gap-2 p-5">
						<Icon class="size-4 text-accent-soft" aria-hidden="true" />
						<h3 class="text-sm font-semibold">{pillar.title}</h3>
						<p class="text-sm text-ink-muted">{pillar.body}</p>
					</li>
				{/each}
			</ul>
		</section>
	</div>

	<aside class="hidden lg:block" aria-label={i18n.t.watchlist.title}>
		<div class="sticky top-24"><WatchlistPanel range={DEFAULT_RANGE} /></div>
	</aside>
</div>
