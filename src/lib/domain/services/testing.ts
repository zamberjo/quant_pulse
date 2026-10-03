import { toSessionDate, type SessionPoint } from './calendar';

export function sessionPoints(entries: readonly [iso: string, value: number][]): SessionPoint[] {
	return entries.map(([iso, value]) => ({
		date: toSessionDate(Date.parse(`${iso}T00:00:00Z`), 0),
		value
	}));
}
