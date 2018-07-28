FROM alpine:edge@sha256:bceead3ed70699d49b11b3e53af792eddb37ebdb225d4977dabac0dc95646fb4
RUN apk --update --no-cache add nodejs-current yarn tini chromium
WORKDIR /app
RUN mkdir -p /app
ADD . /app
RUN PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true yarn
ENV CHROMIUM_EXECUTABLE=/usr/bin/chromium-browser
ENTRYPOINT ["tini", "--", "yarn", "start"]
CMD ["server"]
EXPOSE 8080
