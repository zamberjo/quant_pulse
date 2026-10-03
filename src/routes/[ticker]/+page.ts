import { parseRange } from '$lib/domain/entities/Range';
import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = ({ params, url }) => ({
	ticker: params.ticker.toUpperCase(),
	range: parseRange(url.searchParams.get('range'))
});
