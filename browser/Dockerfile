FROM alpine:edge@sha256:79c2c5f6db53da44f90bb2731f29f725b5b14c378407a123776b6d3c76e6aebe
RUN apk add --update --no-cache chromium tini
ADD launcher.sh /
EXPOSE 9222
ENTRYPOINT ["/launcher.sh"]
