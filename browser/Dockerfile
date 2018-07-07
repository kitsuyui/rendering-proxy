FROM alpine:edge@sha256:bceead3ed70699d49b11b3e53af792eddb37ebdb225d4977dabac0dc95646fb4
RUN apk add --update --no-cache chromium tini
ADD launcher.sh /
EXPOSE 9222
ENTRYPOINT ["tini", "--", "/launcher.sh"]
