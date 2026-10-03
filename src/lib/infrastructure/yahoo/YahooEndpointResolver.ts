const YAHOO_ORIGIN = 'https://query1.finance.yahoo.com';
const SAME_ORIGIN_PREFIX = '/yf';

export class YahooEndpointResolver {
	constructor(private readonly corsProxyTemplate: string | null) {}

	resolve(path: string, params: Record<string, string>): string {
		const target = `${path}?${new URLSearchParams(params).toString()}`;
		return this.corsProxyTemplate
			? this.corsProxyTemplate.replace('{url}', encodeURIComponent(YAHOO_ORIGIN + target))
			: SAME_ORIGIN_PREFIX + target;
	}
}
