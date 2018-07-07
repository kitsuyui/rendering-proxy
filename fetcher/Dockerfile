FROM node:alpine@sha256:c30b9a5bb5faba796d4df5c74310702e25bcca227786310dae9b5a08498b5e4a
RUN apk --no-cache add tini
ADD yarn.lock /
ADD package.json /
RUN PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true yarn
ADD index.js /
ENTRYPOINT ["tini", "--", "node", "index.js"]
