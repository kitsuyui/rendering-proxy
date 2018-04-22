FROM node:alpine@sha256:5149aec8f508d48998e6230cdc8e6832cba192088b442c8ef7e23df3c6892cd3
ADD yarn.lock /
ADD package.json /
RUN yarn
ADD index.js /
ENTRYPOINT ["node", "index.js"]
