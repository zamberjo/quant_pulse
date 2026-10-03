(function () {
	var theme;
	try {
		theme = localStorage.getItem('qp:theme');
	} catch {
		theme = null;
	}
	if (theme !== 'light' && theme !== 'dark') {
		theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	document.documentElement.dataset.theme = theme;
})();
