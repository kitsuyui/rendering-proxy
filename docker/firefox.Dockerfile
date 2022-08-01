FROM alpine:3.16
RUN apk --update --no-cache add nodejs-current yarn tini firefox
WORKDIR /app
RUN mkdir -p /app
ADD . /app
ENV PUPPETEER_PRODUCT=firefox
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV FIREFOX_EXECUTABLE=/usr/bin/firefox
RUN yarn install
RUN yarn build
ENTRYPOINT ["tini", "--", "node", "dist/main.js"]
CMD ["server"]
EXPOSE 8080
