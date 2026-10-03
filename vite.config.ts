import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv, type Plugin, type ProxyOptions } from 'vite';
import { defineConfig } from 'vitest/config';

const YAHOO_ORIGIN = 'https://query1.finance.yahoo.com';

const yahooProxy: Record<string, ProxyOptions> = {
	'/yf': {
		target: YAHOO_ORIGIN,
		changeOrigin: true,
		rewrite: (path) => path.replace(/^\/yf/, ''),
		// Yahoo throttles full browser user agents; a minimal one is accepted.
		headers: { 'User-Agent': 'Mozilla/5.0' },
		configure: (proxy) => {
			proxy.on('proxyReq', (request) => {
				for (const header of ['cookie', 'origin', 'referer']) request.removeHeader(header);
			});
		}
	}
};

function seoFiles(siteUrl: string): Plugin {
	const origin = siteUrl.replace(/\/+$/, '');
	return {
		name: 'quantpulse:seo-files',
		apply: 'build',
		generateBundle() {
			if (this.environment.config.build.ssr) return;
			this.emitFile({
				type: 'asset',
				fileName: 'robots.txt',
				source: `User-agent: *\nAllow: /\n${origin ? `Sitemap: ${origin}/sitemap.xml\n` : ''}`
			});
			if (!origin) return;
			this.emitFile({
				type: 'asset',
				fileName: 'sitemap.xml',
				source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\t<url><loc>${origin}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n</urlset>\n`
			});
		}
	};
}

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), 'PUBLIC_');
	return {
		envPrefix: 'PUBLIC_',
		plugins: [tailwindcss(), sveltekit(), seoFiles(env.PUBLIC_SITE_URL ?? '')],
		// Fonts stay as cacheable files; inlined data: URIs would also violate font-src 'self'.
		build: { assetsInlineLimit: (file: string) => (file.endsWith('.woff2') ? false : undefined) },
		worker: { format: 'es' },
		server: { proxy: yahooProxy },
		preview: { proxy: yahooProxy },
		test: { include: ['src/**/*.test.ts'], environment: 'node' }
	};
});
