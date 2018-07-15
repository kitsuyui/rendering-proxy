FROM alpine:edge@sha256:bceead3ed70699d49b11b3e53af792eddb37ebdb225d4977dabac0dc95646fb4
RUN apk --update --no-cache add nodejs-current yarn tini chromium
ADD yarn.lock .
ADD package.json .
RUN PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true yarn
ADD index.js /
ENV CHROMIUM_EXECUTABLE=/usr/bin/chromium-browser
ENTRYPOINT ["tini", "--", "node", "index.js"]
