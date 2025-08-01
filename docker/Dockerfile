FROM mcr.microsoft.com/playwright:v1.54.2-noble
RUN apt update && apt install -y libgudev-1.0-0 libsoup2.4-1 libsoup2.4-dev && apt clean && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN mkdir -p /app
ADD pnpm-lock.yaml /app/
ADD package.json /app/

FROM node:24-slim AS base
RUN apt update && apt install -y libgudev-1.0-0 libsoup2.4-1 libsoup2.4-dev && apt clean && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@latest --activate
ADD . /app
WORKDIR /app
RUN --mount=type=cache,id=pnpm-cache,target=/pnpm/store/ pnpm install
RUN --mount=type=cache,id=pnpm-cache,target=/pnpm/store/ pnpm exec playwright install --with-deps
RUN --mount=type=cache,id=pnpm-cache,target=/pnpm/store/ pnpm build
ENTRYPOINT ["node", "dist/main.js"]
CMD ["server"]
EXPOSE 8080
