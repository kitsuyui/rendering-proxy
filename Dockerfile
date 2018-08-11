FROM alpine:edge@sha256:8d9872bf7dc946db1b3cd2bf70752f59085ec3c5035ca1d820d30f1d1267d65d
RUN apk --update --no-cache add nodejs-current yarn tini chromium
WORKDIR /app
RUN mkdir -p /app
ADD . /app
RUN PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true yarn
ENV CHROMIUM_EXECUTABLE=/usr/bin/chromium-browser
ENTRYPOINT ["tini", "--", "yarn", "start"]
CMD ["server"]
EXPOSE 8080
