FROM mcr.microsoft.com/playwright:v1.24.2-focal

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
