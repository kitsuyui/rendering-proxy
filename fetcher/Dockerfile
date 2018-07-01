FROM node:alpine@sha256:21b58de0d309e8b793fb508e610762e522074a3bd5bef6f3ff74b7bade338aec
RUN apk --no-cache add tini
ADD yarn.lock /
ADD package.json /
RUN yarn
ADD index.js /
ENTRYPOINT ["tini", "--", "node", "index.js"]
