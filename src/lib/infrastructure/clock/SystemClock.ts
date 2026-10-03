import type { ClockPort } from '$lib/domain/ports/ClockPort';

export class SystemClock implements ClockPort {
	now(): number {
		return Date.now();
	}
}
