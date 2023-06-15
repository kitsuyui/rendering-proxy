FROM mcr.microsoft.com/playwright:v1.35.1-focal
RUN apt update && apt install libgudev-1.0-0 && apt clean && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN mkdir -p /app
ADD yarn.lock /app/
ADD package.json /app/
RUN yarn install
RUN npx playwright install --with-deps
ADD . /app
RUN yarn build
ENTRYPOINT ["node", "dist/main.js"]
CMD ["server"]
EXPOSE 8080
