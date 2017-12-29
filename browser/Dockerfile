FROM alpine:edge
RUN apk add --update --no-cache chromium tini
ADD launcher.sh /
EXPOSE 9222
ENTRYPOINT ["/launcher.sh"]
