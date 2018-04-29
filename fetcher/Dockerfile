FROM node:alpine@sha256:bde41330043a15e404c994614b774377445deff9c676320d842aa2c87a382924
ADD yarn.lock /
ADD package.json /
RUN yarn
ADD index.js /
ENTRYPOINT ["node", "index.js"]
