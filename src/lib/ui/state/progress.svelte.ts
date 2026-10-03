import type { AnalysisStage, ProgressReporter } from '$lib/application/progress/ProgressReporter';
import { i18n } from '$lib/ui/i18n/i18n.svelte';

const STAGE_PERCENT: Record<AnalysisStage, number> = {
	resolving: 10,
	quote: 30,
	history: 70,
	computing: 90,
	rendering: 100
};

class LoadingProgress implements ProgressReporter {
	stage = $state<AnalysisStage | null>(null);
	active = $state(false);
	failed = $state(false);

	readonly target = $derived(this.stage ? STAGE_PERCENT[this.stage] : 0);
	readonly label = $derived(
		this.failed ? i18n.t.progress.failed : this.stage ? i18n.t.progress.stages[this.stage] : ''
	);

	report(stage: AnalysisStage): void {
		this.active = true;
		this.failed = false;
		this.stage = stage;
	}

	finish(failed = false): void {
		this.failed = failed;
		this.stage = 'rendering';
		this.active = false;
	}

	reset(): void {
		this.stage = null;
		this.failed = false;
		this.active = false;
	}
}

export const loadingProgress = new LoadingProgress();
