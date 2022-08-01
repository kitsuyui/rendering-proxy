FROM alpine:3.16
RUN apk --update --no-cache add nodejs-current yarn tini chromium
WORKDIR /app
RUN mkdir -p /app
ADD . /app
ENV PUPPETEER_PRODUCT=chrome
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV CHROMIUM_EXECUTABLE=/usr/bin/chromium-browser
RUN yarn install
RUN yarn build
ENTRYPOINT ["tini", "--", "node", "dist/main.js"]
CMD ["server"]
EXPOSE 8080
