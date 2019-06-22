FROM alpine:3.10
RUN apk --update --no-cache add nodejs-current yarn tini chromium
WORKDIR /app
RUN mkdir -p /app
ADD . /app
RUN PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true yarn
ENV CHROMIUM_EXECUTABLE=/usr/bin/chromium-browser
ENTRYPOINT ["tini", "--", "yarn", "start"]
CMD ["server"]
EXPOSE 8080
