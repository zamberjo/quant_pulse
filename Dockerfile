FROM node:24-alpine AS deps
WORKDIR /app
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN npm install --global --no-fund --no-audit pnpm@11.26.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM deps AS build
ARG PUBLIC_SITE_URL=http://localhost:8080
ARG PUBLIC_CORS_PROXY=
ARG PUBLIC_RISK_FREE_RATE=0
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL \
	PUBLIC_CORS_PROXY=$PUBLIC_CORS_PROXY \
	PUBLIC_RISK_FREE_RATE=$PUBLIC_RISK_FREE_RATE \
	NODE_ENV=production
COPY . .
RUN pnpm run check && pnpm run test && pnpm run build

FROM nginx:1.30-alpine AS runtime
RUN rm -rf /docker-entrypoint.d/* /etc/nginx/conf.d/default.conf /usr/share/nginx/html/* && \
	mkdir -p /tmp/nginx && chown -R nginx:nginx /tmp/nginx
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/security-headers.conf /etc/nginx/security-headers.conf
COPY --from=build --chown=nginx:nginx /app/build /usr/share/nginx/html
RUN nginx -t && rm -rf /tmp/nginx/*
USER nginx
EXPOSE 8080
STOPSIGNAL SIGQUIT
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
	CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1
CMD ["nginx", "-g", "daemon off;"]
