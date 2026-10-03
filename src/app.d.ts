declare global {
	namespace App {}

	interface ImportMetaEnv {
		readonly PUBLIC_SITE_URL?: string;
		readonly PUBLIC_CORS_PROXY?: string;
		readonly PUBLIC_RISK_FREE_RATE?: string;
	}

	interface ImportMeta {
		readonly env: ImportMetaEnv;
	}
}

export {};
