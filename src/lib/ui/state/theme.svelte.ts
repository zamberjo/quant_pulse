export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'qp:theme';

class ThemeState {
	current = $state<Theme>('light');

	sync(): void {
		this.current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
	}

	toggle(): void {
		this.current = this.current === 'dark' ? 'light' : 'dark';
		document.documentElement.dataset.theme = this.current;
		try {
			localStorage.setItem(STORAGE_KEY, this.current);
		} catch {
			return;
		}
	}
}

export const theme = new ThemeState();
