FROM mcr.microsoft.com/playwright:v1.24.0-focal

WORKDIR /app
RUN mkdir -p /app
ADD . /app
RUN yarn install
RUN npx playwright install --with-deps
RUN yarn build
ENTRYPOINT ["node", "dist/main.js"]
CMD ["server"]
EXPOSE 8080
