<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<div class={['animate-pulse rounded-sm bg-surface-muted', className]} aria-hidden="true"></div>
