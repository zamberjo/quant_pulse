<script lang="ts">
	import { i18n } from '$lib/ui/i18n/i18n.svelte';
	import Skeleton from './Skeleton.svelte';
</script>

<div class="flex flex-col gap-6" aria-busy="true" aria-label={i18n.t.dashboard.loading}>
	<div class="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
		<div class="flex flex-col gap-3">
			<Skeleton class="h-3 w-40" />
			<Skeleton class="h-7 w-64" />
			<Skeleton class="h-9 w-48" />
		</div>
		<Skeleton class="h-10 w-full sm:w-72" />
	</div>
	<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
		{#each { length: 8 }, index (index)}
			<div class="panel flex h-[8.5rem] flex-col gap-3 p-4">
				<Skeleton class="h-3 w-24" />
				<Skeleton class="h-6 w-28" />
				<Skeleton class="h-3 w-full" />
			</div>
		{/each}
	</div>
	<div class="panel h-80 p-5"><Skeleton class="h-full w-full" /></div>
</div>
