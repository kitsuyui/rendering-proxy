FROM node:alpine
ADD yarn.lock /
ADD package.json /
RUN yarn
ADD index.js /
ENTRYPOINT ["node", "index.js"]
