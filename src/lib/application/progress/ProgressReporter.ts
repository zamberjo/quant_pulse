export const ANALYSIS_STAGES = ['resolving', 'quote', 'history', 'computing', 'rendering'] as const;

export type AnalysisStage = (typeof ANALYSIS_STAGES)[number];

export interface ProgressReporter {
	report(stage: AnalysisStage): void;
}
