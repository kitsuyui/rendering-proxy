FROM mcr.microsoft.com/playwright:v1.61.0-noble AS base
RUN npm install -g bun@1.3.11
ADD . /app
WORKDIR /app
RUN --mount=type=cache,id=bun-cache,target=/root/.bun/install/cache bun install --frozen-lockfile
RUN --mount=type=cache,id=bun-cache,target=/root/.bun/install/cache bun run build
ENTRYPOINT ["node", "dist/main.js"]
CMD ["server"]
EXPOSE 8080
