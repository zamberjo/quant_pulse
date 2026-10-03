export interface RuntimeConfig {
	readonly corsProxyTemplate: string | null;
	readonly riskFreeRate: number;
}

function parseProxyTemplate(raw: string | undefined): string | null {
	const template = raw?.trim();
	if (!template) return null;
	if (!template.includes('{url}'))
		throw new Error('PUBLIC_CORS_PROXY must contain a {url} placeholder.');
	return template;
}

function parseRate(raw: string | undefined): number {
	const rate = Number(raw ?? 0);
	if (!Number.isFinite(rate) || rate < -0.1 || rate > 0.5) {
		throw new Error('PUBLIC_RISK_FREE_RATE must be a decimal annual rate, e.g. 0.04.');
	}
	return rate;
}

export const runtimeConfig: RuntimeConfig = Object.freeze({
	corsProxyTemplate: parseProxyTemplate(import.meta.env.PUBLIC_CORS_PROXY),
	riskFreeRate: parseRate(import.meta.env.PUBLIC_RISK_FREE_RATE)
});
