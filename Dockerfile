FROM alpine:edge@sha256:13e33149491ce3a81a82207e8f43cd9b51bf1b8998927e57b1c2b53947961522
RUN apk --update --no-cache add nodejs-current yarn tini chromium
WORKDIR /app
RUN mkdir -p /app
ADD . /app
RUN PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true yarn
ENV CHROMIUM_EXECUTABLE=/usr/bin/chromium-browser
ENTRYPOINT ["tini", "--", "yarn", "start"]
CMD ["server"]
EXPOSE 8080
