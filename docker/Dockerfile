FROM mcr.microsoft.com/playwright:v1.58.2-noble
RUN apt update && apt install -y libgudev-1.0-0 libsoup2.4-1 libsoup2.4-dev && apt clean && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN mkdir -p /app
ADD bun.lock /app/
ADD package.json /app/

FROM node:24-slim AS base
RUN apt update && apt install -y libgudev-1.0-0 libsoup2.4-1 libsoup2.4-dev && apt clean && rm -rf /var/lib/apt/lists/*
RUN npm install -g bun@1.3.11
ADD . /app
WORKDIR /app
RUN --mount=type=cache,id=bun-cache,target=/root/.bun/install/cache bun install --frozen-lockfile
RUN --mount=type=cache,id=bun-cache,target=/root/.bun/install/cache bunx playwright install --with-deps
RUN --mount=type=cache,id=bun-cache,target=/root/.bun/install/cache bun run build
ENTRYPOINT ["node", "dist/main.js"]
CMD ["server"]
EXPOSE 8080
